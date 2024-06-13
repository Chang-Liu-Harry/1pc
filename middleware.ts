import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { NextResponse } from "next/server";

const appUrl = process.env.NEXT_PUBLIC_APP_URL;

export default authMiddleware({
  publicRoutes: [
    '/',
    '/api/webhook',
    '/sign-up',
    '/sign-in',
    '/dashboard',
  ],

  afterAuth(auth, req) {
    console.log(`************************************************************`);
    console.log(`Auth middleware triggered for URL: ${req.url}`);
    console.log(`User ID: ${auth.userId}, isPublicRoute: ${auth.isPublicRoute}`);
    console.log(`Request Headers: ${JSON.stringify(req.headers, null, 2)}`);

    const isAuthenticated = auth.userId !== null;
    let returnUrl = req.url || '/';
    if (returnUrl.includes('undefined')) {
      returnUrl = `${appUrl}/dashboard`;
    }

    if (isAuthenticated && req.nextUrl.pathname === '/') {
      // Redirect authenticated user to the dashboard
      const dashboardUrl = new URL('/dashboard', appUrl).toString();
      console.log(`Redirecting authenticated user to: ${dashboardUrl}`);
      return NextResponse.redirect(dashboardUrl);
    }

    if (!isAuthenticated && !auth.isPublicRoute) {
      const signInUrl = new URL('/sign-in', appUrl);
      signInUrl.searchParams.set('redirect_url', returnUrl);
      console.log(`Redirecting unauthenticated user to sign-in with returnBackUrl: ${returnUrl}`);
      return NextResponse.redirect(signInUrl.toString());
    }

    console.log(`User ID: ${auth.userId}, URL: ${req.url}`);
    console.log(`------------------------------------------------------------`);
    return NextResponse.next();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
