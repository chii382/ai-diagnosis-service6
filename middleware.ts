import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const pathname = request.nextUrl.pathname;
  const session = request.auth;
  if (!session?.user) {
    const signIn = new URL("/auth/signin", request.nextUrl.origin);
    signIn.searchParams.set("callbackUrl", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(signIn);
  }
  return NextResponse.next();
});

export const config = { matcher: ["/diagnosis/:path*", "/dashboard", "/profile", "/admin/:path*"] };
