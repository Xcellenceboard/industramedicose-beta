import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { INITIAL_DOCTORS, DoctorProfile, getTop5DoctorsForSymptom } from "@/lib/directory-data";

interface DbDoctorRow {
  id: string;
  name: string;
  qualification: string;
  specialization: string;
  sub_specialties?: string[];
  experience_years: number;
  hospital: string;
  city: string;
  registration_no: string;
  rating: number;
  review_count: number;
  consultation_fee: number;
  modes?: ("video" | "clinic" | "hybrid")[];
  available_today: boolean;
  next_slot: string;
  languages?: string[];
  bio: string;
  tags?: string[];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.toLowerCase();
    const specialty = searchParams.get("specialty");

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

    const { data, error } = await supabase
      .from("doctors")
      .select("*")
      .order("rating", { ascending: false });

    if (error || !data || data.length === 0) {
      let list = INITIAL_DOCTORS;
      if (specialty && specialty !== "All") {
        list = list.filter((d) => d.specialization.toLowerCase().includes(specialty.toLowerCase()));
      }
      if (query) {
        list = getTop5DoctorsForSymptom(query, list);
      }
      return NextResponse.json({ success: true, doctors: list, source: "fallback" });
    }

    const rows = data as unknown as DbDoctorRow[];

    // Map database snake_case columns to DoctorProfile
    let mapped: DoctorProfile[] = rows.map((d) => ({
      id: d.id,
      name: d.name,
      qualification: d.qualification,
      specialization: d.specialization,
      subSpecialties: d.sub_specialties || [],
      experienceYears: d.experience_years,
      hospital: d.hospital,
      city: d.city,
      registrationNo: d.registration_no,
      rating: Number(d.rating),
      reviewCount: d.review_count,
      consultationFee: d.consultation_fee,
      modes: d.modes || ["video", "clinic", "hybrid"],
      availableToday: d.available_today,
      nextSlot: d.next_slot,
      languages: d.languages || ["English", "Hindi"],
      bio: d.bio,
      tags: d.tags || [],
    }));

    if (specialty && specialty !== "All") {
      mapped = mapped.filter((d) =>
        d.specialization.toLowerCase().includes(specialty.toLowerCase())
      );
    }
    if (query) {
      mapped = getTop5DoctorsForSymptom(query, mapped);
    }

    return NextResponse.json({ success: true, doctors: mapped, source: "supabase" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message, doctors: INITIAL_DOCTORS },
      { status: 500 }
    );
  }
}
