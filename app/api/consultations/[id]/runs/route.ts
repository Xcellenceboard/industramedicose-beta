import { NextRequest, NextResponse } from "next/server";
import { agentRunsStore } from "@/agents/store";
import { createAdminClient } from "@/lib/supabase/admin";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const consultationId = params.id;

    if (!consultationId) {
      return NextResponse.json(
        { error: "Consultation ID is required" },
        { status: 400 }
      );
    }

    // 1. Fetch runs from in-memory fallback store
    const localRuns = agentRunsStore.getRuns(consultationId);

    // 2. Try fetching from Supabase agent_runs
    let remoteRuns: Record<string, unknown>[] = [];
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("agent_runs")
        .select("*")
        .eq("consultation_id", consultationId)
        .order("created_at", { ascending: true });

      if (!error && data && data.length > 0) {
        remoteRuns = data as Record<string, unknown>[];
      }
    } catch {
      // Supabase table query non-blocking
    }

    // Merge runs, prioritizing remote or local without duplicates
    const combinedRuns = remoteRuns.length > 0 ? remoteRuns : localRuns;

    return NextResponse.json({
      success: true,
      consultation_id: consultationId,
      total_runs: combinedRuns.length,
      runs: combinedRuns,
    });
  } catch (error: unknown) {
    console.error("[GET /api/consultations/[id]/runs] Error:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to retrieve agent runs" },
      { status: 500 }
    );
  }
}
