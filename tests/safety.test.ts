/**
 * Industra Medicose - Clinical Safety Engine Test Suite
 * Path: /tests/safety.test.ts
 *
 * Validates deterministic clinical safety rule engine across:
 * - English, Devanagari Hindi, and Hinglish transliterations
 * - Negation boundaries ("no chest pain", "seene mein dard nahi hai")
 * - False positive controls ("chestnut", "mild cold")
 * - Acceptance criterion: "mere seene mein bahut dard hai aur saans nahi aa rahi" < 2000ms
 * - Reports True Positives, False Positives, False Negatives, Precision, Recall, Specificity
 */

import { SafetyRulesEngine, DEFAULT_SAFETY_RULES } from "../agents/safety-rules-engine";

export interface TestCase {
  id: string;
  phrase: string;
  language: "en" | "hi" | "hinglish";
  category: string;
  expectedUrgent: boolean;
  expectedCategory?: string;
  isNegationTest?: boolean;
  isFalsePositiveControl?: boolean;
  isSuicideTest?: boolean;
}

export const TEST_SUITE: TestCase[] = [
  // -------------------------------------------------------------
  // TRUE POSITIVES: ENGLISH
  // -------------------------------------------------------------
  {
    id: "TP-EN-01",
    phrase: "severe crushing chest pain radiating to left jaw and arm",
    language: "en",
    category: "cardiac",
    expectedUrgent: true,
  },
  {
    id: "TP-EN-02",
    phrase: "shortness of breath, gasping for air and blue lips",
    language: "en",
    category: "respiratory",
    expectedUrgent: true,
  },
  {
    id: "TP-EN-03",
    phrase: "sudden slurred speech and facial drooping on left side",
    language: "en",
    category: "neurological",
    expectedUrgent: true,
  },
  {
    id: "TP-EN-04",
    phrase: "massive blood loss from deep laceration, bleeding cannot stop",
    language: "en",
    category: "hemorrhage",
    expectedUrgent: true,
  },
  {
    id: "TP-EN-05",
    phrase: "I want to kill myself, I feel like I want to die tonight",
    language: "en",
    category: "mental_health",
    expectedUrgent: true,
    isSuicideTest: true,
  },
  {
    id: "TP-EN-06",
    phrase: "baby fever 102 refusing feeding since morning",
    language: "en",
    category: "pediatric",
    expectedUrgent: true,
  },
  {
    id: "TP-EN-07",
    phrase: "unresponsive patient fainted and not waking up",
    language: "en",
    category: "neurological",
    expectedUrgent: true,
  },
  {
    id: "TP-EN-08",
    phrase: "severe anaphylaxis with swollen tongue and throat closing",
    language: "en",
    category: "anaphylaxis",
    expectedUrgent: true,
  },
  {
    id: "TP-EN-09",
    phrase: "active convulsion and patient shaking uncontrollably",
    language: "en",
    category: "neurological",
    expectedUrgent: true,
  },

  // -------------------------------------------------------------
  // TRUE POSITIVES: HINDI (DEVANAGARI)
  // -------------------------------------------------------------
  {
    id: "TP-HI-01",
    phrase: "सीने में दर्द और छाती में भारीपन महसूस हो रहा है",
    language: "hi",
    category: "cardiac",
    expectedUrgent: true,
  },
  {
    id: "TP-HI-02",
    phrase: "सांस नहीं आ रही और दम घुट रहा है",
    language: "hi",
    category: "respiratory",
    expectedUrgent: true,
  },
  {
    id: "TP-HI-03",
    phrase: "बोलने में तुतलाना और चेहरा टेढ़ा होना दिख रहा है",
    language: "hi",
    category: "neurological",
    expectedUrgent: true,
  },
  {
    id: "TP-HI-04",
    phrase: "खून की उल्टी हो रही है और खून नहीं रुक रहा",
    language: "hi",
    category: "hemorrhage",
    expectedUrgent: true,
  },
  {
    id: "TP-HI-05",
    phrase: "जीवन समाप्त करना और आत्महत्या करने का विचार आ रहा है",
    language: "hi",
    category: "mental_health",
    expectedUrgent: true,
    isSuicideTest: true,
  },
  {
    id: "TP-HI-06",
    phrase: "नवजात को तेज बुखार है और दूध नहीं पी रहा बच्चा",
    language: "hi",
    category: "pediatric",
    expectedUrgent: true,
  },
  {
    id: "TP-HI-07",
    phrase: "मिरगी का दौरा पड़ा और शरीर में अकड़न है",
    language: "hi",
    category: "neurological",
    expectedUrgent: true,
  },
  {
    id: "TP-HI-08",
    phrase: "मरीज़ बेहोश हो गया और होश नहीं आ रहा",
    language: "hi",
    category: "neurological",
    expectedUrgent: true,
  },

  // -------------------------------------------------------------
  // TRUE POSITIVES: HINGLISH (ROMANIZED HINDI)
  // -------------------------------------------------------------
  {
    id: "TP-HG-01",
    phrase: "mere seene mein bahut dard hai aur saans nahi aa rahi",
    language: "hinglish",
    category: "cardiac_respiratory",
    expectedUrgent: true, // PRIMARY ACCEPTANCE CRITERION
  },
  {
    id: "TP-HG-02",
    phrase: "chaati me dard aur left arm me dard ho raha hai",
    language: "hinglish",
    category: "cardiac",
    expectedUrgent: true,
  },
  {
    id: "TP-HG-03",
    phrase: "dum ghut raha hai saans lene me bahut dikkat hai",
    language: "hinglish",
    category: "respiratory",
    expectedUrgent: true,
  },
  {
    id: "TP-HG-04",
    phrase: "muh tedha ho gaya aur hath kamzor ho gaya achanak",
    language: "hinglish",
    category: "neurological",
    expectedUrgent: true,
  },
  {
    id: "TP-HG-05",
    phrase: "khoon nahi ruk raha aur bahut khoon beh raha hai",
    language: "hinglish",
    category: "hemorrhage",
    expectedUrgent: true,
  },
  {
    id: "TP-HG-06",
    phrase: "khud ko marna chahta hoon zindagi khatam karne ka soch raha",
    language: "hinglish",
    category: "mental_health",
    expectedUrgent: true,
    isSuicideTest: true,
  },
  {
    id: "TP-HG-07",
    phrase: "baby ko bukhar hai doodh nahi pee raha baby",
    language: "hinglish",
    category: "pediatric",
    expectedUrgent: true,
  },
  {
    id: "TP-HG-08",
    phrase: "behosh ho gaya aur jawab nahi de raha kuch bhi",
    language: "hinglish",
    category: "neurological",
    expectedUrgent: true,
  },

  // -------------------------------------------------------------
  // NEGATIONS (FALSE ALARM PREVENTIONS)
  // -------------------------------------------------------------
  {
    id: "NEG-EN-01",
    phrase: "no chest pain, just mild acid reflux after eating",
    language: "en",
    category: "negation",
    expectedUrgent: false,
    isNegationTest: true,
  },
  {
    id: "NEG-EN-02",
    phrase: "patient denies shortness of breath or arm weakness",
    language: "en",
    category: "negation",
    expectedUrgent: false,
    isNegationTest: true,
  },
  {
    id: "NEG-EN-03",
    phrase: "without any heavy bleeding or fainting",
    language: "en",
    category: "negation",
    expectedUrgent: false,
    isNegationTest: true,
  },
  {
    id: "NEG-EN-04",
    phrase: "ruled out seizure, patient never had convulsions",
    language: "en",
    category: "negation",
    expectedUrgent: false,
    isNegationTest: true,
  },
  {
    id: "NEG-HI-01",
    phrase: "सीने में दर्द नहीं है, केवल पेट में गैस है",
    language: "hi",
    category: "negation",
    expectedUrgent: false,
    isNegationTest: true,
  },
  {
    id: "NEG-HI-02",
    phrase: "सांस फूलने की कोई समस्या नहीं है",
    language: "hi",
    category: "negation",
    expectedUrgent: false,
    isNegationTest: true,
  },
  {
    id: "NEG-HG-01",
    phrase: "mere seene mein dard nahi hai bas pet me dikkat hai",
    language: "hinglish",
    category: "negation",
    expectedUrgent: false,
    isNegationTest: true,
  },
  {
    id: "NEG-HG-02",
    phrase: "saans lene me koi dikkat nahi hai sab theek hai",
    language: "hinglish",
    category: "negation",
    expectedUrgent: false,
    isNegationTest: true,
  },
  {
    id: "NEG-HG-03",
    phrase: "muh tedha nahi hai bas sir ghoom raha hai",
    language: "hinglish",
    category: "negation",
    expectedUrgent: false,
    isNegationTest: true,
  },
  {
    id: "NEG-HG-04",
    phrase: "baby ko bukhar nahi hai bas thoda ro raha tha",
    language: "hinglish",
    category: "negation",
    expectedUrgent: false,
    isNegationTest: true,
  },

  // -------------------------------------------------------------
  // FALSE POSITIVE CHECKS (BENIGN / NON-URGENT SYMPTOMS)
  // -------------------------------------------------------------
  {
    id: "FP-01",
    phrase: "I ate a chestnut muffin with my morning tea",
    language: "en",
    category: "benign",
    expectedUrgent: false,
    isFalsePositiveControl: true,
  },
  {
    id: "FP-02",
    phrase: "I have a mild runny nose and sneezing since yesterday",
    language: "en",
    category: "benign",
    expectedUrgent: false,
    isFalsePositiveControl: true,
  },
  {
    id: "FP-03",
    phrase: "mild dry cough and slight throat itch for two days",
    language: "en",
    category: "benign",
    expectedUrgent: false,
    isFalsePositiveControl: true,
  },
  {
    id: "FP-04",
    phrase: "halka sir dard ho raha hai screen dekhne se",
    language: "hinglish",
    category: "benign",
    expectedUrgent: false,
    isFalsePositiveControl: true,
  },
  {
    id: "FP-05",
    phrase: "mujhe kal raat se halka sardi jukham hai",
    language: "hinglish",
    category: "benign",
    expectedUrgent: false,
    isFalsePositiveControl: true,
  },
  {
    id: "FP-06",
    phrase: "haath me halki khujli ho rahi hai machhar ke kaatne se",
    language: "hinglish",
    category: "benign",
    expectedUrgent: false,
    isFalsePositiveControl: true,
  },
];

export function runSafetyTestSuite() {
  console.log("\n" + "=".repeat(75));
  console.log("   INDUSTRA MEDICIA - CLINICAL SAFETY AGENT TEST SUITE");
  console.log("   Zero-Miss Deterministic Layer & Negation Precision Verification");
  console.log("=".repeat(75) + "\n");

  const engine = new SafetyRulesEngine(DEFAULT_SAFETY_RULES);

  let truePositives = 0;
  let falsePositives = 0;
  let trueNegatives = 0;
  let falseNegatives = 0;

  const latencies: number[] = [];
  const failures: Array<{
    id: string;
    phrase: string;
    expected: boolean;
    actual: boolean;
    reason: string;
  }> = [];

  console.log(`Evaluating ${TEST_SUITE.length} clinical phrases across English, Hindi & Hinglish...\n`);

  for (const testCase of TEST_SUITE) {
    const t0 = performance.now();
    const result = engine.evaluate(testCase.phrase);
    const latency = performance.now() - t0;
    latencies.push(latency);

    const actualUrgent = result.is_urgent;
    const passed = actualUrgent === testCase.expectedUrgent;

    if (testCase.expectedUrgent && actualUrgent) {
      truePositives++;
    } else if (!testCase.expectedUrgent && !actualUrgent) {
      trueNegatives++;
    } else if (!testCase.expectedUrgent && actualUrgent) {
      falsePositives++;
      failures.push({
        id: testCase.id,
        phrase: testCase.phrase,
        expected: false,
        actual: true,
        reason: `False Alarm! Fired rules: ${result.matches.map((m) => m.rule_name).join(", ")}`,
      });
    } else if (testCase.expectedUrgent && !actualUrgent) {
      falseNegatives++;
      failures.push({
        id: testCase.id,
        phrase: testCase.phrase,
        expected: true,
        actual: false,
        reason: "Missed Emergency! No urgent safety rule fired.",
      });
    }

    const icon = passed ? " PASS " : " FAIL ";
    const tag = testCase.isNegationTest
      ? "[NEGATION]"
      : testCase.isFalsePositiveControl
      ? "[FALSE_POS]"
      : testCase.isSuicideTest
      ? "[SUICIDE_HP]"
      : "[EMERGENCY]";

    console.log(
      `  [${icon}] ${testCase.id.padEnd(10)} ${tag.padEnd(14)} (${latency.toFixed(2)}ms) | "${testCase.phrase.slice(0, 48)}${testCase.phrase.length > 48 ? "..." : ""}"`
    );
  }

  // Acceptance Criterion Specific Check:
  const acceptancePhrase = "mere seene mein bahut dard hai aur saans nahi aa rahi";
  const acceptanceStart = performance.now();
  const acceptanceResult = engine.evaluate(acceptancePhrase);
  const acceptanceDurationMs = performance.now() - acceptanceStart;

  console.log("\n" + "-".repeat(75));
  console.log("   PRIMARY ACCEPTANCE CRITERION VERIFICATION");
  console.log("-".repeat(75));
  console.log(`Phrase: "${acceptancePhrase}"`);
  console.log(`Urgent Triggered: ${acceptanceResult.is_urgent ? "YES (PASSED)" : "NO (FAILED)"}`);
  console.log(`Deterministic Latency: ${acceptanceDurationMs.toFixed(3)} ms (Target: < 2000 ms)`);
  console.log(`Matched Rules: ${acceptanceResult.matches.map((m) => m.rule_name).join(" & ")}`);

  // Performance & Accuracy Metrics
  const total = TEST_SUITE.length;
  const precision =
    truePositives + falsePositives > 0
      ? (truePositives / (truePositives + falsePositives)) * 100
      : 100;
  const recall =
    truePositives + falseNegatives > 0
      ? (truePositives / (truePositives + falseNegatives)) * 100
      : 100;
  const specificity =
    trueNegatives + falsePositives > 0
      ? (trueNegatives / (trueNegatives + falsePositives)) * 100
      : 100;
  const accuracy = ((truePositives + trueNegatives) / total) * 100;

  const avgLatency =
    latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1);
  const maxLatency = Math.max(...latencies, 0);

  console.log("\n" + "=".repeat(75));
  console.log("   CLINICAL SAFETY STATISTICAL METRICS REPORT");
  console.log("=".repeat(75));
  console.log(`  Total Test Cases Evaluated : ${total}`);
  console.log(`  True Positives  (TP)       : ${truePositives}`);
  console.log(`  True Negatives  (TN)       : ${trueNegatives}`);
  console.log(`  False Positives (FP)       : ${falsePositives} (Zero False Alarms Goal)`);
  console.log(`  False Negatives (FN)       : ${falseNegatives} (Zero Missed Emergencies Goal)`);
  console.log("-".repeat(75));
  console.log(`  PRECISION                  : ${precision.toFixed(2)} %`);
  console.log(`  RECALL (Sensitivity)       : ${recall.toFixed(2)} %`);
  console.log(`  SPECIFICITY                : ${specificity.toFixed(2)} %`);
  console.log(`  ACCURACY                   : ${accuracy.toFixed(2)} %`);
  console.log("-".repeat(75));
  console.log(`  Average Latency            : ${avgLatency.toFixed(3)} ms`);
  console.log(`  Max Latency                : ${maxLatency.toFixed(3)} ms`);
  console.log("=".repeat(75) + "\n");

  if (failures.length > 0) {
    console.error("FAILURES DETECTED:");
    for (const f of failures) {
      console.error(`- [${f.id}] "${f.phrase}" -> Expected urgent: ${f.expected}, Got: ${f.actual}. ${f.reason}`);
    }
  }

  const success =
    failures.length === 0 &&
    acceptanceResult.is_urgent &&
    acceptanceDurationMs < 2000;

  if (success) {
    console.log(">>> ALL SAFETY ACCEPTANCE CRITERIA SATISFIED WITH 100% RECALL & PRECISION! <<<\n");
  }

  return {
    success,
    total,
    truePositives,
    trueNegatives,
    falsePositives,
    falseNegatives,
    precision,
    recall,
    specificity,
    accuracy,
    acceptanceDurationMs,
  };
}

// Execute directly if run as a script
if (require.main === module || process.argv[1]?.endsWith("safety.test.ts")) {
  const result = runSafetyTestSuite();
  if (!result.success) {
    process.exit(1);
  }
}
