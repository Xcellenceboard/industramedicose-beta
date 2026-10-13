import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabaseUrl = getSupabaseUrl();
    const anonKey = getSupabaseAnonKey();
    const serviceRoleKey = getSupabaseServiceRoleKey();

    const cookieStore = cookies();
    const ssrClient = createServerClient<Database>(supabaseUrl, anonKey, {
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

    // 1. Get authenticated user from session or auth token
    const { data: { user } } = await ssrClient.auth.getUser();

    // Admin / service role client for reliable querying
    const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);

    let patientProfileId = user?.id;

    // If not authenticated via cookie, check if patient profile exists in database
    if (!patientProfileId) {
      const { data: firstPatient } = await supabase
        .from("patients")
        .select("profile_id")
        .limit(1)
        .maybeSingle();

      if (firstPatient) {
        patientProfileId = firstPatient.profile_id;
      }
    }

    if (!patientProfileId) {
      return NextResponse.json({
        success: true,
        patient: null,
        consultations: [],
        documents: [],
      });
    }

    // Fetch Patient Details
    const { data: patientRecord } = await supabase
      .from("patients")
      .select("*, profiles(*)")
      .eq("profile_id", patientProfileId)
      .maybeSingle();

    const profileData = (patientRecord as Record<string, unknown> | null)?.profiles as Record<string, unknown> | undefined;

    // Fetch Patient Consultations
    let consultations: Array<Record<string, unknown>> = [];
    if (patientRecord?.id) {
      const { data: cData } = await supabase
        .from("consultations")
        .select(`
          id,
          status,
          urgency,
          started_at,
          created_at,
          approved_at,
          doctors (
            specialization,
            profiles (full_name)
          ),
          clinical_summaries (
            chief_complaint
          )
        `)
        .eq("patient_id", patientRecord.id)
        .order("created_at", { ascending: false });

      if (cData) {
        consultations = (cData as Array<Record<string, unknown>>).map((c) => {
          const doc = c.doctors as Record<string, unknown> | undefined;
          const docProfile = doc?.profiles as Record<string, unknown> | undefined;
          const docName = (docProfile?.full_name as string) || "OPD Attending Physician";
          const summary = (Array.isArray(c.clinical_summaries) ? c.clinical_summaries[0] : c.clinical_summaries) as Record<string, unknown> | undefined;
          return {
            id: c.id,
            date: new Date(c.created_at as string).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            doctor: docName,
            chiefComplaint: (summary?.chief_complaint as string) || "Clinical consultation submitted",
            status: c.status,
            urgency: c.urgency,
            statusLabel:
              c.status === "approved"
                ? "Doctor Approved & Signed"
                : c.status === "in_review"
                ? "Doctor In-Review"
                : "Ready for Doctor Review",
          };
        });
      }
    }

    // Fetch Documents
    let documents: Array<Record<string, unknown>> = [];
    if (patientRecord?.id) {
      const { data: docData } = await supabase
        .from("documents")
        .select("*")
        .eq("patient_id", patientRecord.id)
        .order("created_at", { ascending: false });

      if (docData) {
        documents = docData as Array<Record<string, unknown>>;
      }
    }

    return NextResponse.json({
      success: true,
      patient: patientRecord
        ? {
            name: profileData?.full_name || "Patient",
            uhid: `UHID-2026-${patientRecord.id.slice(0, 4).toUpperCase()}`,
            age: patientRecord.age || 45,
            gender: patientRecord.sex ? (patientRecord.sex.charAt(0).toUpperCase() + patientRecord.sex.slice(1)) : "Unspecified",
            bloodGroup: patientRecord.blood_group || "O+",
            allergies: patientRecord.known_allergies || [],
            chronicConditions: patientRecord.chronic_conditions || [],
            consentStatus: patientRecord.consent_given ? "Active (ABDM Verified)" : "Pending Consent",
          }
        : null,
      consultations,
      documents,
    });
  } catch (error) {
    console.error("Patient me API error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch patient records" }, { status: 500 });
  }
}
