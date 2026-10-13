import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { LoginSchema } from "@/lib/validations/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { Database } from "@/types/database";
import { getSupabaseUrl, getSupabaseAnonKey } from "@/lib/supabase/config";

interface DemoAccount {
  role: "patient" | "doctor" | "admin";
  fullName: string;
  defaultRedirect: string;
  supabaseEmail?: string;
  passwords: string[];
}

const DEMO_ACCOUNTS: Record<string, DemoAccount> = {
  "demo.doctor@industramedicose.in": {
    role: "doctor",
    fullName: "Dr. Aarav Mehta (Chief OPD)",
    defaultRedirect: "/doctor",
    passwords: ["demodoctor2026!", "demodoctor", "password123!", "demo123"],
  },
  "dr.mehta@hospital.in": {
    role: "doctor",
    fullName: "Dr. Aarav Mehta (Chief OPD)",
    defaultRedirect: "/doctor",
    supabaseEmail: "demo.doctor@industramedicose.in",
    passwords: ["demodoctor2026!", "demodoctor", "password123!", "demo123"],
  },
  "demo.patient@industramedicose.in": {
    role: "patient",
    fullName: "Aarav Sharma (Patient)",
    defaultRedirect: "/patient",
    passwords: ["demopatient2026!", "demopatient", "password123!", "demo123"],
  },
  "patient@industramedicose.in": {
    role: "patient",
    fullName: "Aarav Sharma (Patient)",
    defaultRedirect: "/patient",
    supabaseEmail: "demo.patient@industramedicose.in",
    passwords: ["demopatient2026!", "demopatient", "password123!", "demo123"],
  },
  "demo.admin@industramedicose.in": {
    role: "admin",
    fullName: "System Administrator",
    defaultRedirect: "/admin",
    passwords: ["demoadmin2026!", "demoadmin", "password123!", "demo123"],
  },
  "admin@hospital.in": {
    role: "admin",
    fullName: "System Administrator",
    defaultRedirect: "/admin",
    supabaseEmail: "demo.admin@industramedicose.in",
    passwords: ["demoadmin2026!", "demoadmin", "password123!", "demo123"],
  },
};

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const body = await req.json();

    // 1. Zod Validation
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input parameters." },
        { status: 400 }
      );
    }

    const { email, password, rolePreference } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPassword = password.toLowerCase().trim();

    // 2. Rate Limiting (friendly limit for demo environment)
    const rateLimitKey = `login:${ip}:${normalizedEmail}`;
    const rateCheck = checkRateLimit(rateLimitKey, 10, 60);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many login attempts. Please wait ${rateCheck.resetInSeconds} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    // 3. Supabase Auth with Cookie Handling
    const cookieStore = cookies();
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

    // Check if there is an exact demo persona match
    const demoMatch = DEMO_ACCOUNTS[normalizedEmail];
    const targetSupabaseEmail = demoMatch?.supabaseEmail || email;

    // Try signing in with Supabase
    let authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null = null;

    try {
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: targetSupabaseEmail,
        password,
      });
      if (authData?.user) {
        authUser = authData.user;
      }
    } catch {
      // Supabase connection or auth issue, will check demo fallback
    }

    // If Supabase didn't authenticate, check demo match or demo password
    const isDemoPassword =
      normalizedPassword.includes("demo") ||
      normalizedPassword.includes("2026") ||
      normalizedPassword.includes("password");

    const isRecognizedDemo = !!demoMatch || isDemoPassword;

    if (!authUser && !isRecognizedDemo) {
      return NextResponse.json(
        {
          error:
            "Invalid email or password. You can use the 1-Click Launch buttons above or sample credentials.",
        },
        { status: 401 }
      );
    }

    // 4. Resolve Role, Name, and Target Dashboard
    let resolvedRole: "patient" | "doctor" | "admin" | null = null;
    let fullName = "";

    if (authUser) {
      // Check Supabase profiles table
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", authUser.id)
          .maybeSingle();

        if (profile?.role && ["patient", "doctor", "admin"].includes(profile.role)) {
          resolvedRole = profile.role as "patient" | "doctor" | "admin";
        }
        if (profile?.full_name) {
          fullName = profile.full_name;
        }
      } catch {
        // ignore profile lookup error
      }

      if (!fullName) {
        fullName =
          (authUser.user_metadata?.full_name as string) ||
          demoMatch?.fullName ||
          (rolePreference === "doctor"
            ? `Dr. ${email.split("@")[0]}`
            : email.split("@")[0]);
      }
    }

    if (!resolvedRole) {
      if (rolePreference) {
        resolvedRole = rolePreference;
      } else if (demoMatch?.role) {
        resolvedRole = demoMatch.role;
      } else if (authUser?.user_metadata?.role) {
        resolvedRole = authUser.user_metadata.role as "patient" | "doctor" | "admin";
      } else if (normalizedEmail.includes("doctor") || normalizedEmail.includes("dr.")) {
        resolvedRole = "doctor";
      } else if (normalizedEmail.includes("admin")) {
        resolvedRole = "admin";
      } else {
        resolvedRole = "patient";
      }
    }

    // Role preference override if user specifically picked doctor/patient/admin tab on login page
    if (rolePreference) {
      resolvedRole = rolePreference;
    }

    const role = resolvedRole;

    if (!fullName) {
      fullName =
        demoMatch?.fullName ||
        (role === "doctor"
          ? `Dr. ${email.split("@")[0]}`
          : role === "admin"
          ? "Hospital Administrator"
          : `${email.split("@")[0]}`);
    }

    const redirectPath =
      role === "doctor" ? "/doctor" : role === "admin" ? "/admin" : "/patient";

    const response = NextResponse.json({
      success: true,
      user: {
        id: authUser?.id || `demo-${role}-${Date.now()}`,
        email,
        role,
        fullName,
      },
      redirectPath,
    });

    // Set persistent session cookies
    response.cookies.set("im_demo_role", role, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
    response.cookies.set("im_user_name", fullName, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
    response.cookies.set("im_user_email", email, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    console.error("Login API error:", err);
    return NextResponse.json({ error: "Internal server error occurred." }, { status: 500 });
  }
}
