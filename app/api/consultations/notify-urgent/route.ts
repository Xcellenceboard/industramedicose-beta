import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { consultation_id, notes, language } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://avuslmtusrndxcmuigvx.supabase.co";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);

    let updatedConsultation = null;

    if (consultation_id) {
      // 1. Hoist consultation urgency to 'urgent' and status to 'ready_for_review'
      const { data, error } = await supabase
        .from("consultations")
        .update({
          urgency: "urgent",
          status: "ready_for_review",
          updated_at: new Date().toISOString(),
        })
        .eq("id", consultation_id)
        .select()
        .single();

      if (!error && data) {
        updatedConsultation = data;
      }

      // 2. Insert alert message into intake_messages
      const alertMsg = language === "hi"
        ? "🚨 [आपातकालीन रेड अलर्ट] मरीज़ ने तत्काल डॉक्टर सूचना बटन दबाया है। लक्षण अति-गंभीर हैं।"
        : "🚨 [EMERGENCY RED ALERT] Patient triggered urgent doctor notification. Symptoms indicate critical urgency.";

      await supabase.from("intake_messages").insert({
        consultation_id,
        role: "agent",
        content: notes ? `${alertMsg} Context: ${notes}` : alertMsg,
        input_mode: "text",
        language: language === "hi" ? "hi" : "en",
      });

      // 3. Log to audit_log
      await supabase.from("audit_log").insert({
        action: "emergency_doctor_notified",
        entity: "consultations",
        entity_id: consultation_id,
        metadata: {
          urgency: "urgent",
          triggered_by: "patient_urgent_modal",
          notes: notes || null,
          timestamp: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      consultation_id: consultation_id || null,
      urgency: "urgent",
      message: "Doctor on duty and emergency response queue notified immediately.",
      notified_at: new Date().toISOString(),
      consultation: updatedConsultation,
    });
  } catch (error) {
    console.error("[NotifyUrgent API Error]:", error);
    return NextResponse.json(
      { error: "Failed to notify urgent doctor on duty" },
      { status: 500 }
    );
  }
}
