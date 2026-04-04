# Bookmark Vault — Frontend

Lưu, gắn tag, tìm kiếm bookmark với URL metadata tự động (title, favicon, description), tổ chức theo thư mục, chia sẻ collection.

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- TanStack Query
- Zustand (auth store, theme store)
- React Router v6
- Sonner (toasts)
- Framer Motion (spring physics)

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Environment

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | `/api/v1` |

## Pages

| Route | Description |
|---|---|
| `/login` | Login |
| `/` | Bookmark list + search |
| `/folders` | Folder tree |
| `/add` | Add bookmark |

## API

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/vault/bookmarks` | GET | List bookmarks |
| `/api/v1/vault/bookmarks` | POST | Create bookmark |
| `/api/v1/vault/folders` | GET | List folders |
| `/api/v1/vault/folders` | POST | Create folder |
| `/api/v1/vault/dashboard` | GET | Dashboard summary |

## Auth

Shares JWT auth with `portfolio-platform`. Login via `/api/v1/auth/login` or Google OAuth2.

## Vite Proxy

Dev proxy forwards `/api` → Cloud Run production. No local backend needed.
