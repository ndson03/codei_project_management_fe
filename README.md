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

Create `.env.local`:

```bash
BACKEND_BASE_URL=http://localhost:8080
NEXTAUTH_SECRET=replace-with-a-long-random-secret
NEXTAUTH_URL=http://localhost:3000
```

## Getting Started

Run the development server:

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
