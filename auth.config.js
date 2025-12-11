export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard') ||
                nextUrl.pathname.startsWith('/products') ||
                nextUrl.pathname.startsWith('/stock-movements') ||
                nextUrl.pathname.startsWith('/reports') ||
                nextUrl.pathname === '/'; // Protect root as well

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                if (nextUrl.pathname === '/login') {
                    return Response.redirect(new URL('/', nextUrl));
                }
                return true;
            }
            return true;
        },
    },
    providers: [], // Add providers with an empty array for now
};
