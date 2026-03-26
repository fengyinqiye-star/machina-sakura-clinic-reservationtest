import type { NextAuthConfig } from "next-auth";

// Edge Runtime 対応の軽量設定（bcrypt不使用）
// middleware からはこちらを参照する
export const authConfig: NextAuthConfig = {
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  providers: [],
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
};
