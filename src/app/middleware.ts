import { NextResponse } from "next/server";

export function middleware(request: Request) {
  const isAuthenticated = request.headers.get("cookie")?.includes("authToken");

  // Redirect to login if the user is not authenticated
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  
  return NextResponse.next();
}

// Apply middleware only to protected routes
export const config = {
  matcher: ["/dashboard/:path*"], // Protects /dashboard and its subpages
};
