using Microsoft.AspNetCore.Identity;
using Threadly.Api.DTOs.Auth;
using Threadly.Api.Middleware;
using Threadly.Api.Models;

namespace Threadly.Api.Services;

public sealed class AuthService(UserManager<ApplicationUser> users, SignInManager<ApplicationUser> signIn)
{
    public async Task<CurrentUserDto> RegisterAsync(RegisterRequest request)
    {
        var user = new ApplicationUser { Id = Guid.NewGuid(), UserName = request.Username.Trim(), Email = request.Email.Trim() };
        var result = await users.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = result.Errors.GroupBy(e => e.Code.Contains("Password", StringComparison.Ordinal) ? "password" : e.Code.Contains("Email", StringComparison.Ordinal) ? "email" : "username")
                .ToDictionary(g => g.Key, g => g.Select(e => e.Description).ToArray());
            throw new ApiException(400, "Please check your registration details.", errors);
        }
        await signIn.SignInAsync(user, isPersistent: true);
        return ToDto(user);
    }

    public async Task<CurrentUserDto> LoginAsync(LoginRequest request)
    {
        var identifier = request.UsernameOrEmail.Trim();
        var user = identifier.Contains('@') ? await users.FindByEmailAsync(identifier) : await users.FindByNameAsync(identifier);
        if (user is null) throw new ApiException(401, "The username, email, or password is incorrect.");
        var result = await signIn.PasswordSignInAsync(user, request.Password, isPersistent: true, lockoutOnFailure: true);
        if (result.IsLockedOut) throw new ApiException(429, "Too many attempts. Please try again in 15 minutes.");
        if (!result.Succeeded) throw new ApiException(401, "The username, email, or password is incorrect.");
        return ToDto(user);
    }

    public Task LogoutAsync() => signIn.SignOutAsync();

    public async Task<CurrentUserDto> CurrentAsync(Guid id)
    {
        var user = await users.FindByIdAsync(id.ToString()) ?? throw new ApiException(401, "Please sign in again.");
        return ToDto(user);
    }

    private static CurrentUserDto ToDto(ApplicationUser user) => new(user.Id, user.UserName!, user.Email!, user.CreatedAt);
}
