"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  TrendingUp,
  Clock,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Activity,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";

const OPD_PERFORMANCE_DATA = [
  { day: "Mon", patients: 24, avgIntakeSec: 104, avgReviewSec: 72, correctedFields: 1.2 },
  { day: "Tue", patients: 28, avgIntakeSec: 96, avgReviewSec: 68, correctedFields: 0.9 },
  { day: "Wed", patients: 32, avgIntakeSec: 88, avgReviewSec: 64, correctedFields: 0.7 },
  { day: "Thu", patients: 26, avgIntakeSec: 92, avgReviewSec: 62, correctedFields: 0.8 },
  { day: "Fri", patients: 35, avgIntakeSec: 82, avgReviewSec: 58, correctedFields: 0.5 },
  { day: "Today", patients: 18, avgIntakeSec: 78, avgReviewSec: 54, correctedFields: 0.4 },
];

export function DoctorAnalyticsStrip() {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="p-4 bg-white/80 dark:bg-navy-900/80 backdrop-blur-md border-slate-200 dark:border-navy-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-navy dark:text-white">
                &ldquo;The Two-Minute Doctor&rdquo; Clinical Velocity Strip
              </h2>
              <Badge variant="verified" size="sm">
                AI Accuracy: 96.8%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live OPD throughput metrics synthesized from intake duration and clinician review timers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-navy-800 text-foreground hover:bg-slate-200 dark:hover:bg-navy-700 transition-colors"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" /> Hide Charts
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" /> View Charts
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4 Core Clinical Velocity Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-200 dark:border-navy-700 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Avg Patient Intake
          </span>
          <div className="text-lg font-extrabold text-teal-600 dark:text-teal-400 mt-0.5">
            1.4 mins
          </div>
          <span className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3" /> vs 8.5m manual
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Avg Doctor Review
          </span>
          <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
            54 secs
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Target: &lt; 120s
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            AI Corrections / Patient
          </span>
          <div className="text-lg font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">
            0.4 fields
          </div>
          <span className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> 96.8% Fidelity
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Time Saved Per Patient
          </span>
          <div className="text-lg font-extrabold text-coral-600 dark:text-coral-400 mt-0.5">
            11.2 mins
          </div>
          <span className="text-[10px] text-coral-600 dark:text-coral-400 font-semibold mt-0.5 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> ~3.8 hrs/OPD Day
          </span>
        </div>
      </div>

      {/* Expanded Interactive Recharts Panel */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-navy-700 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-navy dark:text-white">
                Intake Duration vs Doctor Review (Seconds)
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                Target &lt; 120s
              </span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={OPD_PERFORMANCE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "8px",
                      fontSize: "11px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="avgIntakeSec" name="Patient Intake (s)" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avgReviewSec" name="Doctor Review (s)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-navy dark:text-white">
                Clinician Correction Rate per Patient (Proxy for Accuracy)
              </span>
              <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold">
                0.4 fields avg
              </span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={OPD_PERFORMANCE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "8px",
                      fontSize: "11px",
                      color: "#fff",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="correctedFields"
                    name="Corrected Fields"
                    stroke="#a855f7"
                    fill="#a855f7"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
