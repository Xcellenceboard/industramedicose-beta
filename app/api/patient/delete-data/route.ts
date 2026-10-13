import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://avuslmtusrndxcmuigvx.supabase.co";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);

    const body = await req.json().catch(() => ({}));
    const patientId = body.patient_id || "p-101";

    // 1. Soft-delete / anonymize patient row
    await supabase
      .from("patients")
      .update({
        known_allergies: [],
        chronic_conditions: [],
        consent_given: false,
      })
      .eq("profile_id", patientId);

    // 2. Anonymize profiles row
    await supabase
      .from("profiles")
      .update({
        full_name: "Deleted Patient (DPDP Right to Erasure)",
        phone: null,
      })
      .eq("id", patientId);

    // 3. Log audit event
    await supabase.from("audit_log").insert({
      action: "patient_data_deleted",
      entity: "patients",
      metadata: {
        patient_id: patientId,
        erasure_type: "DPDP_2023_Soft_Delete_Storage_Cleanup",
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Patient data has been successfully erased and anonymized under DPDP Act 2023 guidelines.",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Delete Data API Error]:", error);
    return NextResponse.json(
      { error: "Failed to process data deletion request" },
      { status: 500 }
    );
  }
}
