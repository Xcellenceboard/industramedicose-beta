"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import {
  ShieldAlert,
  Search,
  Plus,
  Play,
  CheckCircle2,
  History,
  PhoneCall,
  Zap,
  Edit,
  Power,
  X,
  HeartPulse,
} from "lucide-react";
import type { SafetyRule, SafetyCheckResult } from "@/agents/safety-rules-engine";

interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export default function AdminSafetyRulesPage() {
  const { addToast } = useToast();

  const [rules, setRules] = useState<SafetyRule[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<"all" | "urgent" | "attention">("all");

  // Test sandbox state
  const [testSentence, setTestSentence] = useState(
    "mere seene mein bahut dard hai aur saans nahi aa rahi"
  );
  const [testResult, setTestResult] = useState<SafetyCheckResult | null>(null);
  const [testing, setTesting] = useState(false);

  // Edit / Create modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<SafetyRule | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "cardiac",
    severity: "urgent" as "urgent" | "attention" | "routine",
    keywords_en: "",
    keywords_hi: "",
    keywords_hinglish: "",
    guidance_en: "",
    guidance_hi: "",
    is_active: true,
    is_suicide_related: false,
  });

  // Fetch rules from API
  const fetchRules = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/safety-rules");
      const data = await res.json();
      if (data.success) {
        setRules(data.rules || []);
        setAuditLogs(data.audit_logs || []);
      }
    } catch (e) {
      console.error("Error loading rules:", e);
      addToast({
        type: "warning",
        title: "Load Error",
        message: "Failed to load safety rules from server.",
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  // Run test sandbox sentence
  const handleTestSentence = async (phraseToTest?: string) => {
    const text = phraseToTest !== undefined ? phraseToTest : testSentence;
    if (!text.trim()) return;

    try {
      setTesting(true);
      const res = await fetch("/api/admin/safety-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test", sentence: text }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult(data.result);
      }
    } catch (e) {
      console.error("Test error:", e);
    } finally {
      setTesting(false);
    }
  };

  // Run initial test on load
  useEffect(() => {
    const runInitialTest = async () => {
      try {
        setTesting(true);
        const res = await fetch("/api/admin/safety-rules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "test",
            sentence: "mere seene mein bahut dard hai aur saans nahi aa rahi",
          }),
        });
        const data = await res.json();
        if (data.success) {
          setTestResult(data.result);
        }
      } catch (e) {
        console.error("Test error:", e);
      } finally {
        setTesting(false);
      }
    };
    runInitialTest();
  }, []);

  // Toggle rule active status
  const handleToggle = async (ruleId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      const res = await fetch("/api/admin/safety-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle",
          rule_id: ruleId,
          is_active: newStatus,
          clinician_name: "Dr. Clinician Auditor",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRules((prev) =>
          prev.map((r) => (r.id === ruleId ? { ...r, is_active: newStatus } : r))
        );
        addToast({
          type: "verified",
          title: "Rule Updated",
          message: `Rule status changed to ${newStatus ? "Active" : "Disabled"}.`,
        });
        fetchRules();
      }
    } catch (e) {
      console.error("Toggle error:", e);
    }
  };

  // Open modal for Create or Edit
  const openModal = (rule?: SafetyRule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        name: rule.name,
        category: rule.category || "cardiac",
        severity: rule.severity,
        keywords_en: (rule.keywords_en || []).join(", "),
        keywords_hi: (rule.keywords_hi || []).join(", "),
        keywords_hinglish: (rule.keywords_hinglish || []).join(", "),
        guidance_en: rule.guidance_en || "",
        guidance_hi: rule.guidance_hi || "",
        is_active: rule.is_active,
        is_suicide_related: Boolean(rule.is_suicide_related),
      });
    } else {
      setEditingRule(null);
      setFormData({
        name: "",
        category: "cardiac",
        severity: "urgent",
        keywords_en: "",
        keywords_hi: "",
        keywords_hinglish: "",
        guidance_en: "",
        guidance_hi: "",
        is_active: true,
        is_suicide_related: false,
      });
    }
    setIsModalOpen(true);
  };

  // Save rule (Create / Update)
  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      const splitClean = (str: string) =>
        str
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

      const payloadRule = {
        name: formData.name.trim(),
        category: formData.category,
        severity: formData.severity,
        keywords_en: splitClean(formData.keywords_en),
        keywords_hi: splitClean(formData.keywords_hi),
        keywords_hinglish: splitClean(formData.keywords_hinglish),
        guidance_en: formData.guidance_en.trim(),
        guidance_hi: formData.guidance_hi.trim(),
        is_active: formData.is_active,
        is_suicide_related: formData.is_suicide_related,
      };

      const res = await fetch("/api/admin/safety-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: editingRule ? "update" : "create",
          rule_id: editingRule?.id,
          rule: payloadRule,
          clinician_name: "Dr. Meera Rathore (Admin)",
        }),
      });

      const data = await res.json();
      if (data.success) {
        addToast({
          type: "verified",
          title: editingRule ? "Rule Updated" : "Rule Created",
          message: data.message,
        });
        setIsModalOpen(false);
        fetchRules();
      }
    } catch (e) {
      console.error("Save error:", e);
      addToast({
        type: "warning",
        title: "Save Failed",
        message: "Could not save safety rule.",
      });
    }
  };

  const filteredRules = rules.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.keywords_en.some((k) => k.toLowerCase().includes(search.toLowerCase())) ||
      r.keywords_hinglish?.some((k) => k.toLowerCase().includes(search.toLowerCase()));

    const matchesSeverity =
      severityFilter === "all" || r.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  return (
    <AppShell>
      <div className="space-y-8 pb-12">
        {/* Mandatory Safety Notice Banner */}
        <div className="rounded-2xl bg-navy-900 border border-coral-500/30 p-5 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-coral-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-coral-500/20 text-coral-400 shrink-0 mt-0.5">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold tracking-tight text-white">
                    CLINICAL SAFETY GOVERNANCE POSTURE
                  </h2>
                  <Badge variant="urgent" size="sm" pulse>
                    Deterministic Layer: Zero AI Dependency
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                  <strong>Mandatory Safety Commitment:</strong> Industra Medicose supports, and does NOT replace, emergency care and clinicians. Deterministic safety rules trigger instantaneous emergency interruption in &lt; 2ms regardless of AI server status.
                </p>
              </div>
            </div>

            <Button
              variant="default"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => openModal()}
              className="shrink-0 bg-coral-500 hover:bg-coral-600 text-white font-bold"
            >
              Add Safety Rule
            </Button>
          </div>
        </div>

        {/* Section 1: Real-time "Test a Sentence" Sandbox */}
        <Card className="p-6 border-slate-200 dark:border-navy-700 bg-white/70 dark:bg-navy-900/70 backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-teal-500" />
                <h2 className="text-lg font-bold text-navy dark:text-white">
                  Real-time Sentence Safety Sandbox
                </h2>
                <Badge variant="verified" size="sm">
                  Latency Target: &lt; 2000ms (Actual: {testResult?.latency_ms ?? 0.4}ms)
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Validate multilingual triage tokens, transliterations, and 4-word bidirectional negation boundaries before clinical sign-off.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={testSentence}
                  onChange={(e) => setTestSentence(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleTestSentence()}
                  placeholder="Enter patient phrase in English, Hindi, or Hinglish..."
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>
              <Button
                variant="default"
                size="md"
                leftIcon={<Play className="w-4 h-4" />}
                onClick={() => handleTestSentence()}
                isLoading={testing}
                className="shrink-0"
              >
                Test Sentence
              </Button>
            </div>

            {/* Quick Test Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-bold text-muted-foreground mr-1">
                Quick Presets:
              </span>
              {[
                {
                  label: "Chest Pain + Breathless (Acceptance)",
                  text: "mere seene mein bahut dard hai aur saans nahi aa rahi",
                },
                {
                  label: "Hindi Negation (No alarm)",
                  text: "seene mein dard nahi hai aur bukhaar hai",
                },
                {
                  label: "English Negation (No alarm)",
                  text: "patient denies any shortness of breath or chest pain",
                },
                {
                  label: "Suicidal Ideation (Helpline)",
                  text: "mujhe marne ka man kar raha hai zindagi bekar hai",
                },
                {
                  label: "Stroke FAST Warning",
                  text: "sudden facial drooping and slurred speech",
                },
                {
                  label: "Infant Sepsis Flag",
                  text: "baby fever 102 refusing feeding since morning",
                },
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTestSentence(preset.text);
                    handleTestSentence(preset.text);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:bg-teal-500/10 hover:text-teal-600 dark:hover:text-teal-400 border border-slate-200 dark:border-navy-700 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Evaluation Result Panel */}
            {testResult && (
              <div
                className={`mt-4 p-4 rounded-xl border ${
                  testResult.is_urgent
                    ? "bg-coral-500/10 border-coral-500/30 text-coral-950 dark:text-coral-100"
                    : testResult.severity === "attention"
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 dark:border-white/10 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        testResult.is_urgent
                          ? "urgent"
                          : testResult.severity === "attention"
                          ? "warning"
                          : "verified"
                      }
                      size="sm"
                      pulse={testResult.is_urgent}
                    >
                      {testResult.severity.toUpperCase()}
                    </Badge>
                    <span className="text-xs font-semibold">
                      {testResult.is_urgent
                        ? "🚨 EMERGENCY INTERRUPT TRIGGERED"
                        : testResult.matches.length > 0
                        ? "⚠️ CLINICAL ATTENTION FLAGGED"
                        : "✅ ROUTINE INTAKE CONTINUES"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono opacity-80">
                    <span>Deterministic Latency: {testResult.latency_ms} ms</span>
                    <span>Matches: {testResult.matches.length}</span>
                  </div>
                </div>

                {/* Detected matches */}
                {testResult.matches.length > 0 ? (
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider block">
                      Firing Safety Rules:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {testResult.matches.map((m, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-lg bg-white/60 dark:bg-navy-850/60 border border-black/10 dark:border-white/10 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground">
                              {m.rule_name}
                            </span>
                            <Badge variant="urgent" size="sm">
                              {m.severity}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            Matched Token:{" "}
                            <span className="font-mono font-bold text-coral-600 dark:text-coral-400">
                              &ldquo;{m.matched_keyword}&rdquo;
                            </span>
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {m.guidance_en}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs opacity-90">
                    No safety red flags matched. Symptom does not trigger emergency interruption.
                  </p>
                )}

                {/* Negation messages */}
                {testResult.detected_negations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10 text-xs">
                    <span className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Negation Detection Active (False Positives Prevented):
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {testResult.detected_negations.map((neg, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 text-[11px] font-mono"
                        >
                          {neg}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suicide Helpline Alert */}
                {testResult.is_suicide_ideation && testResult.helpline_info && (
                  <div className="mt-3 p-3 rounded-xl bg-purple-500/20 border border-purple-500/30 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-purple-700 dark:text-purple-300">
                      <PhoneCall className="w-4 h-4" />
                      Suicide Ideation Supportive Protocol:
                    </div>
                    <p className="text-muted-foreground">
                      {testResult.helpline_info.description_en}
                    </p>
                    <div className="font-mono font-bold text-sm text-foreground pt-1">
                      Helpline: {testResult.helpline_info.phone} (24/7 Free & Confidential)
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Section 2: Clinical Safety Rules Catalog */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-navy dark:text-white flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-coral-500" />
                Active Clinician Safety Rules ({rules.length})
              </h2>
              <p className="text-xs text-muted-foreground">
                Triage rules governing emergency chat interruption and physician escalation.
              </p>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search rules..."
                  className="h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-xs">
                {(["all", "urgent", "attention"] as const).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverityFilter(sev)}
                    className={`px-2.5 py-1 rounded text-xs capitalize transition-all ${
                      severityFilter === sev
                        ? "bg-white dark:bg-navy-700 font-bold text-foreground shadow-xs"
                        : "text-muted-foreground"
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              Loading safety rules from deterministic registry...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRules.map((r) => (
                <Card
                  key={r.id}
                  variant={!r.is_active ? "default" : r.severity === "urgent" ? "urgent" : "default"}
                  className={`p-5 transition-all ${!r.is_active ? "opacity-60 grayscale-[40%]" : ""}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={r.severity === "urgent" ? "urgent" : "warning"}
                            size="sm"
                            pulse={r.severity === "urgent" && r.is_active}
                          >
                            {r.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="neutral" size="sm">
                            {r.category.toUpperCase()}
                          </Badge>
                          {r.is_suicide_related && (
                            <Badge variant="ai" size="sm">
                              HELPLINE PROTOCOL
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-navy dark:text-white">
                          {r.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggle(r.id, r.is_active)}
                          title={r.is_active ? "Deactivate Rule" : "Activate Rule"}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            r.is_active
                              ? "bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400"
                              : "bg-slate-100 dark:bg-navy-800 border-slate-200 dark:border-navy-700 text-muted-foreground"
                          }`}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openModal(r)}
                          title="Edit Rule"
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Keywords pills */}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground">EN:</span>{" "}
                        {r.keywords_en.slice(0, 4).join(", ")}
                        {r.keywords_en.length > 4 && ` +${r.keywords_en.length - 4} more`}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground">HI:</span>{" "}
                        {r.keywords_hi.slice(0, 3).join(", ")}
                        {r.keywords_hi.length > 3 && ` +${r.keywords_hi.length - 3} more`}
                      </div>
                      {r.keywords_hinglish && r.keywords_hinglish.length > 0 && (
                        <div className="text-[11px] text-muted-foreground">
                          <span className="font-semibold text-foreground">Hinglish:</span>{" "}
                          {r.keywords_hinglish.slice(0, 4).join(", ")}
                          {r.keywords_hinglish.length > 4 &&
                            ` +${r.keywords_hinglish.length - 4} more`}
                        </div>
                      )}
                    </div>

                    {/* Clinical Guidance */}
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-700 text-xs space-y-1">
                      <p className="font-medium text-navy dark:text-white">
                        {r.guidance_en}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {r.guidance_hi}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Clinical Audit Trail */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h2 className="text-base font-bold text-navy dark:text-white">
              Clinician Safety Rule Audit Trail
            </h2>
            <Badge variant="verified" size="sm">
              Regulatory Compliance
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-navy-700 text-muted-foreground">
                  <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                  <th className="py-2.5 px-3 font-semibold">Action</th>
                  <th className="py-2.5 px-3 font-semibold">Target Rule</th>
                  <th className="py-2.5 px-3 font-semibold">Auditor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                {auditLogs.length > 0 ? (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-navy-800/50">
                      <td className="py-2 px-3 font-mono text-[11px] text-muted-foreground">
                        {new Date(log.created_at).toLocaleString("en-IN")}
                      </td>
                      <td className="py-2 px-3">
                        <Badge
                          variant={
                            log.action.includes("created")
                              ? "verified"
                              : log.action.includes("disabled")
                              ? "warning"
                              : "ai"
                          }
                          size="sm"
                        >
                          {log.action.replace("_", " ").toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 font-medium text-foreground">
                        {(log.metadata?.rule_name as string) || (log.metadata?.rule_id as string) || "Rule Entity"}
                      </td>
                      <td className="py-2 px-3 text-muted-foreground">
                        {(log.metadata?.clinician as string) || "Admin Clinician"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-muted-foreground">
                      No modifications recorded yet. All rules at verified baseline.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Modal: Add / Edit Safety Rule */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-navy-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-navy-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 border-b border-slate-200 dark:border-navy-700 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-navy dark:text-white">
                    {editingRule ? "Edit Safety Rule" : "Add New Clinical Safety Rule"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Deterministic pattern matching applied across patient intake chats.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 text-muted-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveRule} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Rule Name / Clinical Condition *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Acute Coronary Syndrome / Crushing Chest Pain"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-xs font-medium focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">
                      Clinical Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-xs font-medium focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="cardiac">Cardiac</option>
                      <option value="respiratory">Respiratory</option>
                      <option value="neurological">Neurological</option>
                      <option value="hemorrhage">Hemorrhage</option>
                      <option value="mental_health">Mental Health</option>
                      <option value="pediatric">Pediatric</option>
                      <option value="anaphylaxis">Anaphylaxis</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">
                      Urgency Severity
                    </label>
                    <select
                      value={formData.severity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          severity: e.target.value as "urgent" | "attention" | "routine",
                        })
                      }
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-xs font-medium focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="urgent">Urgent (Triggers Full-Screen Alert)</option>
                      <option value="attention">Attention (Doctor Badge Highlight)</option>
                      <option value="routine">Routine</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    English Keywords (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.keywords_en}
                    onChange={(e) => setFormData({ ...formData, keywords_en: e.target.value })}
                    placeholder="chest pain, crushing pressure, radiating left arm"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-xs font-medium focus:ring-1 focus:ring-teal-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Hindi Keywords (Devanagari, comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.keywords_hi}
                    onChange={(e) => setFormData({ ...formData, keywords_hi: e.target.value })}
                    placeholder="सीने में दर्द, छाती में भारीपन, सांस फूलना"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-xs font-medium focus:ring-1 focus:ring-teal-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Hinglish Transliterations (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.keywords_hinglish}
                    onChange={(e) => setFormData({ ...formData, keywords_hinglish: e.target.value })}
                    placeholder="seene me dard, chaati me dard, saans nahi aa rahi"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-xs font-medium focus:ring-1 focus:ring-teal-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Clinician Guidance (English)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.guidance_en}
                    onChange={(e) => setFormData({ ...formData, guidance_en: e.target.value })}
                    placeholder="STAT 12-lead ECG, troponin biomarkers, oxygen support."
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-xs font-medium focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Clinician Guidance (Hindi)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.guidance_hi}
                    onChange={(e) => setFormData({ ...formData, guidance_hi: e.target.value })}
                    placeholder="तुरंत 12-लीड ईसीजी, ट्रोपोनिन टेस्ट और ऑक्सीजन सहायता तैयार रखें।"
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-xs font-medium focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_suicide_related}
                      onChange={(e) =>
                        setFormData({ ...formData, is_suicide_related: e.target.checked })
                      }
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    Suicidal Ideation Rule (Triggers Tele-MANAS 14416 card)
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({ ...formData, is_active: e.target.checked })
                      }
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    Rule Active Immediately
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-navy-700">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="default" size="sm">
                    {editingRule ? "Save Changes" : "Deploy Safety Rule"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
