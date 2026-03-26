import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { authConfig } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "メールアドレス", type: "email" },
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        if (
          credentials.email === process.env.ADMIN_EMAIL &&
          (await compare(credentials.password as string, process.env.ADMIN_PASSWORD_HASH!))
        ) {
          return {
            id: "admin",
            email: process.env.ADMIN_EMAIL,
            name: "管理者",
          };
        }
        return null;
      },
    }),
  ],
});
