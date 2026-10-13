import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ConsentSchema } from "@/lib/validations/auth";
import { Database } from "@/types/database";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = ConsentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "All consent terms must be acknowledged." },
        { status: 400 }
      );
    }

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

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
    }

    const now = new Date().toISOString();

    // Upsert into patients table
    const { error: updateError } = await supabase
      .from("patients")
      .upsert(
        {
          profile_id: user.id,
          consent_given: true,
          consent_at: now,
          updated_at: now,
        },
        { onConflict: "profile_id" }
      );

    if (updateError) {
      console.error("Consent save error:", updateError);
      return NextResponse.json({ error: "Failed to persist clinical consent." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Clinical intake consent recorded successfully.",
      redirectPath: "/patient",
    });
  } catch (err) {
    console.error("Consent API route error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
