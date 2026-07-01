# Unsaid

What you wish you could say but can't.

A web app where you type something you could never say out loud — then either **release it into the void** or **burn it forever**.

## Viral features

- **Share as Card** — generates a beautiful canvas image of your message to post on social media
- **Copy Share Link** — one click copies a URL with your message; send it to someone
- **Response chain** — when someone opens your link, they see your message and can respond with their own
- **Your Void** — every released message stays in your personal collection, browse it anytime
- **Light / Dark theme** — toggle or automatic based on system preference
- **Zero friction** — no signup, no accounts, just type and go

## Deploy (free, forever)

Push to GitHub and connect to Cloudflare Pages:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Pages** → **Connect to Git**
2. Pick this repo
3. Build command: *(leave blank)*
4. Build output directory: `public`
5. Click **Deploy**

Your site lives at `https://your-project.pages.dev`. Free tier: unlimited requests, no sleeping.

## Run locally

```bash
node server.js
```

Open http://localhost:3000.

## Stack

- Plain HTML, CSS, JavaScript
- Express (local dev only)
- Canvas API for share card generation
- localStorage for your released messages
