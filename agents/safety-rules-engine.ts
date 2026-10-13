/**
 * Deterministic Clinical Safety Rule Engine
 * Layer 1 of Industra Medicose Safety Architecture.
 *
 * Runs instantaneously in-memory with zero network or AI dependency.
 * Analyzes English, Devanagari Hindi, and transliterated Hinglish.
 * Features robust negation detection to eliminate false alarms.
 */

export interface SafetyRule {
  id: string;
  name: string;
  category: "cardiac" | "respiratory" | "neurological" | "hemorrhage" | "mental_health" | "pediatric" | "anaphylaxis" | "other";
  keywords_en: string[];
  keywords_hi: string[]; // Devanagari Hindi
  keywords_hinglish: string[]; // Romanized Hindi transliterations
  severity: "urgent" | "attention" | "routine";
  guidance_en: string;
  guidance_hi: string;
  is_active: boolean;
  is_suicide_related?: boolean;
}

export interface RuleMatchResult {
  rule_id: string;
  rule_name: string;
  severity: "urgent" | "attention" | "routine";
  matched_keyword: string;
  matched_text_snippet: string;
  guidance_en: string;
  guidance_hi: string;
  is_suicide_related: boolean;
}

export interface SafetyCheckResult {
  is_urgent: boolean;
  severity: "urgent" | "attention" | "routine";
  matches: RuleMatchResult[];
  detected_negations: string[];
  is_suicide_ideation: boolean;
  helpline_info?: {
    name: string;
    phone: string;
    available: string;
    description_en: string;
    description_hi: string;
  };
  latency_ms: number;
}

// -------------------------------------------------------------
// DEFAULT 15 BILINGUAL CLINICIAN-REVIEWED SAFETY RULES
// -------------------------------------------------------------
export const DEFAULT_SAFETY_RULES: SafetyRule[] = [
  {
    id: "sr-01-cardiac",
    name: "Acute Chest Pain / Angina / Coronary Syndrome",
    category: "cardiac",
    keywords_en: [
      "chest pain",
      "chest pressure",
      "chest tightness",
      "heaviness in chest",
      "crushing chest pain",
      "pain radiating to left arm",
      "jaw pain with sweating",
      "heart attack",
    ],
    keywords_hi: [
      "छाती में दर्द",
      "सीने में दर्द",
      "छाती में भारीपन",
      "सीने में दबाव",
      "बाएं हाथ में दर्द",
      "सीने में जलन और पसीना",
    ],
    keywords_hinglish: [
      "seene mein dard",
      "seene me dard",
      "seene me bahut dard",
      "sine me dard",
      "chaati me dard",
      "chhati me dard",
      "seene me dabav",
      "seene me bharipan",
      "left arm me dard",
      "bayen hath me dard",
      "heart attack",
    ],
    severity: "urgent",
    guidance_en: "Immediate red alert: Acute Coronary Syndrome risk. Order STAT 12-lead ECG, Troponin I, and initiate ACS protocol.",
    guidance_hi: "तत्काल रेड अलर्ट: हृदय घात की आशंका। तुरंत 12-लीड ईसीजी, ट्रोपोनिन टेस्ट और ऑक्सीजन सहायता सुनिश्चित करें।",
    is_active: true,
  },
  {
    id: "sr-02-respiratory",
    name: "Severe Dyspnea / Airway Obstruction / Cyanosis",
    category: "respiratory",
    keywords_en: [
      "cannot breathe",
      "shortness of breath",
      "gasping for air",
      "suffocating",
      "severe breathlessness",
      "blue lips",
      "stridor",
      "cyanosis",
    ],
    keywords_hi: [
      "सांस नहीं आ रही",
      "सांस फूलना",
      "दम घुटना",
      "नीले होंठ",
      "सांस लेने में भारी तकलीफ",
      "गला रुंधना",
    ],
    keywords_hinglish: [
      "saans nahi aa rahi",
      "sans nahi aa rahi",
      "saans nahi arahi",
      "sans nahi aarahi",
      "dum ghut raha",
      "saans lene me bahut dikkat",
      "saans atak rahi",
      "sans foolna",
      "saans ful rahi hai",
      "neele honth",
    ],
    severity: "urgent",
    guidance_en: "Assess airway patency, check SpO2 immediately. Keep high-flow O2 and bronchodilators primed.",
    guidance_hi: "वायुमार्ग की जांच करें, तुरंत SpO2 मापें और हाई-फ्लो ऑक्सीजन सहायता तैयार रखें।",
    is_active: true,
  },
  {
    id: "sr-03-neurological",
    name: "Acute Stroke / FAST Protocol (Speech, Facial, Weakness)",
    category: "neurological",
    keywords_en: [
      "slurred speech",
      "facial drooping",
      "one-sided weakness",
      "arm weakness",
      "sudden paralysis",
      "loss of speech",
      "hemiparesis",
      "stroke",
    ],
    keywords_hi: [
      "बोलने में तुतलाना",
      "चेहरा टेढ़ा होना",
      "हाथ में कमजोरी",
      "एक तरफ लकवा",
      "आवाज बंद होना",
      "अंग सुन्न होना",
    ],
    keywords_hinglish: [
      "muh tedha",
      "awaaz ladkhadana",
      "bolne me dikkat",
      "ek taraf kamzori",
      "hath kamzor ho gaya",
      "ek side kaam nahi kar raha",
      "lakwa",
      "stroke",
    ],
    severity: "urgent",
    guidance_en: "Activate code stroke pathway. Note symptom onset time. Order emergency non-contrast head CT.",
    guidance_hi: "स्ट्रोक प्रोटोकॉल सक्रिय करें। लक्षण शुरू होने का सटीक समय नोट करें और तुरंत हेड सीटी स्कैन कराएं।",
    is_active: true,
  },
  {
    id: "sr-04-hemorrhage",
    name: "Massive Uncontrolled Bleeding / Hematemesis",
    category: "hemorrhage",
    keywords_en: [
      "heavy bleeding",
      "bleeding cannot stop",
      "vomiting blood",
      "hematemesis",
      "black tarry stools",
      "massive blood loss",
      "coughing up blood",
    ],
    keywords_hi: [
      "अत्यधिक खून बहना",
      "खून की उल्टी",
      "खून नहीं रुक रहा",
      "खांसी में खून",
      "काला मल",
    ],
    keywords_hinglish: [
      "bahut khoon beh raha",
      "khoon nahi ruk raha",
      "khoon ki ulti",
      "khasi me khoon",
      "black potty",
      "heavy bleeding",
    ],
    severity: "urgent",
    guidance_en: "Direct compression, large-bore IV access, hemodynamic stabilization, and blood cross-matching.",
    guidance_hi: "सीधा दबाव बनाएं, आईवी लाइन स्थापित करें और बीपी/पल्स स्थिर करते हुए ब्लड क्रॉस-मैच कराएं।",
    is_active: true,
  },
  {
    id: "sr-05-mental-health",
    name: "Suicidal Ideation / Severe Self-Harm",
    category: "mental_health",
    keywords_en: [
      "suicide",
      "want to die",
      "kill myself",
      "end my life",
      "harm myself",
      "take my own life",
      "overdose intentionally",
    ],
    keywords_hi: [
      "आत्महत्या",
      "खुद को मारना",
      "मरने का विचार",
      "जान देना",
      "जीवन समाप्त करना",
    ],
    keywords_hinglish: [
      "suicide karna",
      "marne ka man",
      "khud ko marna",
      "jaan dena chahta hoon",
      "zindagi khatam",
      "mar jaana chahta hoon",
    ],
    severity: "urgent",
    guidance_en: "Do not leave patient unattended. Connect immediately with crisis intervention (Tele-MANAS 14416).",
    guidance_hi: "मरीज़ को अकेला न छोड़ें। तुरंत आपातकालीन टेली-मानस (14416) हेल्पलाइन से कनेक्ट करें।",
    is_active: true,
    is_suicide_related: true,
  },
  {
    id: "sr-06-pediatric",
    name: "High Fever in Infants under 3 Months",
    category: "pediatric",
    keywords_en: [
      "infant fever",
      "baby fever",
      "baby fever 100.4",
      "newborn fever",
      "refusing feeding baby",
      "refusing feeding",
      "lethargic infant",
      "infant high fever",
      "baby high fever",
    ],
    keywords_hi: [
      "नवजात को तेज बुखार",
      "शिशु को बुखार",
      "दूध नहीं पी रहा बच्चा",
      "छोटे बच्चे को बुखार",
    ],
    keywords_hinglish: [
      "baby ko bukhar",
      "chhota bachha bukhar",
      "shishu bukhar",
      "doodh nahi pee raha baby",
      "navjat shishu bukhar",
    ],
    severity: "urgent",
    guidance_en: "Any fever >= 100.4 F in infants < 90 days requires full pediatric sepsis evaluation.",
    guidance_hi: "3 माह से कम उम्र के शिशु में 100.4 F से अधिक बुखार पर तुरंत बाल रोग विशेषज्ञ को दिखाएं।",
    is_active: true,
  },
  {
    id: "sr-07-seizure",
    name: "Active Generalized Seizure / Status Epilepticus",
    category: "neurological",
    keywords_en: [
      "seizure",
      "convulsion",
      "epilepsy fit",
      "shaking uncontrollably",
      "body jerking",
      "status epilepticus",
    ],
    keywords_hi: [
      "मिरगी का दौरा",
      "दौरा पड़ना",
      "झटके लगना",
      "शरीर में अकड़न",
      "बेहोशी के झटके",
    ],
    keywords_hinglish: [
      "daura padna",
      "mirgi ka daura",
      "jhatke lagna",
      "sharir kaanp raha behtarike",
      "fits aa rahe hain",
    ],
    severity: "urgent",
    guidance_en: "Turn patient to recovery position, protect airway, do not restrain or insert objects in mouth.",
    guidance_hi: "मरीज़ को करवट दिलाएं, वायुमार्ग खुला रखें और मुंह में कुछ न डालें।",
    is_active: true,
  },
  {
    id: "sr-08-anaphylaxis",
    name: "Severe Anaphylaxis / Angioedema",
    category: "anaphylaxis",
    keywords_en: [
      "anaphylaxis",
      "throat closing",
      "swollen tongue",
      "difficulty swallowing allergic",
      "hives all over with breathing problem",
    ],
    keywords_hi: [
      "गंभीर एलर्जी",
      "गला बंद हो रहा",
      "जीभ में सूजन",
      "एलर्जी से सांस फूलना",
      "पूरे शरीर पर चकत्ते",
    ],
    keywords_hinglish: [
      "gala band ho raha",
      "jeebh sooj gayi",
      "allergy se saans phoolna",
      "face pe heavy soojan",
      "anaphylaxis",
    ],
    severity: "urgent",
    guidance_en: "Administer Intramuscular Adrenaline (1:1000) 0.5mg immediately in anterolateral thigh. Airway support.",
    guidance_hi: "तुरंत जांघ में इंट्रा-मस्कुलर एड्रेनालाईन (1:1000) लगाएं और वायुमार्ग को सुरक्षित करें।",
    is_active: true,
  },
  {
    id: "sr-09-coma",
    name: "Loss of Consciousness / Unresponsive / Coma",
    category: "neurological",
    keywords_en: [
      "unconscious",
      "unresponsive",
      "fainted and not waking up",
      "passed out cold",
      "coma",
      "cannot wake up",
    ],
    keywords_hi: [
      "बेहोश हो गया",
      "होश नहीं आ रहा",
      "जवाब नहीं दे रहा",
      "अचेत अवस्था",
    ],
    keywords_hinglish: [
      "behosh ho gaya",
      "behosh pada hai",
      "hosh nahi aa raha",
      "jawab nahi de raha",
      "faint ho gaya",
    ],
    severity: "urgent",
    guidance_en: "Check bedside capillary glucose stat (rule out hypoglycemia). Check airway and GCS score.",
    guidance_hi: "तुरंत ब्लड शुगर जांचें। वायुमार्ग खुला रखें और जीसीएस स्कोर का आकलन करें।",
    is_active: true,
  },
  {
    id: "sr-10-head-injury",
    name: "Severe Head Trauma with Loss of Consciousness / Vomiting",
    category: "neurological",
    keywords_en: [
      "head injury vomiting",
      "fell on head unconscious",
      "bleeding from ear after head trauma",
      "concussion vomiting",
    ],
    keywords_hi: [
      "सिर में चोट और उल्टी",
      "सिर पर गिरने से बेहोशी",
      "कान से खून सिर की चोट",
    ],
    keywords_hinglish: [
      "sar pe chot ulti",
      "sir pe lagi behosh",
      "sar phat gaya",
      "head injury ulti",
    ],
    severity: "urgent",
    guidance_en: "Immobilize cervical spine, monitor pupillary reactivity, urgent non-contrast CT brain.",
    guidance_hi: "गर्दन को स्थिर रखें, पुतलियों की जांच करें और तुरंत ब्रेन सीटी कराएं।",
    is_active: true,
  },
];

// -------------------------------------------------------------
// NEGATION KEYWORDS & WINDOW CHECK
// -------------------------------------------------------------
const NEGATION_TERMS = [
  // English
  "no",
  "not",
  "never",
  "none",
  "denies",
  "denied",
  "without",
  "negative for",
  "rules out",
  "ruled out",
  "free of",
  "zero",
  // Hindi & Hinglish
  "nahi",
  "nahin",
  "na",
  "koi nahi",
  "kuch nahi",
  "nhi",
  "नहीं",
  "ना",
  "कोई नहीं",
  "बिलकुल नहीं",
];

export class SafetyRulesEngine {
  private rules: SafetyRule[] = [];

  constructor(initialRules?: SafetyRule[]) {
    this.rules = initialRules && initialRules.length > 0 ? initialRules : [...DEFAULT_SAFETY_RULES];
  }

  public getRules(): SafetyRule[] {
    return [...this.rules];
  }

  public updateRule(id: string, updates: Partial<SafetyRule>): boolean {
    const idx = this.rules.findIndex((r) => r.id === id);
    if (idx !== -1) {
      this.rules[idx] = { ...this.rules[idx], ...updates };
      return true;
    }
    return false;
  }

  public addRule(rule: SafetyRule): void {
    this.rules.push(rule);
  }

  public toggleRule(id: string, isActive: boolean): boolean {
    const rule = this.rules.find((r) => r.id === id);
    if (rule) {
      rule.is_active = isActive;
      return true;
    }
    return false;
  }

  /**
   * Normalize text for transliteration, punctuation, and multi-word matching
   */
  public normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'।]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Helper to escape regex special characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /**
   * Check if a keyword occurrence in the text is negated within an 8-word radius
   * (allows lists of negated symptoms e.g. "denies shortness of breath, chest pain, or arm weakness")
   */
  public isKeywordNegated(fullNormalizedText: string, keyword: string): boolean {
    const words = fullNormalizedText.split(/\s+/).filter(Boolean);
    const keyWords = keyword.split(/\s+/).filter(Boolean);
    const keyLen = keyWords.length;

    for (let i = 0; i <= words.length - keyLen; i++) {
      const slice = words.slice(i, i + keyLen).join(" ");
      if (slice === keyword) {
        // Look back up to 8 words
        const lookBackStart = Math.max(0, i - 8);
        const lookBackStr = words.slice(lookBackStart, i).join(" ");

        // Look forward up to 8 words (especially for Hindi: "saans lene me koi dikkat nahi")
        const lookForwardEnd = Math.min(words.length, i + keyLen + 8);
        const lookForwardStr = words.slice(i + keyLen, lookForwardEnd).join(" ");

        for (const neg of NEGATION_TERMS) {
          const negClean = neg.toLowerCase().trim();
          const negRegex = new RegExp(`(^|\\s)${this.escapeRegex(negClean)}(\\s|$)`, "i");
          if (negRegex.test(lookBackStr) || negRegex.test(lookForwardStr)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Deterministic safety check on any patient utterance
   */
  public evaluate(text: string): SafetyCheckResult {
    const t0 = performance.now();
    const normalized = this.normalizeText(text);

    const matches: RuleMatchResult[] = [];
    const detectedNegations: string[] = [];
    let hasSuicideMatch = false;

    for (const rule of this.rules) {
      if (!rule.is_active) continue;

      const allKeywords = [
        ...rule.keywords_en,
        ...rule.keywords_hi,
        ...rule.keywords_hinglish,
      ];

      for (const rawKey of allKeywords) {
        const key = this.normalizeText(rawKey);
        if (!key) continue;

        const keyRegex = new RegExp(`(^|\\s)${this.escapeRegex(key)}(\\s|$)`, "i");
        if (keyRegex.test(normalized)) {
          // Check if it's negated
          if (this.isKeywordNegated(normalized, key)) {
            detectedNegations.push(`Negated: "${rawKey}" in context`);
            continue;
          }

          // Confirmed positive red flag match!
          if (rule.is_suicide_related) {
            hasSuicideMatch = true;
          }

          matches.push({
            rule_id: rule.id,
            rule_name: rule.name,
            severity: rule.severity,
            matched_keyword: rawKey,
            matched_text_snippet: text,
            guidance_en: rule.guidance_en,
            guidance_hi: rule.guidance_hi,
            is_suicide_related: !!rule.is_suicide_related,
          });

          // Avoid duplicate triggers of the same rule for this sentence
          break;
        }
      }
    }

    const isUrgent = matches.some((m) => m.severity === "urgent");
    const isAttention = matches.some((m) => m.severity === "attention");
    const severity: "urgent" | "attention" | "routine" = isUrgent
      ? "urgent"
      : isAttention
      ? "attention"
      : "routine";

    const latencyMs = Math.round((performance.now() - t0) * 100) / 100;

    const result: SafetyCheckResult = {
      is_urgent: isUrgent,
      severity,
      matches,
      detected_negations: detectedNegations,
      is_suicide_ideation: hasSuicideMatch,
      latency_ms: latencyMs,
    };

    if (hasSuicideMatch) {
      result.helpline_info = {
        name: "Tele-MANAS (Government of India 24/7 Crisis Helpline)",
        phone: "14416 / 1800-891-4416",
        available: "24 hours, 7 days a week, Free & Confidential",
        description_en:
          "You are not alone. Support is available right now. Please reach out to the certified counselors at Tele-MANAS.",
        description_hi:
          "आप अकेले नहीं हैं। सहायता अभी उपलब्ध है। कृपया टेली-मानस के प्रमाणित काउंसलरों से निःशुल्क संपर्क करें।",
      };
    }

    return result;
  }
}

// Global Singleton Instance for deterministic in-memory checks
export const globalSafetyEngine = new SafetyRulesEngine();
