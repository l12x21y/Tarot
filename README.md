# Interpretive Friction

## What this adds

This app now records every user and assistant message to a small local backend.

## Run locally

1. Start the recording backend:

```bash
npm run server
```

2. Start the frontend:

```bash
npm run dev
```

3. Open the app and use a reading as normal. Logged events are persisted to `data/session-records.sqlite`.

## Environment

Use `.env` for local secrets and provider selection:

- `VITE_LLM_PROVIDER=gemini|openai|qwen`
- `VITE_GEMINI_API_KEY=...`
- `VITE_GEMINI_MODEL=gemini-2.5-flash`
- `VITE_OPENAI_API_KEY=...`
- `VITE_OPENAI_MODEL=gpt-4o-mini`
- `VITE_OPENAI_BASE_URL=https://api.openai.com/v1/chat/completions`
- `VITE_QWEN_API_KEY=...`
- `VITE_QWEN_MODEL=qwen-plus`
- `VITE_QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`
- `VITE_RECORDING_API_BASE_URL=/api`

## Netlify deployment notes

If data is not syncing when using your Netlify link, the most common reason is that `/api` on Netlify returns 404.

Why:

- Netlify serves static frontend files only.
- Your logging API lives in your separate Node backend.

Required setup:

1. Deploy backend to a public URL (Render/Railway/Fly etc.), for example:
	- `https://your-backend.example.com`
2. In Netlify Site Settings -> Environment variables, set:
	- `VITE_RECORDING_API_BASE_URL=https://your-backend.example.com/api`
3. Redeploy Netlify so the new env is baked into the frontend build.
4. In backend environment, set:
	- `ALLOWED_ORIGIN=https://test0415.netlify.app`

Quick checks:

- `https://test0415.netlify.app/api/health` returning 404 means Netlify has no backend route.
- `https://your-backend.example.com/api/health` should return `{ "ok": true }`.

## API

- `POST /api/logs` appends one event to SQLite.
- `GET /api/health` returns a simple health check.
- `GET /api/logs?sessionId=...&limit=100&offset=0` queries events.
- `GET /api/export?format=json` exports all events as JSON.
- `GET /api/export?format=csv` exports all events as CSV.