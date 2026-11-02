using System.ComponentModel.DataAnnotations;

namespace Threadly.Api.DTOs.Posts;

public sealed record PostRequest(
    [Required, StringLength(200)] string Title,
    [Required, StringLength(20000)] string Content);

public sealed record AuthorDto(Guid Id, string Username);
public sealed record PostDto(Guid Id, string Title, string Content, AuthorDto Author, DateTime CreatedAt, DateTime? UpdatedAt);

public sealed record PageResult<T>(IReadOnlyList<T> Items, int TotalCount, int Page, int PageSize)
{
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
}

public sealed class PaginationQuery
{
    [Range(1, 100000)] public int Page { get; init; } = 1;
    [Range(1, 50)] public int PageSize { get; init; } = 10;
}
