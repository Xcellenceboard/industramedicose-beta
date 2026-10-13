import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types/database";
import { getSupabaseUrl, getSupabaseAnonKey } from "@/lib/supabase/config";

function clearAuthCookies(response: NextResponse, allCookieNames: string[]) {
  const explicitNames = [
    "im_demo_role",
    "im_user_name",
    "im_user_email",
    "im_auth_state",
    "supabase-auth-token",
    "sb-access-token",
    "sb-refresh-token",
  ];

  for (const name of explicitNames) {
    response.cookies.set(name, "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
      sameSite: "lax",
    });
    try {
      response.cookies.delete(name);
    } catch {
      // ignore
    }
  }

  // Clear any cookies starting with sb- or im_
  for (const name of allCookieNames) {
    if (name.startsWith("sb-") || name.startsWith("im_") || name.startsWith("supabase")) {
      response.cookies.set(name, "", {
        path: "/",
        maxAge: 0,
        expires: new Date(0),
        sameSite: "lax",
      });
      try {
        response.cookies.delete(name);
      } catch {
        // ignore
      }
    }
  }
}

async function performSignOut(cookieStore: ReturnType<typeof cookies>) {
  try {
    const supabase = createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    });

    // Fast local signOut with 1s timeout to ensure it never hangs
    await Promise.race([
      supabase.auth.signOut({ scope: "local" }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Signout timeout")), 1000)),
    ]);
  } catch {
    // Non-fatal - proceed to cookie clearance
  }
}

export async function POST() {
  const cookieStore = cookies();
  const allCookieNames = cookieStore.getAll().map((c) => c.name);

  await performSignOut(cookieStore);

  const response = NextResponse.json({
    success: true,
    redirectPath: "/login",
    message: "Logged out successfully.",
  });

  clearAuthCookies(response, allCookieNames);
  return response;
}

export async function GET(req: NextRequest) {
  const cookieStore = cookies();
  const allCookieNames = cookieStore.getAll().map((c) => c.name);

  await performSignOut(cookieStore);

  const targetUrl = new URL("/login?logged_out=1", req.url);
  const response = NextResponse.redirect(targetUrl);

  clearAuthCookies(response, allCookieNames);
  return response;
}
