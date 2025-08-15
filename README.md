# Amazon Product Scraper — Frontend (Vite + Vanilla JS)

A lightweight UI to search Amazon and display results (title, rating, review count, image, link).  
This project is **frontend-only** and talks to a separate API via `VITE_API_BASE`.

> The UI requires a working backend endpoint compatible with:
> `GET /api/scrape?keyword=...&page=1&pages=1`  
> If you don’t have one running locally, set `VITE_API_BASE` to a deployed API.

---

## Tech

- **Vite** (dev server & build)
- **Vanilla JS + HTML + CSS** (no framework)
- Modular JS:  
  - `src/apiModel.js` — fetch wrapper  
  - `src/resultsBuilder.js` — header, pagination, cards  
  - `src/CardBuilder.js` — single product card  
  - `src/main.js` — page wiring  
  - `src/style.css` — styles

---

## Quick Start

### 1) Install deps
```bash
# from the project root
npm i
# or
bun install
