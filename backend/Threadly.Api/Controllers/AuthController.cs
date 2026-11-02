using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Threadly.Api.DTOs.Auth;
using Threadly.Api.Extensions;
using Threadly.Api.Services;

namespace Threadly.Api.Controllers;

[ApiController, Route("api/auth")]
public sealed class AuthController(AuthService auth) : ControllerBase
{
    [HttpGet("csrf")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public IActionResult Csrf([FromServices] IAntiforgery antiforgery) =>
        Ok(new { token = antiforgery.GetAndStoreTokens(HttpContext).RequestToken });

    [HttpPost("register"), EnableRateLimiting("auth")]
    public async Task<ActionResult<CurrentUserDto>> Register(RegisterRequest request) =>
        StatusCode(StatusCodes.Status201Created, await auth.RegisterAsync(request));

    [HttpPost("login"), EnableRateLimiting("auth")]
    public async Task<ActionResult<CurrentUserDto>> Login(LoginRequest request) => Ok(await auth.LoginAsync(request));

    [HttpPost("logout"), Authorize]
    public async Task<IActionResult> Logout()
    {
        await auth.LogoutAsync();
        return NoContent();
    }

    [HttpGet("me"), Authorize]
    public async Task<ActionResult<CurrentUserDto>> Me() => Ok(await auth.CurrentAsync(User.UserId()));
}
