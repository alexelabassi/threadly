# Threadly

A web app for sharing posts and browsing user profiles, built with React, ASP.NET Core, and PostgreSQL.

## Prerequisites

- .NET 10 SDK
- Node.js 22.12+ and npm
- Docker with Compose, or PostgreSQL 17

## First-time setup

Run these commands from the project root:

```sh
cp .env.example .env
cp backend/Threadly.Api/appsettings.Local.json.example backend/Threadly.Api/appsettings.Local.json
```

Set a password in `.env` and use the same password in `backend/Threadly.Api/appsettings.Local.json`. Keep the database name and username consistent between both files.

```sh
docker compose up -d db
dotnet restore Threadly.slnx
dotnet tool restore
dotnet ef database update --project backend/Threadly.Api
npm --prefix frontend ci
```

If you use an existing PostgreSQL installation, enter its connection details in `appsettings.Local.json` and skip the Docker command.

## Run

Start the backend:

```sh
dotnet run --project backend/Threadly.Api
```

In a second terminal, start the frontend:

```sh
npm --prefix frontend run dev
```

Open [Threadly](http://127.0.0.1:5173/). API documentation is available at [Swagger](http://localhost:5080/swagger).

Development demo login: **`oliver_chen`** / **`ThreadlyDemo2026!`**. You can also register an account.

### This Windows workspace

The existing setup uses the SDK in `.tools/dotnet` and PostgreSQL on port **55432**. To start its database and backend from PowerShell:

```powershell
& 'C:\Program Files\PostgreSQL\17\bin\pg_ctl.exe' -D .local/postgres-dev -o '-h 127.0.0.1 -p 55432' start
.\.tools\dotnet\dotnet.exe run --project backend/Threadly.Api
```

Start the frontend in a second terminal using the command above.
