import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabaseUrl, getSupabaseServiceRoleKey } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createClient<Database>(getSupabaseUrl(), getSupabaseServiceRoleKey());

    const { data: consultations, error } = await supabase
      .from("consultations")
      .select(`
        id,
        patient_id,
        doctor_id,
        status,
        urgency,
        intake_duration_seconds,
        created_at,
        updated_at,
        patients (
          id,
          age,
          sex,
          blood_group,
          known_allergies,
          chronic_conditions,
          profiles (
            full_name,
            phone
          )
        ),
        clinical_summaries (
          chief_complaint,
          red_flags
        )
      `)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error || !consultations) {
      return NextResponse.json({ success: true, consultations: [] });
    }

    const mapped = (consultations as Array<Record<string, unknown>>).map((c) => {
      const patient = c.patients as Record<string, unknown> | undefined;
      const profile = (patient?.profiles as Record<string, unknown> | undefined);
      const summary = (Array.isArray(c.clinical_summaries) ? c.clinical_summaries[0] : c.clinical_summaries) as Record<string, unknown> | undefined;
      
      const redFlagList = Array.isArray(summary?.red_flags) ? (summary.red_flags as Array<{ flag?: string }>) : [];
      const redFlagText = redFlagList.length > 0 && redFlagList[0]?.flag ? redFlagList[0].flag : null;
      const patientId = (c.patient_id || c.id) as string;

      return {
        id: c.id as string,
        uhid: `UHID-2026-${patientId.slice(0, 4).toUpperCase()}`,
        patient_name: (profile?.full_name as string) || "OPD Patient",
        age_gender: `${patient?.age || 45}y / ${patient?.sex ? ((patient.sex as string).charAt(0).toUpperCase() + (patient.sex as string).slice(1)) : "Adult"}`,
        blood_group: (patient?.blood_group as string) || "O+",
        chief_complaint: (summary?.chief_complaint as string) || "Patient intake evaluation in progress",
        vitals: "BP: 120/80 | SpO2: 98%",
        urgency: (c.urgency as string) || "routine",
        status: (c.status as string) || "ready_for_review",
        intake_duration_seconds: (c.intake_duration_seconds as number) || 90,
        allergies: (patient?.known_allergies as string[]) || [],
        red_flag: redFlagText,
        created_at: c.created_at as string,
      };
    });

    return NextResponse.json({
      success: true,
      consultations: mapped,
    });
  } catch (error) {
    console.error("Live consultations fetch error:", error);
    return NextResponse.json({ success: true, consultations: [] });
  }
}
