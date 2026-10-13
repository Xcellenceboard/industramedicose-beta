import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { Database } from "@/types/database";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const demoRole = request.cookies.get("im_demo_role")?.value as "patient" | "doctor" | "admin" | undefined;
  const role = (user?.user_metadata?.role as "patient" | "doctor" | "admin") || demoRole || "patient";
  const isAuthenticated = !!user || !!demoRole;

  // 1. If user is logged in and visits /login or /signup, redirect to their role home
  if (isAuthenticated && (pathname === "/login" || pathname === "/signup")) {
    const target = role === "admin" ? "/admin" : role === "doctor" ? "/doctor" : "/patient";
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 2. Protect role-specific routes (except public guides)
  const isPatientRoute = pathname.startsWith("/patient");
  const isDoctorRoute = pathname.startsWith("/doctor") && pathname !== "/doctor/guide";
  const isAdminRoute = pathname.startsWith("/admin");
  const isConsentRoute = pathname === "/consent";

  if (isPatientRoute || isDoctorRoute || isAdminRoute || isConsentRoute) {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based authorization
    if (isPatientRoute && role !== "patient") {
      const forbiddenUrl = new URL("/forbidden", request.url);
      forbiddenUrl.searchParams.set("from", pathname);
      forbiddenUrl.searchParams.set("role", role);
      forbiddenUrl.searchParams.set("required", "patient");
      return NextResponse.redirect(forbiddenUrl);
    }

    if (isDoctorRoute && role !== "doctor") {
      const forbiddenUrl = new URL("/forbidden", request.url);
      forbiddenUrl.searchParams.set("from", pathname);
      forbiddenUrl.searchParams.set("role", role);
      forbiddenUrl.searchParams.set("required", "doctor");
      return NextResponse.redirect(forbiddenUrl);
    }

    if (isAdminRoute && role !== "admin") {
      const forbiddenUrl = new URL("/forbidden", request.url);
      forbiddenUrl.searchParams.set("from", pathname);
      forbiddenUrl.searchParams.set("role", role);
      forbiddenUrl.searchParams.set("required", "admin");
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/patient/:path*",
    "/doctor/:path*",
    "/admin/:path*",
    "/consent",
    "/login",
    "/signup",
  ],
};
