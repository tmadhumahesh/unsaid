# Unsaid

What you wish you could say but can't.

Type something you could never say out loud — then either **release it into the void** or **burn it forever**.

## Features

- **Share as Card** — generates a beautiful canvas image or animated GIF of your message with gold emblems, glow lines, and gradient text
- **Share on social media** — one-click share to X/Twitter, Facebook, and LinkedIn with the card image attached (mobile) or URL (desktop)
- **Copy Share Link** — copies a URL with your message encoded; the recipient sees it as a response prompt
- **Your Void** — every released message stored in your personal collection with filters (Today / This Week / This Month / All), text search, individual delete, and reset
- **Light / Dark theme** — toggle with system preference detection, persisted in localStorage
- **Zero friction** — no signup, no accounts, fully client-side

## Deploy

Fully static — deploy the `public/` folder to any static host (Cloudflare Pages, Netlify, Vercel, GitHub Pages).

```bash
npm run deploy   # pushes main branch → Cloudflare Pages auto-deploy
```

## Run locally

```bash
node server.js
```

Open http://localhost:3000.

## Stack

- Plain HTML, CSS, JavaScript (no framework, no build step)
- Canvas API for share card generation
- [gif.js](https://github.com/jnordberg/gif.js) for animated GIF output (local worker at `/gif.worker.js`)
- Web Share API for sharing card images on mobile
- localStorage for released messages
- Express (local dev server only)
- Cloudflare Pages for hosting
