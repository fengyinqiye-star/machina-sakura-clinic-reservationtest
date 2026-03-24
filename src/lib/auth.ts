import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
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
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  pages: { signIn: "/admin/login" },
  callbacks: {
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user;
      const isAdminPage = nextUrl.pathname.startsWith("/admin");
      const isLoginPage = nextUrl.pathname === "/admin/login";

      if (isAdminPage && !isLoginPage && !isLoggedIn) {
        return false;
      }
      return true;
    },
  },
});
