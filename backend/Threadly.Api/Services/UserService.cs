using Microsoft.EntityFrameworkCore;
using Threadly.Api.Data;
using Threadly.Api.DTOs.Users;
using Threadly.Api.Middleware;

namespace Threadly.Api.Services;

public sealed class UserService(ApplicationDbContext db)
{
    public async Task<UserDto> GetAsync(string username, CancellationToken ct)
    {
        var normalized = username.ToUpperInvariant();
        return await db.Users.AsNoTracking().Where(u => u.NormalizedUserName == normalized)
            .Select(u => new UserDto(u.Id, u.UserName!, u.CreatedAt, u.Posts.Count)).SingleOrDefaultAsync(ct)
            ?? throw new ApiException(404, "This member could not be found.");
    }
}
