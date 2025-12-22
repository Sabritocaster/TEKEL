export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      const isProtected =
        nextUrl.pathname.startsWith('/dashboard') ||
        nextUrl.pathname.startsWith('/products') ||
        nextUrl.pathname.startsWith('/stock-movements') ||
        nextUrl.pathname.startsWith('/reports') ||
        nextUrl.pathname.startsWith('/audit-logs');

      if (isProtected && !isLoggedIn) {
        return false;
      }

      return true;
    },
  },
};
