using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Threadly.Api.DTOs.Posts;
using Threadly.Api.Extensions;
using Threadly.Api.Services;

namespace Threadly.Api.Controllers;

[ApiController, Route("api/posts")]
public sealed class PostsController(PostService posts) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PageResult<PostDto>>> List([FromQuery] PaginationQuery query, CancellationToken ct) =>
        Ok(await posts.ListAsync(query, null, ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PostDto>> Get(Guid id, CancellationToken ct) => Ok(await posts.GetAsync(id, ct));

    [HttpPost, Authorize]
    public async Task<ActionResult<PostDto>> Create(PostRequest request, CancellationToken ct)
    {
        var post = await posts.CreateAsync(request, User.UserId(), ct);
        return CreatedAtAction(nameof(Get), new { id = post.Id }, post);
    }

    [HttpPut("{id:guid}"), Authorize]
    public async Task<ActionResult<PostDto>> Update(Guid id, PostRequest request, CancellationToken ct) =>
        Ok(await posts.UpdateAsync(id, request, User.UserId(), ct));

    [HttpDelete("{id:guid}"), Authorize]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await posts.DeleteAsync(id, User.UserId(), ct);
        return NoContent();
    }
}
