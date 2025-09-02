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

Start the project by running this command

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

Once you've filled out all empty fields in `.env`, you can run the server by using this command

```bash
# Server should be available at localhost:8080
npm start
```
