namespace Threadly.Api.DTOs.Users;

public sealed record UserDto(Guid Id, string Username, DateTime CreatedAt, int PostCount);
