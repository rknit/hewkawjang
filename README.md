# HewKawJang

## Requirements

- node.js
- npm
- docker
- [expo orbit](https://expo.dev/orbit) (for mobile development)

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
# Type 'i' to open in IOS sim (require expo orbit)
npx expo start
```

## Backend

Set up backend project

```bash
cd backend
npm i
```

Copy `.env.dev.template` and paste it as `.env` for dev environment

```bash
# Or run this command in mac or linux
cp .env.dev.template .env
```

The server should be running at `localhost:8080` when running this command

```bash
npm start
```
