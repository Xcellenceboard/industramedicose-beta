import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { LoginSchema } from "@/lib/validations/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { Database } from "@/types/database";

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

    // 2. Rate Limiting
    const rateLimitKey = `login:${ip}:${email.toLowerCase()}`;
    const rateCheck = checkRateLimit(rateLimitKey, 5, 60);
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
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
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
      }
    );

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || "Invalid email or password." },
        { status: 401 }
      );
    }

    // 4. Determine User Role accurately
    let role: "patient" | "doctor" | "admin" = "patient";

    // Check profiles table first
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (profile?.role) {
      role = profile.role as "patient" | "doctor" | "admin";
    } else if (authData.user.user_metadata?.role) {
      role = authData.user.user_metadata.role as "patient" | "doctor" | "admin";
    } else if (rolePreference) {
      role = rolePreference;
    } else if (email.toLowerCase().includes("doctor") || email.toLowerCase().includes("dr.")) {
      role = "doctor";
    } else if (email.toLowerCase().includes("admin")) {
      role = "admin";
    }

    const fullName =
      profile?.full_name ||
      authData.user.user_metadata?.full_name ||
      (role === "doctor" ? "Dr. " + email.split("@")[0] : email.split("@")[0]);

    // Check if patient has given consent
    let redirectPath = `/${role}`;
    if (role === "patient") {
      const { data: patientRecord } = await supabase
        .from("patients")
        .select("consent_given")
        .eq("profile_id", authData.user.id)
        .maybeSingle();

      if (patientRecord && !patientRecord.consent_given) {
        redirectPath = "/consent";
      }
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role,
        fullName,
      },
      redirectPath,
    });

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
