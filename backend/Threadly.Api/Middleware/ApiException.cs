namespace Threadly.Api.Middleware;

public sealed class ApiException(int statusCode, string message, IDictionary<string, string[]>? errors = null)
    : Exception(message)
{
    public int StatusCode { get; } = statusCode;
    public IDictionary<string, string[]>? Errors { get; } = errors;
}
