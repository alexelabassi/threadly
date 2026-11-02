# Verification

Verified locally on 2 November 2026 using .NET SDK 10.0.403, Node 22.13, and PostgreSQL 17.2.

- Release solution build: **zero warnings, zero errors**.
- xUnit HTTP integration suite: **12 passed**.
- Frontend TypeScript / Vite production build: **passed**.
- ESLint, Prettier, and `dotnet format` checks: **passed**.
- EF Core initial migration: applied successfully to a fresh PostgreSQL database.
- EF migration snapshot check: no pending model changes.
- Backend NuGet audit, including transitive dependencies: no reported vulnerable packages.
- Live PostgreSQL API: real seed feed, cookie login/session restoration, forbidden cross-user PUT/DELETE (403), owner deletion (204), and deleted record lookup (404).
- Browser: registration, validation, login/logout, reload persistence, create/edit, author profile, empty own-posts state, pagination, deletion confirmation/cancellation, and theme toggle.
- Responsive DOM width checks at 390, 768, and 1440px: no horizontal page overflow. Desktop light and mobile dark layouts inspected visually. Browser console reported no errors at the final check.
- Temporary QA account and post were removed after checks; the original four demo users and ten posts remain.

Screenshots: [desktop light](screenshots/desktop-light.jpg), [mobile dark](screenshots/mobile-dark.jpg).

The production build emits two upstream Zod comment-annotation warnings; the build succeeds and Rollup discards those comments. Docker CLI is absent on this machine, so Compose itself was not run; native PostgreSQL 17 was used for live database verification. The included GitHub Actions workflow has not been executed remotely.

The README documents normal setup and this machine's isolated, ignored local tooling. Preview processes were shut down after verification.
