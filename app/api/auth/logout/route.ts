import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types/database";

export async function POST() {
  try {
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

    await supabase.auth.signOut();

    const response = NextResponse.json({
      success: true,
      redirectPath: "/login",
    });

    response.cookies.delete("im_demo_role");
    response.cookies.delete("im_user_name");
    response.cookies.delete("im_user_email");

    return response;
  } catch (err) {
    console.error("Logout error:", err);
    const response = NextResponse.json({ redirectPath: "/login" });
    response.cookies.delete("im_demo_role");
    return response;
  }
}
