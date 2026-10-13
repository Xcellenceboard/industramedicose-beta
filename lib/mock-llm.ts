/**
 * Deterministic Mock LLM Provider for Industra Medicose
 *
 * Used when GEMINI_API_KEY is not set or during offline/mock evaluation,
 * ensuring zero demo disruption, lightning-fast execution (<100ms),
 * and 100% adherence to clinical output schemas.
 */

export interface MockPatientInteractionOutput {
  next_question: string;
  question_language: "en" | "hi" | "hinglish";
  covered_aspects: string[];
  missing_aspects: string[];
  question_number: number;
  is_intake_complete: boolean;
  reason_for_completion?: string;
}

export interface MockClinicalHistoryOutput {
  chief_complaint: string;
  symptom_duration: string;
  history_of_present_illness: string;
  past_history: string[];
  medications: string[];
  allergies: string[];
  missing_info: string[];
}

export interface MockDocumentIntelligenceOutput {
  extracted_medications: string[];
  extracted_conditions: string[];
  abnormal_biomarkers: Array<{ name: string; value: string; flag: string }>;
  confidence: number;
  status: "ready";
}

export interface MockClinicalSafetyOutput {
  urgency: "routine" | "attention" | "urgent";
  red_flags: string[];
  contraindications: string[];
  allergy_alerts: string[];
  status: "ready";
}

export interface MockClinicalDocumentationOutput {
  ai_draft_note: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  disclaimer: string;
}

export interface MockWorkflowCoordinationOutput {
  consultation_id: string;
  new_status: "ready_for_review";
  urgency: "routine" | "attention" | "urgent";
  notified_doctor: boolean;
  timestamp: string;
}

// Helper to detect Hindi / Devnagari script
export function detectLanguage(text: string): "hi" | "en" {
  const devanagariRegex = /[\u0900-\u097F]/;
  return devanagariRegex.test(text) ? "hi" : "en";
}

export class MockLLM {
  /**
   * Deterministic intake question generation based on question sequence & aspects
   */
  static mockPatientInteraction(
    lastPatientMessage: string,
    history: Array<{ role: "patient" | "agent"; content: string }>,
    preferredLanguage: "en" | "hi" = "en"
  ): MockPatientInteractionOutput {
    const userMessages = history.filter((m) => m.role === "patient");
    const questionNumber = userMessages.length + 1;
    const isHindi = preferredLanguage === "hi" || detectLanguage(lastPatientMessage) === "hi";

    // Sequence of 7 core clinical aspects:
    // 1: chief complaint, 2: duration, 3: severity, 4: associated symptoms, 5: past history, 6: medications, 7: allergies
    if (questionNumber >= 7 || questionNumber >= 10) {
      return {
        next_question: isHindi
          ? "धन्यवाद। आपकी सभी प्रारंभिक जानकारी दर्ज कर ली गई है। डॉक्टर जल्द ही आपकी समीक्षा करेंगे।"
          : "Thank you. All initial clinical details have been logged. The doctor will review your summary shortly.",
        question_language: isHindi ? "hi" : "en",
        covered_aspects: [
          "chief_complaint",
          "duration",
          "severity",
          "associated_symptoms",
          "past_history",
          "medications",
          "allergies",
        ],
        missing_aspects: [],
        question_number: questionNumber,
        is_intake_complete: true,
        reason_for_completion: "All required intake fields gathered successfully.",
      };
    }

    switch (questionNumber) {
      case 1:
        return {
          next_question: isHindi
            ? "नमस्ते। कृपया बताएं कि आज आपको क्या तकलीफ या परेशानी हो रही है?"
            : "Hello. Please describe the primary problem or symptoms you are experiencing today.",
          question_language: isHindi ? "hi" : "en",
          covered_aspects: [],
          missing_aspects: [
            "chief_complaint",
            "duration",
            "severity",
            "associated_symptoms",
            "past_history",
            "medications",
            "allergies",
          ],
          question_number: 1,
          is_intake_complete: false,
        };
      case 2:
        return {
          next_question: isHindi
            ? "यह तकलीफ आपको कितने दिनों या समय से हो रही है?"
            : "How long have you had this problem, and did it start suddenly or gradually?",
          question_language: isHindi ? "hi" : "en",
          covered_aspects: ["chief_complaint"],
          missing_aspects: [
            "duration",
            "severity",
            "associated_symptoms",
            "past_history",
            "medications",
            "allergies",
          ],
          question_number: 2,
          is_intake_complete: false,
        };
      case 3:
        return {
          next_question: isHindi
            ? "1 से 10 के पैमाने पर, आप इस तकलीफ की गंभीरता या दर्द को कितना अंक देंगे?"
            : "On a scale of 1 to 10, how severe is your pain or discomfort right now?",
          question_language: isHindi ? "hi" : "en",
          covered_aspects: ["chief_complaint", "duration"],
          missing_aspects: [
            "severity",
            "associated_symptoms",
            "past_history",
            "medications",
            "allergies",
          ],
          question_number: 3,
          is_intake_complete: false,
        };
      case 4:
        return {
          next_question: isHindi
            ? "क्या इसके साथ बुखार, चक्कर, सांस फूलना या पसीना आने जैसी कोई अन्य परेशानी भी है?"
            : "Are you experiencing any other associated symptoms like fever, shortness of breath, dizziness, or sweating?",
          question_language: isHindi ? "hi" : "en",
          covered_aspects: ["chief_complaint", "duration", "severity"],
          missing_aspects: [
            "associated_symptoms",
            "past_history",
            "medications",
            "allergies",
          ],
          question_number: 4,
          is_intake_complete: false,
        };
      case 5:
        return {
          next_question: isHindi
            ? "क्या आपको पहले से बीपी (ब्लड प्रेशर), शुगर (डायबिटीज), या थायरॉइड जैसी कोई पुरानी बीमारी है?"
            : "Do you have any past medical conditions like high blood pressure, diabetes, asthma, or heart disease?",
          question_language: isHindi ? "hi" : "en",
          covered_aspects: ["chief_complaint", "duration", "severity", "associated_symptoms"],
          missing_aspects: ["past_history", "medications", "allergies"],
          question_number: 5,
          is_intake_complete: false,
        };
      case 6:
        return {
          next_question: isHindi
            ? "क्या आप नियमित रूप से कोई दवाइयां ले रहे हैं? कृपया उनके नाम बताएं।"
            : "Are you currently taking any regular prescription medications or supplements?",
          question_language: isHindi ? "hi" : "en",
          covered_aspects: [
            "chief_complaint",
            "duration",
            "severity",
            "associated_symptoms",
            "past_history",
          ],
          missing_aspects: ["medications", "allergies"],
          question_number: 6,
          is_intake_complete: false,
        };
      case 7:
      default:
        return {
          next_question: isHindi
            ? "क्या आपको किसी दवा से एलर्जी है, जैसे पेनिसिलिन, सल्फा या कोई अन्य दवा?"
            : "Do you have any known allergies to medicines, such as penicillin, sulfa drugs, or any other substances?",
          question_language: isHindi ? "hi" : "en",
          covered_aspects: [
            "chief_complaint",
            "duration",
            "severity",
            "associated_symptoms",
            "past_history",
            "medications",
          ],
          missing_aspects: ["allergies"],
          question_number: questionNumber,
          is_intake_complete: false,
        };
    }
  }

  /**
   * Deterministic Clinical History structuring
   */
  static mockClinicalHistory(
    conversation: Array<{ role: "patient" | "agent"; content: string }>
  ): MockClinicalHistoryOutput {
    const patientText = conversation
      .filter((m) => m.role === "patient")
      .map((m) => m.content)
      .join(" ");

    const isChestPain =
      /chest|सीने|छाती|heart|tightness|heaviness/i.test(patientText);
    const isFever = /fever|बुखार|ताप/i.test(patientText);
    const isCough = /cough|खांसी|कफ/i.test(patientText);
    const hasDiabetes = /sugar|diabetes|मधुमेह/i.test(patientText);
    const hasBP = /bp|blood pressure|बीपी|रक्तचाप/i.test(patientText);
    const hasAllergy = /penicillin|पेनिसिलिन|allergy|एलर्जी/i.test(patientText);

    let chiefComplaint = "Acute retrosternal chest pain and breathlessness";
    let duration = "2 hours (acute onset)";
    let hpi =
      "Patient reports sudden severe chest tightness radiating towards the left shoulder, associated with diaphoresis.";

    if (isFever || isCough) {
      chiefComplaint = "Acute productive cough with low-grade pyrexia and sore throat";
      duration = "3 days (subacute onset)";
      hpi =
        "Patient presents with a 3-day history of worsening cough and throat pain. Denies hemoptysis. Describes symptoms as “गले में बहुत दर्द और खांसी” (throat pain and cough).";
    } else if (isChestPain) {
      chiefComplaint = "Crushing retrosternal chest pressure and dyspnea";
      duration = "2 hours";
      hpi =
        "Patient experienced sudden retrosternal tightness described as “छाती में भारीपन और पसीना” (chest heaviness and sweating), rating severity 8/10 on visual analog scale.";
    }

    const pastHistory: string[] = [];
    if (hasBP) pastHistory.push("Essential Hypertension (10 years)");
    if (hasDiabetes) pastHistory.push("Type 2 Diabetes Mellitus");
    if (pastHistory.length === 0) pastHistory.push("No significant past chronic medical history reported.");

    const medications: string[] = [];
    if (hasBP) medications.push("Telmisartan 40mg OD");
    if (hasDiabetes) medications.push("Metformin 500mg BD");
    if (medications.length === 0) medications.push("No regular daily medications.");

    const allergies: string[] = [];
    if (hasAllergy) allergies.push("Penicillin (Severe hypersensitivity)");
    else allergies.push("No known drug allergies (NKDA)");

    return {
      chief_complaint: chiefComplaint,
      symptom_duration: duration,
      history_of_present_illness: hpi,
      past_history: pastHistory,
      medications,
      allergies,
      missing_info: ["Recent baseline ECG", "Cardiac enzyme markers (Troponin-I)"],
    };
  }

  /**
   * Deterministic Clinical Documentation (SOAP note draft)
   */
  static mockClinicalDocumentation(
    history: MockClinicalHistoryOutput
  ): MockClinicalDocumentationOutput {
    const subjective = [
      `CHIEF COMPLAINT: ${history.chief_complaint}`,
      `DURATION: ${history.symptom_duration}`,
      `HISTORY OF PRESENT ILLNESS: ${history.history_of_present_illness}`,
      `PAST MEDICAL HISTORY: ${history.past_history.join(", ")}`,
      `CURRENT MEDICATIONS: ${history.medications.join(", ")}`,
      `ALLERGIES: ${history.allergies.join(", ")}`,
      history.missing_info.length > 0
        ? `NOTE: Missing records to clarify: ${history.missing_info.join("; ")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    const objective =
      "To be completed by clinician during physical examination, vital signs inspection, and laboratory review.";
    const assessment =
      "To be completed by clinician (Differential diagnoses and clinical impressions pending attending MD examination).";
    const plan =
      "To be completed by clinician (Treatment regimen, investigations, and follow-up directives pending MD verification).";

    const ai_draft_note = [
      "=== INDUSTRA MEDICOSE PRE-CONSULTATION INTAKE DRAFT ===",
      "Status: AI-generated draft - requires physician verification before signature",
      "",
      "[S - SUBJECTIVE]",
      subjective,
      "",
      "[O - OBJECTIVE]",
      objective,
      "",
      "[A - ASSESSMENT]",
      assessment,
      "",
      "[P - PLAN]",
      plan,
      "",
      "=======================================================",
    ].join("\n");

    return {
      ai_draft_note,
      subjective,
      objective,
      assessment,
      plan,
      disclaimer: "AI-generated draft - requires physician verification before signature.",
    };
  }

  /**
   * Deterministic Workflow Coordination
   */
  static mockWorkflowCoordination(
    consultationId: string,
    history: MockClinicalHistoryOutput
  ): MockWorkflowCoordinationOutput {
    const text = `${history.chief_complaint} ${history.history_of_present_illness}`.toLowerCase();
    const isUrgent =
      text.includes("chest") ||
      text.includes("heart") ||
      text.includes("stroke") ||
      text.includes("dyspnea") ||
      text.includes("seizure") ||
      text.includes("severe");

    const urgency: "routine" | "attention" | "urgent" = isUrgent
      ? "urgent"
      : text.includes("fever") || text.includes("high")
      ? "attention"
      : "routine";

    return {
      consultation_id: consultationId,
      new_status: "ready_for_review",
      urgency,
      notified_doctor: true,
      timestamp: new Date().toISOString(),
    };
  }
}
