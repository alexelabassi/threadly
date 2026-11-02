using System.ComponentModel.DataAnnotations;

namespace Threadly.Api.DTOs.Auth;

public sealed record RegisterRequest(
    [Required, StringLength(24, MinimumLength = 3), RegularExpression("^[a-zA-Z0-9_]+$", ErrorMessage = "Use only letters, numbers, and underscores.")] string Username,
    [Required, EmailAddress, StringLength(254)] string Email,
    [Required, StringLength(128, MinimumLength = 10)] string Password);

public sealed record LoginRequest(
    [Required, StringLength(254)] string UsernameOrEmail,
    [Required, StringLength(128)] string Password);

public sealed record CurrentUserDto(Guid Id, string Username, string Email, DateTime CreatedAt);
