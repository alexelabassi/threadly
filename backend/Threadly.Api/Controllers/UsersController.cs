using Microsoft.AspNetCore.Mvc;
using Threadly.Api.DTOs.Posts;
using Threadly.Api.DTOs.Users;
using Threadly.Api.Services;

namespace Threadly.Api.Controllers;

[ApiController, Route("api/users")]
public sealed class UsersController(UserService users, PostService posts) : ControllerBase
{
    [HttpGet("{username}")]
    public async Task<ActionResult<UserDto>> Get(string username, CancellationToken ct) => Ok(await users.GetAsync(username, ct));

    [HttpGet("{username}/posts")]
    public async Task<ActionResult<PageResult<PostDto>>> Posts(string username, [FromQuery] PaginationQuery query, CancellationToken ct)
    {
        var user = await users.GetAsync(username, ct);
        return Ok(await posts.ListAsync(query, user.Id, ct));
    }
}
