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
    ├── index.ts                # Main application entry point (add `app.use(router/middleware)` here)
    ├── db/
    │   └── schema.ts           # Database schema definitions
    ├── route/                  # All HewKawJang API Routes
    │   └── *.route.ts          # Put API Route here (e.g. `/users` is `user.api.ts`)
    ├── middleware/             # Reusable middlewares
    │   └── *.middleware.ts     # Put middleware here
    └── service/                # Code that interact with database or 3rd-party API
        └── *.service.ts        # Put business logic here (e.g. user management is `user.service.ts`)
```

### Database Sync

When updating `schema.ts`, run this command to sync Supabase DB

```bash
npm run sync:db
```

If the command hangs, try changing `SUPABASE_DB_URL` port in `.env` file to `5432`, and re-run the command.

### Vercel

Don't do anything related to Vercel in backend for now.
