# HewKawJang

Restaurant reservation application

## Table of Contents

- [Development](#development)
- [Docker Compose (Production)](#docker-compose-production)
- [Environment Variables](#environment-variables)

## Development

### Frontend Development

See [frontend/README.md](./frontend/README.md)

### Backend Development

See [backend/README.md](./backend/README.md)

### Local Development (Both)

```bash
# Install dependencies for both frontend and backend
npm install

# Run both frontend and backend in development mode
npm run dev
```

## Docker Compose (Production)

Run the application in production mode using Docker Compose. This setup builds and deploys both the backend API and frontend web application in containers.

### Prerequisites

- Docker and Docker Compose installed
- Supabase project set up (for database and storage)

### Quick Start

1. **Create environment file:**
   ```bash
   cp .env.production.template .env.production
   ```

2. **Edit `.env.production`** with your actual credentials (see [Environment Variables](#environment-variables) below)

3. **Build and start containers:**
   ```bash
   docker-compose --env-file .env.production up --build -d
   ```

4. **Access the application:**
   - **Frontend:** http://localhost
   - **Backend API:** http://localhost/api

### Docker Commands

```bash
# Build and start containers in detached mode
docker-compose --env-file .env.production up --build -d

# View logs (all services)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop containers
docker-compose down

# Rebuild and restart
docker-compose --env-file .env.production down
docker-compose --env-file .env.production up --build -d
```

### Architecture

The Docker Compose setup includes:

- **Backend Container** (Node.js/Express)
  - Runs compiled TypeScript application
  - Connects to Supabase database and storage
  - Exposes port 8080 internally

- **Frontend Container** (nginx)
  - Serves static Expo web build
  - Proxies `/api/*` requests to backend container
  - Exposes port 80 externally

- **Docker Network**
  - Internal bridge network for container communication
  - Backend accessible to frontend via hostname `backend`

## Environment Variables

All environment variables are configured in `.env.production` file.

### Frontend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `FRONTEND_URL` | Public URL where frontend is hosted | `http://localhost` |
| `EXPO_PUBLIC_BACKEND_URL` | Backend API URL (from frontend's perspective) | `http://localhost/api` |
| `EXPO_PUBLIC_SUPABASE_PROJ_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key for client-side auth | `eyJhbGci...` |

### Backend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `EMAIL_USER` | Email address for sending notifications (SMTP) | `your-email@gmail.com` |
| `EMAIL_PASS` | Email password or app-specific password | `your-app-password` |
| `SUPABASE_PROJ_URL` | Supabase project URL (same as frontend) | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (backend only, has admin privileges) | `eyJhbGci...` |
| `SUPABASE_DB_URL` | PostgreSQL connection string for Supabase database | `postgresql://postgres...` |
| `ACCESS_TOKEN_SECRET` | Supabase JWT secret for signing/verifying access tokens | `your-super-secret-jwt-token-with-at-least-32-characters-long` |
| `REFRESH_TOKEN_SECRET` | Secret key for signing JWT refresh tokens (generate random string) | `random-secret-string` |
| `STRIPE_SK_API` | Stripe secret key for payment processing | `sk_test_...` or `sk_live_...` |

### How to Get These Values

1. **Supabase Variables:**
   - Go to your [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Go to **Settings** → **API**
   - Copy `URL`, `anon/public key`, and `service_role key`
   - For `SUPABASE_DB_URL`: Go to **Settings** → **Database** → Connection String (URI)
   - For `ACCESS_TOKEN_SECRET`: Go to **Settings** → **API** → **JWT Settings** → Copy the `JWT Secret`

2. **Email Variables:**
   - For Gmail: Enable 2FA and generate an [App Password](https://myaccount.google.com/apppasswords)
   - Use your email as `EMAIL_USER` and app password as `EMAIL_PASS`

3. **Refresh Token Secret:**
   - Generate a random string (64+ characters recommended):
     ```bash
     openssl rand -base64 64
     ```
   - Use this for `REFRESH_TOKEN_SECRET` only
   - **Note:** `ACCESS_TOKEN_SECRET` comes from Supabase (see step 1), do NOT generate it

4. **Stripe API Key:**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/)
   - **Developers** → **API Keys**
   - Use test key for development, live key for production

### Security Notes

- **Never commit `.env.production`** to version control (it's in `.gitignore`)
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret - it has admin access to your database
- Use strong random strings for JWT secrets
- Use Stripe test keys for development, live keys only in production
