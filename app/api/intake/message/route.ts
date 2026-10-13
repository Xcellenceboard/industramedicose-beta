import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { orchestrator } from "@/agents/orchestrator";
import { intakeMessagesStore } from "@/agents/store";
import { createAdminClient } from "@/lib/supabase/admin";
import { globalSafetyEngine } from "@/agents/safety-rules-engine";

const IntakeMessageRequestSchema = z.object({
  consultation_id: z.string().min(1, "consultation_id is required"),
  message: z.string().min(1, "message cannot be empty"),
  input_mode: z.enum(["voice", "text"]).default("text"),
  language: z.enum(["en", "hi", "hinglish"]).default("en"),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = IntakeMessageRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input payload" },
        { status: 400 }
      );
    }

    const { consultation_id, message, input_mode, language } = parsed.data;

    // 1. Log patient message to persistent store
    intakeMessagesStore.addMessage(consultation_id, {
      role: "patient",
      content: message,
      language,
    });

    // Attempt remote Supabase write
    try {
      const supabase = createAdminClient();
      await supabase.from("intake_messages").insert({
        consultation_id,
        role: "patient",
        content: message,
        input_mode,
        language,
      });
    } catch {
      // Non-blocking fallback
    }

    // 2. LAYER 1: DETERMINISTIC INSTANT SAFETY INTERRUPT
    const safetyCheck = globalSafetyEngine.evaluate(message);

    if (safetyCheck.is_urgent) {
      // Update consultation urgency to urgent in Supabase & push to top of queue
      try {
        const supabase = createAdminClient();
        await supabase
          .from("consultations")
          .update({
            urgency: "urgent",
            status: "ready_for_review",
          })
          .eq("id", consultation_id);
      } catch {
        // Non-blocking
      }

      const alertMessage =
        language === "hi"
          ? "आपके लक्षणों पर तत्काल चिकित्सकीय ध्यान देने की आवश्यकता है। कृपया तुरंत 112 पर कॉल करें या नजदीकी अस्पताल जाएं।"
          : "Your symptoms may need immediate attention. Please call 112 or go to the nearest hospital now.";

      intakeMessagesStore.addMessage(consultation_id, {
        role: "agent",
        content: alertMessage,
        language,
      });

      return NextResponse.json({
        success: true,
        is_urgent: true,
        urgency: "urgent",
        safety_check: safetyCheck,
        next_question: alertMessage,
        is_intake_complete: true,
        interrupted: true,
        is_suicide_ideation: safetyCheck.is_suicide_ideation,
        helpline_info: safetyCheck.helpline_info,
        covered_aspects: ["chief_complaint", "severity", "urgent_triage"],
      });
    }

    // 3. Fetch conversation history for this consultation
    const history = intakeMessagesStore.getMessages(consultation_id).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // 3. Run PatientInteractionAgent via Orchestrator
    const result = await orchestrator.processIntakeMessage(
      consultation_id,
      message,
      history,
      language === "hi" ? "hi" : "en"
    );

    // 4. Save agent's reply to history
    intakeMessagesStore.addMessage(consultation_id, {
      role: "agent",
      content: result.next_question,
      language: result.question_language,
    });

    try {
      const supabase = createAdminClient();
      await supabase.from("intake_messages").insert({
        consultation_id,
        role: "agent",
        content: result.next_question,
        input_mode: "text",
        language: result.question_language,
      });
    } catch {
      // Non-blocking fallback
    }

    return NextResponse.json({
      success: true,
      consultation_id,
      ...result,
    });
  } catch (error: unknown) {
    console.error("[POST /api/intake/message] Error:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to process intake message" },
      { status: 500 }
    );
  }
}
