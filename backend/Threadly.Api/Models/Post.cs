namespace Threadly.Api.Models;

public sealed class Post
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Title { get; set; }
    public required string Content { get; set; }
    public Guid AuthorId { get; set; }
    public ApplicationUser Author { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
