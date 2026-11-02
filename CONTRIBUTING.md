# Contributing to Threadly

Keep the project easy for another student to understand. Prefer small changes with clear names over new architectural layers.

- Put backend business rules in services, HTTP concerns in controllers, persistence configuration in `Data`, and contracts in DTOs. Do not return EF entities or introduce generic repositories around EF Core.
- Enforce write permissions on the server. Use Identity for account/password behavior and the shared antiforgery filter for unsafe HTTP methods. Keep new endpoints within the requested users/posts scope unless the team deliberately expands it.
- Use async EF operations with cancellation tokens and UTC timestamps. Schema changes require a named migration and the generated model snapshot. Never modify a migration already applied by teammates; add another migration.
- Organize frontend work by feature. Keep API calls out of presentation components, type contracts explicitly, and use TanStack Query for server data. Use React Hook Form and Zod for forms.
- Use the shared `api` client for authenticated mutations, reusable UI components for controls, and semantic HTML with labels and keyboard focus states. Check light/dark themes and narrow layouts. Do not introduce controls without behavior.
- Use PascalCase for C# types/methods, camelCase for TypeScript values, and kebab-case for frontend filenames. Follow `.editorconfig`, ESLint, Prettier, and `dotnet format`.
- Never commit `.env`, `appsettings.Local.json`, credentials, generated builds, database files, or local tooling. Demo users belong only in the development seeder.

Before a pull request, run the checks in the README. Add a focused HTTP integration test for new business rules or authorization behavior; avoid tests that only repeat implementation details. Apply migrations against PostgreSQL after a schema change. Include the user-visible change and validation results in the PR description; include UI screenshots when helpful.
