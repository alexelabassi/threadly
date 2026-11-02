using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Threadly.Api.Middleware;

public sealed class ApiExceptionHandler(IProblemDetailsService problems, ILogger<ApiExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception exception, CancellationToken cancellationToken)
    {
        if (exception is OperationCanceledException && cancellationToken.IsCancellationRequested)
            return false;

        var status = exception is ApiException api ? api.StatusCode : StatusCodes.Status500InternalServerError;
        var message = exception is ApiException ? exception.Message : "Something went wrong. Please try again.";
        if (exception is DbUpdateException { InnerException: PostgresException { SqlState: PostgresErrorCodes.UniqueViolation } })
        {
            status = StatusCodes.Status409Conflict;
            message = "That username or email is already in use.";
        }
        if (status >= 500) logger.LogError(exception, "Unhandled request error {TraceId}", context.TraceIdentifier);

        context.Response.StatusCode = status;
        ProblemDetails details = exception is ApiException { Errors: not null } validation
            ? new ValidationProblemDetails(validation.Errors)
            : new ProblemDetails();
        details.Status = status;
        details.Title = message;
        details.Extensions["traceId"] = context.TraceIdentifier;
        return await problems.TryWriteAsync(new ProblemDetailsContext { HttpContext = context, ProblemDetails = details });
    }
}
