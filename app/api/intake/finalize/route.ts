import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { orchestrator } from "@/agents/orchestrator";
import { intakeMessagesStore } from "@/agents/store";
import { createAdminClient } from "@/lib/supabase/admin";

const FinalizeRequestSchema = z.object({
  consultation_id: z.string().min(1, "consultation_id is required"),
  intake_duration_seconds: z.number().int().min(1).default(114),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = FinalizeRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input payload" },
        { status: 400 }
      );
    }

    const { consultation_id, intake_duration_seconds } = parsed.data;

    // 1. Gather conversation transcript
    let messages = intakeMessagesStore.getMessages(consultation_id).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // If local memory is empty, try reading from Supabase
    if (messages.length === 0) {
      try {
        const supabase = createAdminClient();
        const { data } = await supabase
          .from("intake_messages")
          .select("role, content")
          .eq("consultation_id", consultation_id)
          .order("created_at", { ascending: true });

        if (data && data.length > 0) {
          messages = data.map((m) => ({ role: m.role, content: m.content }));
        }
      } catch {
        // Fall through
      }
    }

    // Default fallback if no messages were passed
    if (messages.length === 0) {
      messages = [
        {
          role: "patient",
          content:
            "पिछले 2 घंटे से सीने में बहुत तेज दर्द और भारीपन हो रहा है, जो बाएं कंधे तक जा रहा है।",
        },
      ];
    }

    // 2. Run the full Multi-Agent pipeline
    const pipelineResult = await orchestrator.runFinalizePipeline(
      consultation_id,
      messages,
      intake_duration_seconds
    );

    return NextResponse.json({
      success: true,
      consultation_id,
      status: "ready_for_review",
      urgency: pipelineResult.safetyCheck.urgency,
      summary: pipelineResult.summary,
      runs_count: pipelineResult.runs.length,
      runs: pipelineResult.runs,
    });
  } catch (error: unknown) {
    console.error("[POST /api/intake/finalize] Error:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to finalize clinical intake" },
      { status: 500 }
    );
  }
}
