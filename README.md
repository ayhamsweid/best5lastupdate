# Besiktas City Guide

Public site + Admin panel + NestJS API in a single repo.

## Local Development

**Legacy SPA frontend**
1. `npm install`
2. `npm run dev`
3. Open `http://localhost:3000`

**SEO SSR frontend**
1. `cd ../best5-next`
2. `npm install`
3. `API_INTERNAL_BASE_URL=http://localhost:4000/api NEXT_PUBLIC_API_BASE_URL=/api npm run dev`
4. Open `http://localhost:3000`

**Backend**
1. `cd server`
2. `npm install`
3. Copy `.env.example` to `.env` and update values
4. Start Postgres: `docker compose up -d db`
5. Run migrations: `npx prisma migrate dev`
6. Start API: `npm run start:dev`
7. API docs: `http://localhost:4000/api/docs`

## Build + Preview

1. `npm run build`
2. `npm run preview`

## Production Deployment

- Public website: Next.js SSR app in `../best5-next`
- Admin: legacy Vite SPA under `/admin`
- API: NestJS under `/api`
- Uploads: served from `/uploads`
- Gateway: nginx routes public traffic to Next.js and `/admin` to the legacy SPA
- Next.js server components should use `API_INTERNAL_BASE_URL`
- Any future browser-side fetches in Next should use `/api`, not `http://server:4000/api`

Suggested cutover:
1. Build and run `deployment/docker-compose.prod.yml`
2. Verify `/ar`, `/en`, article URLs, category URLs, `/robots.txt`, and `/sitemap.xml`
3. Verify `/admin` still loads correctly
4. Check raw HTML with `view-source:` and `curl`

## Routing

- Public: `/ar`, `/en`, `/ar/blog`, `/en/blog`, `/ar/category/:slug`, `/ar/search?q=...`, `/ar/compare/:slug`
- Admin: `/admin/login`, `/admin/dashboard`, `/admin/users`, `/admin/posts`, `/admin/categories`, `/admin/tags`, `/admin/logs`, `/admin/settings`
- API: `/api/*`
