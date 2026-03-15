# Besiktas City Guide

Public site + Admin panel + NestJS API in a single repo.

## Local Development

**Legacy SPA frontend**
1. `npm install`
2. `npm run dev`
3. Open `http://localhost:3000`

**SEO SSR frontend**
1. `cd best5-next`
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

- Legacy production stack: single Vite SPA + NestJS API via `deployment/docker-compose.prod.yml`
- SEO-safe Next.js production stack: `deployment/docker-compose.next-stack.yml`
- API: NestJS under `/api`
- Uploads: served from `/uploads`
- Next.js frontend now lives inside this repo at `best5-next/`
- Next.js server components should use `API_INTERNAL_BASE_URL`
- Browser-side fetches in Next should use `/api`, not `http://server:4000/api`

Suggested cutover:
1. Build and run `deployment/docker-compose.next-stack.yml`
2. Verify `/ar`, `/en`, article URLs, category URLs, `/robots.txt`, `/sitemap.xml`, and `/_next/*`
3. Verify `/admin` still loads correctly
4. Verify `/api` and `/uploads`

## Routing

- Public: `/ar`, `/en`, `/ar/blog`, `/en/blog`, `/ar/category/:slug`, `/ar/search?q=...`, `/ar/compare/:slug`
- Admin: `/admin/login`, `/admin/dashboard`, `/admin/users`, `/admin/posts`, `/admin/categories`, `/admin/tags`, `/admin/logs`, `/admin/settings`
- API: `/api/*`
