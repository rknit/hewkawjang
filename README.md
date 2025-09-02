# HewKawJang

## Requirements

- node.js
- npm
- docker

## Frontend

Set up frontend project

```bash
cd frontend
npm i
```

Try running

```bash
# When running the project
# Type 'w' to open in web
# Type 'i' to open in IOS sim
npx expo start
```

## Backend

Spin-up database

```bash
docker run -d --name hewkawjang-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=hewkawjang -p 5432:5432 postgres
```

Set up backend project

```bash
cd backend
npm i
```

Rename `.env.dev.template` to `.env` for dev environment

```bash
mv .env.dev.template .env
```

The server should be running at `localhost:8080` when running this command

```bash
npm start
```
