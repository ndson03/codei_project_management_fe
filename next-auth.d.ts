import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    tokenType?: string;
    role?: string;
    user: DefaultSession["user"];
  }

  interface User {
    accessToken?: string;
    tokenType?: string;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    tokenType?: string;
    role?: string;
  }
}