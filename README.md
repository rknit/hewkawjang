# HewKawJang

## Requirements

- node.js
- npm
- [expo orbit](https://expo.dev/orbit) (for mobile development)

## How to develop on Frontend

Set up frontend project

```bash
# make sure you're in the 'frontend' directory
cd frontend
npm i
```

Start the project by running this command

```bash
# When running the project
# Type 'w' to open in web
# Type 'i' to open in IOS sim (require expo orbit)
npx expo start
```

## How to develop on Backend

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
