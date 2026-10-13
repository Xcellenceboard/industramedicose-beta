import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types/database";

const DEMO_CREDENTIALS = {
  patient: {
    email: "demo.patient@industramedicose.in",
    password: "DemoPatient2026!",
    fullName: "Aarav Sharma (Patient)",
    defaultRedirect: "/patient",
  },
  doctor: {
    email: "demo.doctor@industramedicose.in",
    password: "DemoDoctor2026!",
    fullName: "Dr. Aarav Mehta (Chief OPD)",
    defaultRedirect: "/doctor",
  },
  admin: {
    email: "demo.admin@industramedicose.in",
    password: "DemoAdmin2026!",
    fullName: "System Administrator",
    defaultRedirect: "/admin",
  },
};

export async function POST(req: NextRequest) {
  try {
    const { role } = await req.json();

    if (!role || !["patient", "doctor", "admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid demo role specified." }, { status: 400 });
    }

    const credentials = DEMO_CREDENTIALS[role as keyof typeof DEMO_CREDENTIALS];

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

    const { data: authData } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    const resolvedFullName =
      authData?.user?.user_metadata?.full_name || credentials.fullName;

    const response = NextResponse.json({
      success: true,
      user: {
        id: authData?.user?.id || `demo-${role}-id`,
        email: credentials.email,
        role,
        fullName: resolvedFullName,
      },
      redirectPath: credentials.defaultRedirect,
    });

    response.cookies.set("im_demo_role", role, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
    response.cookies.set("im_user_name", resolvedFullName, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
    response.cookies.set("im_user_email", credentials.email, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    console.error("Demo login API error:", err);
    return NextResponse.json({ error: "Failed to process demo login." }, { status: 500 });
  }
}
