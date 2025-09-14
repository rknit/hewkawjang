# HewKawJang Backend

## Requirements

- node.js
- npm

## How to Setup

```bash
# make sure you're in the 'backend' directory
cd backend
npm i
```

Copy `.env.dev.template` and paste it as `.env` for dev environment
then fill all empty fields in `.env`

To start the backend, run

```bash
# Server should be available at localhost:8080.
# The server also reload automatically when making changes.
npm run dev
```

## How to Develop

### Backend project structure

```text
backend/
└── src/
    ├── index.ts                    # Main application entry point (add `app.use(router/middleware)` here)
    ├── db/
    │   └── schema.ts               # Database schema definitions
    ├── routes/                     # All HewKawJang API Routes
    │   ├── *.routes.ts             # Put API Route here (e.g. `/users` is `user.routes.ts`)
    │   └── *.routes.test.ts        # Put tests for routes here
    ├── middleware/                 # Reusable middlewares
    │   ├── *.middleware.ts         # Put middleware here
    │   └── *.middleware.test.ts    # Put tests for middlewares here
    └── service/                    # Code that interact with database or 3rd-party API
        ├── *.service.ts            # Put business logic here (e.g. user management is `user.service.ts`)
        └── *.service.test.ts       # Put tests for services here
```

### Test

```bash
npm run test
```

### Database Sync

When updating `schema.ts`, run this command to sync Supabase DB

```bash
npm run sync:db
```

If the command hangs, try changing `SUPABASE_DB_URL` port in `.env` file to `5432`, and re-run the command.

### Vercel

Don't do anything related to Vercel in backend for now.

### Auth APIs

We use JWT for auth, and due to frontend being multi-platform, we'll have to set this header when sending requests to auth APIs.

On web, set header `hkj-auth-client-type`: `web`
On mobile, set header `hkj-auth-client-type`: `mobile`

### Bypassing auth for development env

#### Postman

To use the `test` user, set this headers:
    - `hkj-auth-bypass` to `true`

To login as any user do the following:
    - send `POST` to `/auth/bypass-login`
    - set these headers: `hkj-auth-bypass` to `true`, `hkj-auth-client-type` to `web`
    - set body: { "email": "ANY@EMAIL\.COM" }
    - use accessToken in authorization header (bearer token) to do auth
    - if get `401 unauthorized`, login again
