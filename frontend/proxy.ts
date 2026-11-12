import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Must match AUTH_COOKIE in backend/src/auth/auth.constants.ts.
const AUTH_COOKIE = "raresidence_session";

type Role = "ADMIN" | "TENANT";

const HOME_FOR_ROLE: Record<Role, string> = { ADMIN: "/admin", TENANT: "/tenant" };

// Optimistic check only: this reads the JWT's payload WITHOUT verifying its
// signature, just to redirect early. A forged cookie gets nothing more than an
// empty dashboard shell, because the API verifies the token on every request.
function readSession(request: NextRequest): { role: Role } | null {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const payload = token?.split(".")[1];
  if (!payload) return null;
  try {
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const { role, exp } = JSON.parse(json) as { role?: string; exp?: number };
    if (typeof exp !== "number" || exp * 1000 <= Date.now()) return null;
    if (role !== "ADMIN" && role !== "TENANT") return null;
    return { role };
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = readSession(request);

  if (pathname === "/login") {
    // Already logged in: skip the login form.
    return session
      ? NextResponse.redirect(new URL(HOME_FOR_ROLE[session.role], request.url))
      : NextResponse.next();
  }

  if (!session) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname + search);
    return NextResponse.redirect(login);
  }

  // Send each role to its own area instead of a page it can't use.
  const area: Role = pathname.startsWith("/admin") ? "ADMIN" : "TENANT";
  if (session.role !== area) {
    return NextResponse.redirect(new URL(HOME_FOR_ROLE[session.role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/tenant/:path*", "/login"],
};
