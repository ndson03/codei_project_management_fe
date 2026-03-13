import { getServerSession, type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

type BackendLoginResponse = {
  accessToken: string;
  tokenType: string;
};

function decodeRoleFromJwt(accessToken: string): string | undefined {
  try {
    const payload = accessToken.split(".")[1];
    if (!payload) {
      return undefined;
    }

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    const decoded = Buffer.from(base64 + padding, "base64").toString("utf8");
    const parsed = JSON.parse(decoded) as { role?: unknown };

    return typeof parsed.role === "string" ? parsed.role : undefined;
  } catch {
    return undefined;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const username = credentials?.username?.toString().trim();
        const password = credentials?.password?.toString();

        if (!username || !password) {
          return null;
        }

        const backendUrl = process.env.BACKEND_BASE_URL;
        if (!backendUrl) {
          throw new Error("Missing BACKEND_BASE_URL environment variable.");
        }

        const normalizedBaseUrl = backendUrl.replace(/\/+$/, "");
        const response = await fetch(`${normalizedBaseUrl}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
          cache: "no-store",
        });

        if (response.status === 401) {
          return null;
        }

        if (response.status === 403) {
          throw new Error("FORBIDDEN");
        }

        if (!response.ok) {
          throw new Error("LOGIN_FAILED");
        }

        const data = (await response.json()) as BackendLoginResponse;

        if (!data.accessToken || !data.tokenType) {
          return null;
        }

        return {
          id: username,
          name: username,
          accessToken: data.accessToken,
          tokenType: data.tokenType,
          role: decodeRoleFromJwt(data.accessToken),
        };
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.accessToken = user.accessToken;
        token.tokenType = user.tokenType;
        token.role = user.role;
      }

      if (typeof token.accessToken === "string" && !token.role) {
        token.role = decodeRoleFromJwt(token.accessToken);
      }

      return token;
    },
    session: ({ session, token }) => {
      if (typeof token.accessToken === "string") {
        session.accessToken = token.accessToken;
      }

      if (typeof token.tokenType === "string") {
        session.tokenType = token.tokenType;
      }

      if (typeof token.role === "string") {
        session.role = token.role;
      }

      return session;
    },
  },
};

export function getServerAuthSession() {
  return getServerSession(authOptions);
}