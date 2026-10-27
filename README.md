# CodeSquad

A private hall where two people read a question, each seal one sentence about what it is asking, and only then share a page of code.

## Run

```bash
npm install
npm run dev
```

The site is at http://127.0.0.1:5173 (or the next free port). The room server listens on port 5000.

Copy `.env.example` to `.env` and set `JWT_SECRET` before you share the server.

Accounts are stored in `data/users.json`. Questions are stored in `data/problems.json` and can be added from the hall after login.
