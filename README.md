Next.js App Router project with NextAuth credentials login integrated to backend JWT.

## Auth Flow

- Login endpoint: `POST /api/auth/login`
- Request body:

```json
{
	"username": "string",
	"password": "string"
}
```

- Success response:

```json
{
	"accessToken": "jwt_token_here",
	"tokenType": "Bearer"
}
```

- Frontend stores JWT in NextAuth JWT session.
- Protected calls must send: `Authorization: Bearer <accessToken>`.
- FE handles:
	- `401`: invalid login or invalid/expired token
	- `403`: authenticated but insufficient role

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `BACKEND_BASE_URL` | Base URL of the backend API (e.g. `http://localhost:8080`) |
| `NEXTAUTH_SECRET` | Long random secret used by NextAuth to sign/encrypt tokens. Generate one with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Full URL your app is served on (e.g. `http://localhost:3000`). Required in production. |

> **Note:** All three variables are required. Missing `NEXTAUTH_SECRET` or `NEXTAUTH_URL` will cause NextAuth errors at runtime.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Copy and configure environment variables:

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

- `/login`: login form using NextAuth credentials provider
- `/`: home page, requires authenticated session

## Calling Protected Backend API

Server-side helper is available at `lib/backend-api.ts`:

```ts
import { fetchBackend } from "@/lib/backend-api";

const response = await fetchBackend("/api/projects");
const data = await response.json();
```
