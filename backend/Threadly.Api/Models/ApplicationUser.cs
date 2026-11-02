using Microsoft.AspNetCore.Identity;

namespace Threadly.Api.Models;

public sealed class ApplicationUser : IdentityUser<Guid>
{
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Post> Posts { get; set; } = new List<Post>();
}
