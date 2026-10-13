export interface SyntheticRecord {
  consultation: {
    id: string;
    patient_id: string;
    doctor_id: string;
    status: string;
    urgency: "urgent" | "attention" | "routine";
    language: string;
    intake_duration_seconds: number;
    started_at: string;
    approved_at: string | null;
    created_at: string;
    updated_at: string;
  };
  patient: {
    profile_id: string;
    full_name: string;
    uhid: string;
    age: number;
    sex: string;
    blood_group: string;
    phone: string;
    known_allergies: string[];
    chronic_conditions: string[];
    current_medications?: string[];
  };
  summary: {
    id: string;
    consultation_id: string;
    chief_complaint: string;
    hpi: string;
    pmh?: string;
    medications?: Array<{ name: string; dose: string; frequency: string; indication: string }>;
    allergies?: Array<{ allergen: string; reaction: string; severity: string }>;
    red_flags?: Array<{ flag: string; quote: string; severity: string }>;
    missing_info?: string[];
    suggested_questions?: string[];
    two_minute_summary?: Array<{ label: string; value: string; badge: string }>;
    doctor_edited_note?: string | null;
    is_verified?: boolean;
    verified_by?: string | null;
    verified_at?: string | null;
  };
  soap_draft: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  intake_messages: unknown[];
  documents: unknown[];
  past_consultations: unknown[];
  agent_runs: unknown[];
}

// Rich synthetic clinical dataset for realistic OPD testing & demo
export const SYNTHETIC_CONSULTATIONS: Record<string, SyntheticRecord> = {
  "c-101": {
    consultation: {
      id: "c-101",
      patient_id: "p-101",
      doctor_id: "doc-meera",
      status: "ready_for_review",
      urgency: "urgent",
      language: "hinglish",
      intake_duration_seconds: 114,
      started_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      approved_at: null,
      created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    },
    patient: {
      profile_id: "p-101",
      full_name: "Vikramaditya Rathore",
      uhid: "UHID-2026-9041",
      age: 54,
      sex: "Male",
      blood_group: "B+",
      phone: "+91 98290 12345",
      known_allergies: ["Penicillin (Severe Anaphylaxis / Urticaria)"],
      chronic_conditions: ["Type 2 Diabetes Mellitus (8 yrs)", "Hypertension (5 yrs)"],
      current_medications: ["Tab Telmisartan 40mg OD", "Tab Metformin 500mg BD"],
    },
    summary: {
      id: "sum-101",
      consultation_id: "c-101",
      chief_complaint: "Acute retrosternal crushing chest pain radiating to left shoulder and arm x 2 hours",
      hpi: "Patient reports sudden onset crushing retrosternal chest pain starting at 6:30 AM while at rest. Pain severity rated 8/10, described as 'heavy rock sitting on chest' with associated diaphoresis, mild breathlessness and nausea. No prior similar episodes. Took one antacid tablet without relief.",
      pmh: "Known hypertensive and diabetic for 8 years, moderately compliant with oral hypoglycemics. Non-smoker, occasional alcohol.",
      medications: [
        { name: "Telmisartan", dose: "40mg", frequency: "OD (Morning)", indication: "Hypertension" },
        { name: "Metformin", dose: "500mg", frequency: "BD (Post meals)", indication: "Type 2 Diabetes" },
      ],
      allergies: [
        { allergen: "Penicillin", reaction: "Anaphylaxis & Facial Angioedema", severity: "High / Severe" },
      ],
      red_flags: [
        {
          flag: "Suspected Acute Coronary Syndrome (ACS) / STEMI",
          quote: "mere seene mein bahut tej dard hai, jaise koi pathhar rakh diya ho, aur bayen haath me jaa raha hai",
          severity: "urgent",
        },
        {
          flag: "Diaphoresis with Dyspnea at Rest",
          quote: "saans lene me dikkat ho rahi hai aur thanda pasina aa raha hai",
          severity: "urgent",
        },
      ],
      missing_info: [
        "Time elapsed since last meal (for stat antiplatelet administration)",
        "Any family history of premature coronary artery disease",
        "Recent ECG or baseline cardiac echo record",
      ],
      suggested_questions: [
        "Has the pain worsened in the last 30 minutes?",
        "Have you taken Sorbitrate (nitrates) or aspirin today?",
      ],
      two_minute_summary: [
        { label: "1. Chief Complaint", value: "Crushing retrosternal chest pain radiating to left arm x 2 hours", badge: "CRITICAL" },
        { label: "2. Severity & Onset", value: "Severity 8/10, acute onset at rest with cold sweating (diaphoresis)", badge: "URGENT" },
        { label: "3. Red Flag Trigger", value: "Suspected ACS / Unstable Angina. Patient quote: 'seene me pathhar rakha hai'", badge: "ACS" },
        { label: "4. Severe Drug Allergy", value: "PENICILLIN (Anaphylaxis risk) - Avoid all beta-lactam antibiotics", badge: "DANGER" },
        { label: "5. Key Vitals", value: "BP 168/104 mmHg | HR 108 bpm | SpO2 95% on room air", badge: "ELEVATED" },
        { label: "6. Active Comorbidities", value: "T2DM (8 yrs, HbA1c 8.4%), Essential HTN (5 yrs)", badge: "RISK" },
        { label: "7. Current Regular Rx", value: "Telmisartan 40mg OD, Metformin 500mg BD", badge: "MEDS" },
        { label: "8. Immediate Clinical Action", value: "STAT 12-lead ECG, Troponin I, Aspirin 300mg + Clopidogrel 300mg chewable", badge: "STAT" },
      ],
      doctor_edited_note: null,
      is_verified: false,
      verified_by: null,
      verified_at: null,
    },
    soap_draft: {
      subjective: "54-year-old male with T2DM and HTN presenting with sudden retrosternal crushing chest pain radiating to left arm x 2 hours, severity 8/10, associated with diaphoresis and shortness of breath.",
      objective: "Vitals: BP 168/104 mmHg, HR 108/min, SpO2 95% on ambient air, Temp 98.4 F.\nCVS: S1 S2 heard, tachycardic, no murmurs.\nResp: Bilateral air entry clear, vesicular breath sounds, no basal crackles.\nAbdomen: Soft, non-tender, no organomegaly.\nECG (Stat): Hyperacute T waves in leads V2-V5, ST elevation 1.5mm V3-V4.",
      assessment: "1. Acute Coronary Syndrome (Suspected Anterior STEMI / High-Risk NSTEMI)\n2. Essential Hypertension (Uncontrolled, BP 168/104)\n3. Type 2 Diabetes Mellitus",
      plan: "1. Immediate Aspirin 300 mg + Clopidogrel 300 mg + Atorvastatin 80 mg stat chewable.\n2. Sublingual Nitroglycerin 0.5 mg PRN (monitor BP).\n3. Urgent Cardiology consult for primary PCI pathway / catheterization lab activation.\n4. Stat Troponin I, Serum Creatinine, Electrolytes, CBC, RBS.\n5. O2 support 2 L/min via nasal cannula to maintain SpO2 > 95%.\n6. Strict CONTRAINDICATION: No Penicillin derivatives.",
    },
    intake_messages: [
      {
        id: "msg-1",
        role: "agent",
        content: "नमस्ते विक्रम जी! मैं मेडी हूँ। आज आपको क्या परेशानी महसूस हो रही है?",
        translation: "Hello Vikram ji! I am Medi. What health trouble are you feeling today?",
        timestamp: "6:42 AM",
      },
      {
        id: "msg-2",
        role: "patient",
        content: "मेरे सीने में बहुत तेज दर्द हो रहा है, ऐसा लग रहा है छाती पर भारी पत्थर रख दिया है और बाएं हाथ में दर्द जा रहा है।",
        translation: "There is severe crushing pain in my chest, feeling like a heavy rock placed on it, and radiating to left arm.",
        timestamp: "6:43 AM",
      },
      {
        id: "msg-3",
        role: "agent",
        content: "यह दर्द कितने समय से हो रहा है और 1 से 10 के पैमाने पर कितना तीव्र है?",
        translation: "How long has this pain been present and on a scale of 1 to 10 how severe is it?",
        timestamp: "6:43 AM",
      },
      {
        id: "msg-4",
        role: "patient",
        content: "लगभग 2 घंटे से है। दर्द 8 या 9 है। सांस लेने में भी थोड़ी तकलीफ है और ठंडा पसीना आ रहा है।",
        translation: "About 2 hours. Pain is 8 or 9. Having some shortness of breath too and cold sweating.",
        timestamp: "6:44 AM",
      },
      {
        id: "msg-5",
        role: "agent",
        content: "क्या आपको पहले से कोई बीमारी है या कोई दवाई चल रही है?",
        translation: "Do you have any existing illness or taking regular medications?",
        timestamp: "6:44 AM",
      },
      {
        id: "msg-6",
        role: "patient",
        content: "शुगर और बीपी की दवा लेता हूँ (टेल्मिसार्टन और मेटफॉर्मिन)। पेनिसिलिन से बहुत भयंकर एलर्जी है, चेहरा सूज जाता है।",
        translation: "Taking diabetes & BP meds (Telmisartan and Metformin). Severe allergy to Penicillin, face swells up.",
        timestamp: "6:45 AM",
      },
    ],
    documents: [
      {
        id: "doc-101-ecg",
        file_name: "ecg_triage_strip.webp",
        file_type: "image/webp",
        doc_type: "ECG Strip",
        extracted_data: {
          findings: "Hyperacute T waves V2-V5, sinus tachycardia 108 bpm",
          flag: "critical_abnormal",
        },
      },
      {
        id: "doc-101-rx",
        file_name: "previous_prescription.webp",
        file_type: "image/webp",
        doc_type: "Previous Prescription",
        extracted_data: {
          doctor: "Dr. K. L. Sharma, MD",
          date: "14 Jan 2026",
          medications: ["Telmisartan 40mg", "Metformin 500mg BD"],
          allergy_warning: "PENICILLIN SENSITIVE",
        },
      },
    ],
    past_consultations: [
      {
        id: "c-old-1",
        date: "14 Jan 2026",
        doctor: "Dr. Meera Rathore",
        complaint: "Routine Diabetology Review",
        outcome: "HbA1c 8.4%, advised diet and exercise titration.",
      },
      {
        id: "c-old-2",
        date: "28 Oct 2025",
        doctor: "Dr. K. L. Sharma",
        complaint: "Seasonal Bronchitis",
        outcome: "Treated with Azithromycin (avoided Amoxicillin due to Penicillin allergy).",
      },
    ],
    agent_runs: [
      {
        id: "ar-1",
        agent_name: "PatientInteractionAgent",
        latency_ms: 612,
        status: "success",
        timestamp: "6:45 AM",
      },
      {
        id: "ar-2",
        agent_name: "SafetyRulesEngine (Layer 1 Deterministic)",
        latency_ms: 0.28,
        status: "urgent_interrupt",
        timestamp: "6:43 AM",
      },
      {
        id: "ar-3",
        agent_name: "ClinicalSafetyAgent (Layer 2 Gemini 2.5 Flash)",
        latency_ms: 1140,
        status: "urgent_confirmed",
        timestamp: "6:45 AM",
      },
      {
        id: "ar-4",
        agent_name: "ScribeAgent (SOAP Synthesis)",
        latency_ms: 1820,
        status: "success",
        timestamp: "6:46 AM",
      },
    ],
  },
  "c-102": {
    consultation: {
      id: "c-102",
      patient_id: "p-102",
      doctor_id: "doc-meera",
      status: "in_review",
      urgency: "attention",
      language: "hindi",
      intake_duration_seconds: 98,
      started_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      approved_at: null,
      created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    },
    patient: {
      profile_id: "p-102",
      full_name: "Shanti Devi Gehlot",
      uhid: "UHID-2026-9042",
      age: 68,
      sex: "Female",
      blood_group: "O+",
      phone: "+91 94140 54321",
      known_allergies: ["Sulfa Drugs"],
      chronic_conditions: ["Type 2 Diabetes Mellitus (14 yrs)", "Chronic Kidney Disease Stage 2"],
      current_medications: ["Tab Glimepiride 2mg OD", "Tab Metformin 1000mg BD"],
    },
    summary: {
      id: "sum-102",
      consultation_id: "c-102",
      chief_complaint: "Uncontrolled blood sugars (190-230 mg/dL fasting), bilateral foot numbness and burning paresthesia",
      hpi: "68-year-old female presenting for diabetes review. Reports fasting sugars 190-230 mg/dL for 3 weeks despite oral meds. Also reports bilateral progressive burning sensation in soles of feet worse at night. Denies chest pain, shortness of breath, or foot ulcers.",
      pmh: "Longstanding T2DM x 14 years. Mild diabetic retinopathy diagnosed 2024.",
      medications: [
        { name: "Glimepiride", dose: "2mg", frequency: "OD (Before breakfast)", indication: "Diabetes" },
        { name: "Metformin", dose: "1000mg", frequency: "BD", indication: "Diabetes" },
      ],
      allergies: [
        { allergen: "Sulfa Drugs", reaction: "Skin rash / Erythema", severity: "Moderate" },
      ],
      red_flags: [
        {
          flag: "Symptomatic Peripheral Neuropathy with Poor Glycemic Control",
          quote: "पैरों में रात को सुइयां चुभती हैं और जलन होती है, शुगर 230 आ रही है",
          severity: "attention",
        },
      ],
      missing_info: ["Recent Serum Creatinine & eGFR", "Urine microalbumin/creatinine ratio"],
      suggested_questions: ["Have you experienced dizziness or hypoglycemic episodes in early morning?"],
      two_minute_summary: [
        { label: "1. Chief Complaint", value: "Uncontrolled fasting sugars 190-230 mg/dL with bilateral foot paresthesia", badge: "ATTENTION" },
        { label: "2. Key Symptoms", value: "Burning sensation in soles, worse at night (Glove-stocking pattern)", badge: "NEUROPATHY" },
        { label: "3. Red Flags", value: "High risk of diabetic foot complications / microvascular progression", badge: "WARNING" },
        { label: "4. Drug Allergy", value: "Sulfa Drugs (Contraindication to Sulfonylureas titration)", badge: "ALLERGY" },
        { label: "5. Vitals", value: "BP 136/82 mmHg | HR 74 bpm | BMI 28.4", badge: "STABLE" },
        { label: "6. Lab Findings", value: "HbA1c 9.6% (Document scan verified), eGFR 68 mL/min", badge: "POOR CONTROL" },
        { label: "7. Current Regimen", value: "Glimepiride 2mg OD, Metformin 1000mg BD", badge: "MEDS" },
        { label: "8. Recommended Action", value: "Add Pregabalin 75mg HS, switch from SU to SGLT2i / DPP4i, foot monofilament exam", badge: "PLAN" },
      ],
      doctor_edited_note: null,
      is_verified: false,
      verified_by: null,
      verified_at: null,
    },
    soap_draft: {
      subjective: "68yo female with longstanding T2DM presenting with poorly controlled glycemia (fasting 190-230) and bilateral burning foot paresthesias.",
      objective: "Vitals: BP 136/82, HR 74, BMI 28.4. Feet: Intact skin, no calluses or active ulcerations. Bilateral diminished vibration sense at 1st MTP joint.",
      assessment: "1. Type 2 Diabetes Mellitus with Severe Suboptimal Control (HbA1c 9.6%)\n2. Distal Symmetric Diabetic Sensorimotor Polyneuropathy\n3. Overweight BMI",
      plan: "1. Start Pregabalin 75 mg at bedtime for neuropathic pain.\n2. Discontinue Glimepiride due to Sulfa hypersensitivity risk and hypoglycemia risk; initiate Teneligliptin 20mg OD.\n3. Continue Metformin 1000mg BD.\n4. Diabetic foot care counseling (protective footwear, daily inspection).\n5. Repeat HbA1c & urine ACR in 3 months.",
    },
    intake_messages: [
      {
        id: "msg-201",
        role: "agent",
        content: "नमस्ते शांति जी, बताइए आज आपको क्या तकलीफ़ हो रही है?",
        translation: "Hello Shanti ji, please tell what problem you are facing today?",
        timestamp: "7:10 AM",
      },
      {
        id: "msg-202",
        role: "patient",
        content: "मेरी शुगर बहुत बढ़ गई है, 200 से 230 आ रही है। और पैरों के तलवों में बहुत जलन और सुइयां चुभती हैं।",
        translation: "My sugar has increased a lot, coming around 200 to 230. And in soles of feet there is intense burning and tingling.",
        timestamp: "7:11 AM",
      },
    ],
    documents: [],
    past_consultations: [],
    agent_runs: [],
  },
};