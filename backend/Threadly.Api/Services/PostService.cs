using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using Threadly.Api.Data;
using Threadly.Api.DTOs.Posts;
using Threadly.Api.Middleware;
using Threadly.Api.Models;

namespace Threadly.Api.Services;

public sealed class PostService(ApplicationDbContext db)
{
    private static readonly Expression<Func<Post, PostDto>> Projection = p => new PostDto(
        p.Id, p.Title, p.Content, new AuthorDto(p.AuthorId, p.Author.UserName!), p.CreatedAt, p.UpdatedAt);

    public async Task<PageResult<PostDto>> ListAsync(PaginationQuery query, Guid? authorId, CancellationToken ct)
    {
        var posts = db.Posts.AsNoTracking();
        if (authorId.HasValue) posts = posts.Where(p => p.AuthorId == authorId.Value);
        var count = await posts.CountAsync(ct);
        var items = await posts.OrderByDescending(p => p.CreatedAt).ThenByDescending(p => p.Id)
            .Skip((query.Page - 1) * query.PageSize).Take(query.PageSize).Select(Projection).ToListAsync(ct);
        return new PageResult<PostDto>(items, count, query.Page, query.PageSize);
    }

    public async Task<PostDto> GetAsync(Guid id, CancellationToken ct) =>
        await db.Posts.AsNoTracking().Where(p => p.Id == id).Select(Projection).SingleOrDefaultAsync(ct)
        ?? throw new ApiException(404, "This post could not be found.");

    public async Task<PostDto> CreateAsync(PostRequest request, Guid userId, CancellationToken ct)
    {
        var post = new Post { Title = request.Title.Trim(), Content = request.Content.Trim(), AuthorId = userId };
        db.Posts.Add(post);
        await db.SaveChangesAsync(ct);
        return await GetAsync(post.Id, ct);
    }

    public async Task<PostDto> UpdateAsync(Guid id, PostRequest request, Guid userId, CancellationToken ct)
    {
        var post = await GetOwnedAsync(id, userId, ct);
        post.Title = request.Title.Trim();
        post.Content = request.Content.Trim();
        post.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return await GetAsync(id, ct);
    }

    public async Task DeleteAsync(Guid id, Guid userId, CancellationToken ct)
    {
        db.Posts.Remove(await GetOwnedAsync(id, userId, ct));
        await db.SaveChangesAsync(ct);
    }

    private async Task<Post> GetOwnedAsync(Guid id, Guid userId, CancellationToken ct)
    {
        var post = await db.Posts.SingleOrDefaultAsync(p => p.Id == id, ct) ?? throw new ApiException(404, "This post could not be found.");
        if (post.AuthorId != userId) throw new ApiException(403, "Only the author can change this post.");
        return post;
    }
}
