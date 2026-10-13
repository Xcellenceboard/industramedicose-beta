/**
 * Clinical Guardrails for Industra Medicose Agentic Pipeline
 *
 * Implements strict clinical safety constraints:
 * 1. ZERO autonomous diagnosis (never diagnose conditions directly)
 * 2. ZERO autonomous prescription (never prescribe or alter dosages)
 * 3. ZERO treatment advice (only intake & structuring)
 * 4. Urgent symptom triage to immediate emergency care
 * 5. Explicit uncertainty handling without hallucinating facts
 * 6. Content sanitization filter blocking forbidden clinical phrases
 */

export const SHARED_GUARDRAIL_SYSTEM_PROMPT = `
CRITICAL CLINICAL SAFETY GUARDRAILS (STRICT COMPLIANCE MANDATORY):
1. NO DIAGNOSIS: You are an intake copilot, NOT a diagnosing physician. NEVER tell the patient "You have [Condition]", "This indicates you suffer from [Condition]", or "My diagnosis is...". Always frame symptoms objectively.
2. NO PRESCRIPTION OR MEDICATION ADVICE: NEVER prescribe, recommend, suggest drugs, or adjust dosages (e.g., never say "take this medicine", "take paracetamol", "start antibiotics").
3. NO TREATMENT ADVICE: Do not advise home treatments or medical interventions.
4. URGENT SYMPTOMS ESCALATION: If the patient mentions acute crushing chest pain radiating to the jaw/arm, sudden unilateral weakness/stroke signs, severe acute dyspnea, or anaphylaxis, immediately instruct them to notify the emergency department (ER) staff while recording the symptom verbatim.
5. ADMIT UNCERTAINTY: If information is missing or ambiguous, mark it explicitly in missing_info. NEVER invent, fabricate, or hallucinate clinical facts not provided by the patient.
6. OUTPUT FORMAT: Respond strictly in valid JSON matching the requested schema without markdown backticks or commentary.
`.trim();

/**
 * Forbidden phrases that must never be emitted to patients or in autonomous notes
 */
export const FORBIDDEN_PHRASES: RegExp[] = [
  /\byou have (a|an|the)?\s+(heart attack|stroke|diabetes|hypertension|infection|disease|cancer|asthma)\b/i,
  /\bi diagnose you with\b/i,
  /\bmy diagnosis is\b/i,
  /\bdiagnosed as\b/i,
  /\btake this medicine\b/i,
  /\btake paracetamol\b/i,
  /\btake ibuprofen\b/i,
  /\btake antibiotics\b/i,
  /\byou should take\b/i,
  /\bi prescribe\b/i,
  /\bprescription for you\b/i,
  /\byou need to take medicine\b/i,
  /\bdo not worry, it is just\b/i,
  /\bnothing to worry about\b/i,
];

export interface SanitizeResult {
  isCompliant: boolean;
  sanitizedText: string;
  violations: string[];
}

/**
 * Validates and sanitizes agent outputs against forbidden clinical directives
 */
export function sanitizeAgentOutput(rawText: string): SanitizeResult {
  const violations: string[] = [];
  let sanitized = rawText;

  for (const pattern of FORBIDDEN_PHRASES) {
    if (pattern.test(sanitized)) {
      violations.push(pattern.source);
      // Replace forbidden phrase with compliant neutral phrasing
      sanitized = sanitized.replace(
        pattern,
        "[Clinical discussion pending physician review]"
      );
    }
  }

  return {
    isCompliant: violations.length === 0,
    sanitizedText: sanitized,
    violations,
  };
}
