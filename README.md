[shipyard-README.md](https://github.com/user-attachments/files/31519142/shipyard-README.md)
# Shipyard

A real-time collaborative developer productivity platform — kanban boards that sync instantly across every connected client, with AI-assisted task triage and GitHub integration built in.

## Why I built this

Most kanban tools treat "real-time" as a nice-to-have. I wanted to build one where multi-user collaboration was a first-class constraint from day one — every card move, edit, and comment needed to propagate to all connected clients with minimal latency, without conflicting updates stepping on each other. That meant solving real problems around pub/sub architecture, connection state, and keeping the UI consistent under concurrent writes — not just wiring up a CRUD app with a websocket bolted on.

## What it does

- **Real-time collaborative kanban** — board updates sync live across all connected users via Socket.io, backed by Upstash Redis pub/sub for horizontal scalability across server instances
- **GitHub OAuth + JWT auth** — secure sign-in via GitHub, session handling via JWT
- **AI task triage** — incoming tasks are automatically categorized/prioritized using the Groq API
- **GitHub webhook integration** — repo events (commits, PRs, issues) flow into the board automatically, keeping it in sync with actual dev activity
- **Analytics dashboard** — surfaces team/task activity and trends over time

## Architecture

```
Client (React) ⇄ Socket.io ⇄ Node/Express API ⇄ MongoDB Atlas
                                    │
                              Upstash Redis (pub/sub)
                                    │
                          GitHub Webhooks · Groq API
```

Deployed across Vercel (frontend), Render (backend), MongoDB Atlas (database), and Upstash (Redis).

## Tech stack

**Frontend:** React
**Backend:** Node.js, Express, Socket.io
**Database:** MongoDB Atlas
**Pub/Sub:** Upstash Redis
**Auth:** GitHub OAuth, JWT
**AI:** Groq API
**Infra:** Vercel, Render

## Running locally

```bash
git clone https://github.com/<your-username>/devboard.git
cd devboard
npm install

# Set up environment variables (see .env.example)
# - MongoDB Atlas connection string
# - Upstash Redis credentials
# - GitHub OAuth client ID/secret
# - Groq API key

npm run dev
```

## Next steps

- Add a test suite covering the real-time sync layer (board updates, concurrent edits) — currently the least-tested part of the app
- Move webhook processing off the request path and into a background queue so GitHub event spikes don't block API response times
- Add rate limiting on the API layer, particularly around webhook and AI triage endpoints
