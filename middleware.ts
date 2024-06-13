import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: [
    '/',
    '/api/webhook',
    '/sign-up',  // Ensure the sign-up page is also public
    '/sign-in',   // Ensure the sign-in page is also public
    '/dashboard'
  ],

  afterAuth(auth, req) {
    console.log(`Auth middleware triggered for URL: ${req.url}`);
    console.log(`User ID: ${auth.userId}, isPublicRoute: ${auth.isPublicRoute}`);

    if (auth.userId && auth.isPublicRoute) {
      let path = '/dashboard'
      const dashboard = new URL(path, req.url);
      console.log(`Redirecting authenticated user to: ${dashboard}`);
      return NextResponse.redirect(dashboard);
    }

    if (!auth.userId && !auth.isPublicRoute) {
      console.log(`Redirecting unauthenticated user to sign-in`);
      return redirectToSignIn({
        returnBackUrl: req.url,
      });
    }

    console.log(`User ID: ${auth.userId}, URL: ${req.url}`);
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
