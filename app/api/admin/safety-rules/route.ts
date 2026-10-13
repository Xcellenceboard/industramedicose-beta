import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  globalSafetyEngine,
  DEFAULT_SAFETY_RULES,
  SafetyRule,
} from "@/agents/safety-rules-engine";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://avuslmtusrndxcmuigvx.supabase.co";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);

    // Fetch from Supabase
    let rules: SafetyRule[] = globalSafetyEngine.getRules();
    let auditLogs: Array<{
      id: string;
      action: string;
      entity: string;
      metadata: Record<string, unknown> | null;
      created_at: string;
    }> = [];

    try {
      const { data: dbRules, error: rulesErr } = await supabase
        .from("safety_rules")
        .select("*")
        .order("created_at", { ascending: true });

      if (!rulesErr && dbRules && dbRules.length > 0) {
        // Merge or populate DB rules with category & hinglish if missing
        rules = dbRules.map((r) => {
          const defaultMatch = DEFAULT_SAFETY_RULES.find((d) => d.id === r.id || d.name === r.name);
          return {
            id: r.id,
            name: r.name,
            category: defaultMatch?.category || "other",
            keywords_en: r.keywords_en || [],
            keywords_hi: r.keywords_hi || [],
            keywords_hinglish: defaultMatch?.keywords_hinglish || [],
            severity: r.severity as "urgent" | "attention" | "routine",
            guidance_en: r.guidance_en,
            guidance_hi: r.guidance_hi,
            is_active: r.is_active,
            is_suicide_related: defaultMatch?.is_suicide_related || false,
          };
        });
      }

      const { data: logs, error: logsErr } = await supabase
        .from("audit_log")
        .select("*")
        .eq("entity", "safety_rules")
        .order("created_at", { ascending: false })
        .limit(20);

      if (!logsErr && logs) {
        auditLogs = logs as unknown as typeof auditLogs;
      }
    } catch (e) {
      console.warn("Using in-memory safety engine rules due to DB read error:", e);
    }

    return NextResponse.json({
      success: true,
      rules,
      audit_logs: auditLogs,
      stats: {
        total_rules: rules.length,
        active_rules: rules.filter((r) => r.is_active).length,
        urgent_rules: rules.filter((r) => r.severity === "urgent").length,
      },
    });
  } catch (error) {
    console.error("[SafetyRules GET Error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch safety rules" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, rule, rule_id, is_active, sentence, clinician_name } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://avuslmtusrndxcmuigvx.supabase.co";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);

    // 1. TEST A SENTENCE SANDBOX
    if (action === "test") {
      if (!sentence || typeof sentence !== "string") {
        return NextResponse.json({ error: "sentence is required for test" }, { status: 400 });
      }
      const testResult = globalSafetyEngine.evaluate(sentence);
      return NextResponse.json({
        success: true,
        sentence,
        result: testResult,
      });
    }

    // 2. TOGGLE RULE ACTIVE STATUS
    if (action === "toggle") {
      if (!rule_id) {
        return NextResponse.json({ error: "rule_id is required" }, { status: 400 });
      }

      globalSafetyEngine.toggleRule(rule_id, Boolean(is_active));

      // Attempt DB update & audit log
      try {
        await supabase
          .from("safety_rules")
          .update({ is_active: Boolean(is_active), updated_at: new Date().toISOString() })
          .eq("id", rule_id);

        await supabase.from("audit_log").insert({
          action: is_active ? "rule_enabled" : "rule_disabled",
          entity: "safety_rules",
          metadata: {
            rule_id,
            is_active: Boolean(is_active),
            clinician: clinician_name || "Admin Clinician",
            timestamp: new Date().toISOString(),
          },
        });
      } catch (e) {
        console.warn("DB toggle warning:", e);
      }

      return NextResponse.json({
        success: true,
        rule_id,
        is_active: Boolean(is_active),
        message: `Rule ${rule_id} status updated to ${is_active ? "active" : "disabled"}.`,
      });
    }

    // 3. CREATE NEW RULE
    if (action === "create") {
      if (!rule || !rule.name) {
        return NextResponse.json({ error: "Valid rule definition is required" }, { status: 400 });
      }

      const newId = rule.id || `sr-${Date.now().toString(36)}`;
      const newRule: SafetyRule = {
        id: newId,
        name: rule.name,
        category: rule.category || "other",
        keywords_en: Array.isArray(rule.keywords_en) ? rule.keywords_en : [],
        keywords_hi: Array.isArray(rule.keywords_hi) ? rule.keywords_hi : [],
        keywords_hinglish: Array.isArray(rule.keywords_hinglish) ? rule.keywords_hinglish : [],
        severity: rule.severity || "urgent",
        guidance_en: rule.guidance_en || "Clinician review required.",
        guidance_hi: rule.guidance_hi || "चिकित्सक समीक्षा आवश्यक है।",
        is_active: rule.is_active ?? true,
        is_suicide_related: Boolean(rule.is_suicide_related),
      };

      globalSafetyEngine.addRule(newRule);

      try {
        await supabase.from("safety_rules").insert({
          id: newId,
          name: newRule.name,
          keywords_en: newRule.keywords_en,
          keywords_hi: newRule.keywords_hi,
          severity: newRule.severity,
          guidance_en: newRule.guidance_en,
          guidance_hi: newRule.guidance_hi,
          is_active: newRule.is_active,
        });

        await supabase.from("audit_log").insert({
          action: "rule_created",
          entity: "safety_rules",
          metadata: {
            rule_id: newId,
            rule_name: newRule.name,
            severity: newRule.severity,
            clinician: clinician_name || "Admin Clinician",
            timestamp: new Date().toISOString(),
          },
        });
      } catch (e) {
        console.warn("DB insert warning:", e);
      }

      return NextResponse.json({
        success: true,
        rule: newRule,
        message: "Safety rule successfully created and deployed to deterministic safety engine.",
      });
    }

    // 4. UPDATE EXISTING RULE
    if (action === "update") {
      if (!rule_id || !rule) {
        return NextResponse.json({ error: "rule_id and rule updates are required" }, { status: 400 });
      }

      globalSafetyEngine.updateRule(rule_id, rule);

      try {
        await supabase
          .from("safety_rules")
          .update({
            name: rule.name,
            keywords_en: rule.keywords_en,
            keywords_hi: rule.keywords_hi,
            severity: rule.severity,
            guidance_en: rule.guidance_en,
            guidance_hi: rule.guidance_hi,
            is_active: rule.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq("id", rule_id);

        await supabase.from("audit_log").insert({
          action: "rule_updated",
          entity: "safety_rules",
          metadata: {
            rule_id,
            updated_fields: Object.keys(rule),
            clinician: clinician_name || "Admin Clinician",
            timestamp: new Date().toISOString(),
          },
        });
      } catch (e) {
        console.warn("DB update warning:", e);
      }

      return NextResponse.json({
        success: true,
        rule_id,
        message: "Safety rule updated in deterministic safety engine and audit log recorded.",
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("[SafetyRules POST Error]:", error);
    return NextResponse.json(
      { error: "Failed to process safety rule operation" },
      { status: 500 }
    );
  }
}
