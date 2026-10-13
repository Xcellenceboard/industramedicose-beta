import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { INITIAL_REVIEWS } from "@/lib/directory-data";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId");

    const cookieStore = cookies();
    const supabase = createServerClient(
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

    let query = supabase.from("reviews").select("*").order("created_at", { ascending: false });
    if (doctorId) {
      query = query.eq("doctor_id", doctorId);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      const filtered = doctorId
        ? INITIAL_REVIEWS.filter((r) => r.doctorId === doctorId)
        : INITIAL_REVIEWS;
      return NextResponse.json({ success: true, reviews: filtered, source: "fallback" });
    }

    return NextResponse.json({ success: true, reviews: data, source: "supabase" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { doctorId, patientName, rating, comment, language } = body;

    const cookieStore = cookies();
    const supabase = createServerClient(
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

    const { data, error } = await supabase.from("reviews").insert({
      id: `rev-${Date.now().toString(36)}`,
      doctor_id: doctorId || "doc-meera",
      patient_name: patientName || "Verified Patient",
      rating: Number(rating) || 5,
      comment: comment || "Great treatment!",
      language: language || "hinglish",
    }).select().single();

    if (error) {
      return NextResponse.json({
        success: true,
        fallback: true,
        review: {
          id: `rev-${Date.now()}`,
          patientName,
          rating,
          comment,
        },
      });
    }

    return NextResponse.json({ success: true, review: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
