# CodeSquad

Friends sign in, open a private room, and solve an original coding question together. Each person first writes one private sentence about what the question is asking. When everyone in the room has sealed a sentence, those lines open and the shared editor unlocks. A pattern is kept in your deck only after a full submit passes.

Questions are original. The app does not connect to LeetCode.

## Requirements

- Node.js 22 or newer
- npm

## Run locally

```bash
npm install
copy .env.example .env
npm run dev
```

On macOS or Linux, use `cp .env.example .env` instead of `copy`.

`npm run dev` starts two processes:

- Vite, the site, at http://127.0.0.1:5173. If that port is taken, Vite prints the next free port.
- The room server on port 5000.

Vite proxies `/api` and `/socket.io` to the room server. Open the Vite address, not port 5000.

Set `JWT_SECRET` in `.env` before anyone else uses the server. Without it, tokens are signed with a development default.

| Variable | Purpose |
|---|---|
| `PORT` | Room server port. Default `5000`. |
| `CLIENT_URL` | Allowed browser origin in production, for example `https://your-app.example`. Localhost is already allowed. |
| `JWT_SECRET` | Secret for login tokens. Tokens last 7 days. |

## How a room works

1. Sign up or log in. A room uses the account name.
2. Create a room, or join with its code.
3. Each current member seals one sentence. Other people cannot read it yet.
4. When every current member has sealed, the sentences and the editor open. A person who arrives after that does not lock the room again.
5. Write a JavaScript function named `solve`. **Run** uses the sample tests. **Submit** also runs the hidden tests. Each run stops after 2 seconds.
6. A passing submit, after the room has opened, saves that question’s pattern on this browser.

One person in a room can open it by sealing their own sentence.

## Accounts and questions

- Accounts are stored in `data/users.json` (gitignored). Usernames are 3–20 letters, numbers, or underscores. Passwords are at least 6 characters and stored as hashes.
- Questions live in `data/problems.json`. The first launch copies the seed in `shared/problems.js`. Signed-in people can add a question from the hall. That writes the file. No restart is required.
- Rooms are kept in memory. A server restart clears them. Accounts and questions stay on disk.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Site and room server together. |
| `npm run build` | Build the site into `dist`. |
| `npm start` | Room server only. Serves `dist` if that folder exists. |
| `npm run preview` | Preview the built site on port 4173. This does not start rooms or login. |

## Deploy

The live app needs the Node server. Login, questions, and rooms do not work from a static host.

```bash
npm install
npm run build
npm start
```

A container build is in `Dockerfile`. [Render](https://render.com) can use `render.yaml`: build with `npm install && npm run build`, start with `node server/index.js`, and set `JWT_SECRET` and `CLIENT_URL` in the host’s environment.

## Layout

```
src/           React app (views, controllers, styles)
server/        Express, login, questions, Socket.io rooms
shared/        Seed questions
data/          users.json and problems.json, created at runtime
```
