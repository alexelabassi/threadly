using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Threadly.Api.DTOs.Auth;
using Threadly.Api.DTOs.Posts;
using Xunit;

namespace Threadly.Api.Tests;

public sealed class ApiTests : IDisposable
{
    private readonly TestApplication app = new();

    private static async Task<HttpResponseMessage> SendAsync(HttpClient client, HttpMethod method, string path, object? body = null, bool csrf = true)
    {
        using var request = new HttpRequestMessage(method, path);
        if (body is not null) request.Content = JsonContent.Create(body);
        if (csrf)
        {
            var tokens = await client.GetFromJsonAsync<JsonElement>("/api/auth/csrf");
            request.Headers.Add("X-CSRF-TOKEN", tokens.GetProperty("token").GetString());
        }
        return await client.SendAsync(request);
    }

    private static async Task<CurrentUserDto> RegisterAsync(HttpClient client, string name)
    {
        using var response = await SendAsync(client, HttpMethod.Post, "/api/auth/register", new { username = name, email = $"{name}@example.test", password = "TestPassword123!" });
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        return (await response.Content.ReadFromJsonAsync<CurrentUserDto>())!;
    }

    private static async Task<PostDto> CreatePostAsync(HttpClient client, string title = "A test perspective")
    {
        using var response = await SendAsync(client, HttpMethod.Post, "/api/posts", new { title, content = "Something meaningful to share." });
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(response.Headers.Location);
        return (await response.Content.ReadFromJsonAsync<PostDto>())!;
    }

    [Theory]
    [InlineData("ab", "valid@example.test", "TestPassword123!")]
    [InlineData("invalid name", "valid@example.test", "TestPassword123!")]
    [InlineData("valid_name", "not-an-email", "TestPassword123!")]
    [InlineData("valid_name", "valid@example.test", "short")]
    public async Task Registration_rejects_invalid_details(string username, string email, string password)
    {
        using var client = app.Session();
        using var response = await SendAsync(client, HttpMethod.Post, "/api/auth/register", new { username, email, password });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task Authentication_uses_persistent_http_only_cookies_and_logout_clears_session()
    {
        using var client = app.Session();
        using var anonymous = await client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.Unauthorized, anonymous.StatusCode);
        await RegisterAsync(client, "test_writer");
        var me = await client.GetFromJsonAsync<CurrentUserDto>("/api/auth/me");
        Assert.Equal("test_writer", me?.Username);
        using var logout = await SendAsync(client, HttpMethod.Post, "/api/auth/logout");
        Assert.Equal(HttpStatusCode.NoContent, logout.StatusCode);
        using var loggedOut = await client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.Unauthorized, loggedOut.StatusCode);
        using var wrongPassword = await SendAsync(client, HttpMethod.Post, "/api/auth/login", new { usernameOrEmail = "test_writer", password = "wrong-password" });
        Assert.Equal(HttpStatusCode.Unauthorized, wrongPassword.StatusCode);
        using var login = await SendAsync(client, HttpMethod.Post, "/api/auth/login", new { usernameOrEmail = "test_writer@example.test", password = "TestPassword123!" });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        var cookie = Assert.Single(login.Headers.GetValues("Set-Cookie"), c => c.StartsWith("Threadly.Session=", StringComparison.Ordinal));
        Assert.Contains("httponly", cookie, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("expires=", cookie, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("secure", cookie, StringComparison.OrdinalIgnoreCase);
        Assert.Equal("test_writer", (await client.GetFromJsonAsync<CurrentUserDto>("/api/auth/me"))?.Username);
    }

    [Fact]
    public async Task Registration_rejects_duplicate_username_and_email_case_insensitively()
    {
        using var first = app.Session();
        using var second = app.Session();
        await RegisterAsync(first, "unique_writer");
        using var duplicate = await SendAsync(second, HttpMethod.Post, "/api/auth/register", new { username = "UNIQUE_WRITER", email = "UNIQUE_WRITER@example.test", password = "TestPassword123!" });
        Assert.Equal(HttpStatusCode.BadRequest, duplicate.StatusCode);
    }

    [Fact]
    public async Task State_changes_require_antiforgery_token_including_registration()
    {
        using var client = app.Session();
        using var response = await SendAsync(client, HttpMethod.Post, "/api/auth/register", new { username = "csrf_writer", email = "csrf@example.test", password = "TestPassword123!" }, csrf: false);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await RegisterAsync(client, "csrf_writer");
        using var post = await SendAsync(client, HttpMethod.Post, "/api/posts", new { title = "Hello", content = "World" }, csrf: false);
        Assert.Equal(HttpStatusCode.BadRequest, post.StatusCode);
    }

    [Fact]
    public async Task Post_creation_requires_authentication_and_validates_content()
    {
        using var client = app.Session();
        using var anonymous = await SendAsync(client, HttpMethod.Post, "/api/posts", new { title = "Hello", content = "World" });
        Assert.Equal(HttpStatusCode.Unauthorized, anonymous.StatusCode);
        var user = await RegisterAsync(client, "post_writer");
        using var invalid = await SendAsync(client, HttpMethod.Post, "/api/posts", new { title = " ", content = " " });
        Assert.Equal(HttpStatusCode.BadRequest, invalid.StatusCode);
        var post = await CreatePostAsync(client);
        Assert.Equal(user.Id, post.Author.Id);
        Assert.Equal("A test perspective", post.Title);
        using var publicClient = app.Session();
        var read = await publicClient.GetFromJsonAsync<PostDto>($"/api/posts/{post.Id}");
        Assert.Equal(post.Id, read?.Id);
    }

    [Theory]
    [InlineData("PUT")]
    [InlineData("DELETE")]
    public async Task Another_user_cannot_modify_or_delete_a_post(string method)
    {
        using var author = app.Session();
        using var other = app.Session();
        await RegisterAsync(author, "actual_author");
        await RegisterAsync(other, "another_writer");
        var post = await CreatePostAsync(author);
        using var forbidden = await SendAsync(other, new HttpMethod(method), $"/api/posts/{post.Id}", method == "PUT" ? new { title = "Stolen", content = "Changed" } : null);
        Assert.Equal(HttpStatusCode.Forbidden, forbidden.StatusCode);
        Assert.Equal(post.Title, (await author.GetFromJsonAsync<PostDto>($"/api/posts/{post.Id}"))?.Title);
    }

    [Fact]
    public async Task Author_can_edit_and_delete_their_post()
    {
        using var client = app.Session();
        await RegisterAsync(client, "owner_writer");
        var post = await CreatePostAsync(client);
        using var update = await SendAsync(client, HttpMethod.Put, $"/api/posts/{post.Id}", new { title = "Refined perspective", content = "A better second draft." });
        Assert.Equal(HttpStatusCode.OK, update.StatusCode);
        var edited = await update.Content.ReadFromJsonAsync<PostDto>();
        Assert.Equal("Refined perspective", edited?.Title);
        Assert.NotNull(edited?.UpdatedAt);
        using var deletion = await SendAsync(client, HttpMethod.Delete, $"/api/posts/{post.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deletion.StatusCode);
        using var missing = await client.GetAsync($"/api/posts/{post.Id}");
        Assert.Equal(HttpStatusCode.NotFound, missing.StatusCode);
    }

    [Fact]
    public async Task Feed_is_paginated_newest_first_and_profiles_filter_posts_without_exposing_email()
    {
        using var client = app.Session();
        await RegisterAsync(client, "feed_writer");
        await CreatePostAsync(client, "First");
        await CreatePostAsync(client, "Second");
        await CreatePostAsync(client, "Third");
        var page = await client.GetFromJsonAsync<PageResult<PostDto>>("/api/posts?page=1&pageSize=2");
        Assert.NotNull(page);
        Assert.Equal(3, page.TotalCount);
        Assert.Equal(2, page.TotalPages);
        Assert.Equal(2, page.Items.Count);
        Assert.Equal("Third", page.Items[0].Title);
        var next = await client.GetFromJsonAsync<PageResult<PostDto>>("/api/posts?page=2&pageSize=2");
        Assert.Single(next!.Items);
        Assert.Equal("First", next.Items[0].Title);
        var profilePosts = await client.GetFromJsonAsync<PageResult<PostDto>>("/api/users/FEED_WRITER/posts");
        Assert.Equal(3, profilePosts?.TotalCount);
        var profile = await client.GetFromJsonAsync<JsonElement>("/api/users/feed_writer");
        Assert.False(profile.TryGetProperty("email", out _));
        using var invalidPage = await client.GetAsync("/api/posts?page=0&pageSize=100");
        Assert.Equal(HttpStatusCode.BadRequest, invalidPage.StatusCode);
    }

    public void Dispose() => app.Dispose();
}
