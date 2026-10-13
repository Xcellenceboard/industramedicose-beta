export type Locale = "en" | "hi";

export const COOKIE_NAME = "im_lang";

export const dictionaries = {
  en: {
    // Brand & App
    appName: "Industra Medicose",
    tagline: "Less Documentation. More Care. Smarter Healthcare.",
    hackathonTag: "AAYU 2026 Hackathon • Problem T01: The Two-Minute Doctor",
    disclaimer: "AI assists, the doctor decides. This is a prototype using synthetic data.",
    heroTitle: "Agentic AI Clinical Copilot for Faster, Smarter Care",
    heroDesc: "Empowering physicians to focus on patient healing while autonomous multi-agent intelligence captures consultations, extracts clinical entities, drafts prescriptions, and verifies contraindications in under 120 seconds.",

    // Navigation
    navDashboard: "Clinical Dashboard",
    navPatients: "Patient Queue",
    navConsultations: "Live Scribe",
    navPrescriptions: "Rx Studio",
    navAnalytics: "Throughput Analytics",
    navDevComponents: "Component Gallery",
    navSettings: "Clinical Settings",

    // Actions
    startConsultation: "Start Consultation",
    generateSummary: "Generate AI Summary",
    verifyNote: "Verify & Sign",
    sendUrgentAlert: "Send Urgent Alert",
    toggleLanguage: "Switch to Hindi",
    toggleTheme: "Toggle Theme",
    searchPlaceholder: "Search patient name, UHID, or ICD-10...",
    saveRecord: "Save to EHR",
    cancel: "Cancel",
    dismiss: "Dismiss",
    viewDetails: "View Details",
    exportFhir: "Export ABDM / FHIR",
    exploreComponents: "Explore Component System",

    // Status & Badges
    badgeAiGenerated: "AI Generated",
    badgeVerified: "Doctor Verified",
    badgeUrgent: "Urgent Alert",
    badgeWarning: "Clinical Caution",
    badgeInfo: "Info",
    badgeDraft: "Draft",
    badgeCompleted: "Completed",
    badgeProcessing: "Agent Working...",

    // Gallery & Dev
    galleryTitle: "Design System & Component Gallery",
    gallerySubtitle: "Production-grade UI primitives crafted for high-density clinical environments, accessible WCAG AA compliance, and dual-language readability.",
    btnVariants: "Button Variants",
    badgeVariants: "Status & Clinical Badges",
    cardVariants: "Interactive Medical Cards",
    skeletonLoaders: "Skeleton Loaders",
    emptyStates: "Empty State Displays",
    toastNotifications: "Clinical Toasts & Banners",
    statsSection: "Clinical Efficacy Metrics",

    // Stat Cards
    statTimeSaved: "Average Consultation Time",
    statTimeValue: "1.8 mins",
    statTimeSub: "Down from 7.4 mins (-75%)",
    statAccuracy: "Clinical Entity Extraction",
    statAccuracyValue: "99.4%",
    statAccuracySub: "SNOMED CT & RxNorm aligned",
    statAdherence: "ABDM / FHIR Compliance",
    statAdherenceValue: "100%",
    statAdherenceSub: "Synthetic trial benchmark",

    // Empty States
    emptyPatientsTitle: "No patients currently in queue",
    emptyPatientsDesc: "All scheduled patients for this shift have been attended to or the queue is idle.",
    emptyPrescriptionsTitle: "No medications prescribed yet",
    emptyPrescriptionsDesc: "Begin dictating or select clinical diagnosis to activate AI prescription agent.",

    // Footer
    footerCopy: "© 2026 Industra Medicose. Built with empathy and precision for clinical practitioners.",
    designedFor: "Designed for high-throughput OPD clinics & multi-speciality hospitals.",
  },
  hi: {
    // Brand & App
    appName: "इंडस्ट्रा मेडिकोज़",
    tagline: "कम दस्तावेज़ीकरण। अधिक देखभाल। स्मार्ट स्वास्थ्य सेवा।",
    hackathonTag: "AAYU 2026 हैकाथॉन • समस्या T01: द टू-मिनट डॉक्टर",
    disclaimer: "एआई केवल सहायता करता है, अंतिम निर्णय डॉक्टर का है। यह सिंथेटिक डेटा पर आधारित प्रोटोटाइप है।",
    heroTitle: "तेज़ और सटीक देखभाल के लिए एजेंटिक एआई क्लिनिकल कोपायलट",
    heroDesc: "डॉक्टरों को मरीज़ों के इलाज पर पूरा ध्यान देने में सक्षम बनाता है, जबकि हमारा बहु-एजेंट सिस्टम 120 सेकंड से भी कम समय में बातचीत समझता है, पर्चा तैयार करता है और दवाओं की जांच करता है।",

    // Navigation
    navDashboard: "क्लिनिकल डैशबोर्ड",
    navPatients: "मरीज़ कतार",
    navConsultations: "लाइव स्क्राइब",
    navPrescriptions: "दवा पर्चा स्टूडियो",
    navAnalytics: "कार्यक्षमता विश्लेषण",
    navDevComponents: "घटक गैलरी (Components)",
    navSettings: "क्लिनिक सेटिंग्स",

    // Actions
    startConsultation: "परामर्श शुरू करें",
    generateSummary: "एआई सारांश तैयार करें",
    verifyNote: "सत्यापित करें एवं हस्ताक्षर करें",
    sendUrgentAlert: "आपातकालीन चेतावनी भेजें",
    toggleLanguage: "Switch to English",
    toggleTheme: "थीम बदलें",
    searchPlaceholder: "मरीज़ का नाम, यूएचआईडी या कोड खोजें...",
    saveRecord: "ईएचआर में सुरक्षित करें",
    cancel: "रद्द करें",
    dismiss: "हटाएं",
    viewDetails: "विवरण देखें",
    exportFhir: "एबीडीएम / एफएचआईआर निर्यात",
    exploreComponents: "घटक प्रणाली देखें",

    // Status & Badges
    badgeAiGenerated: "एआई जनित",
    badgeVerified: "डॉक्टर सत्यापित",
    badgeUrgent: "तत्काल चेतावनी",
    badgeWarning: "चिकित्सीय चेतावनी",
    badgeInfo: "जानकारी",
    badgeDraft: "प्रारूप",
    badgeCompleted: "पूर्ण",
    badgeProcessing: "एजेंट कार्यरत है...",

    // Gallery & Dev
    galleryTitle: "डिज़ाइन प्रणाली एवं घटक गैलरी",
    gallerySubtitle: "व्यस्त क्लिनिकल वातावरण, डब्ल्यूसीएजी एए सुलभता और द्विभाषी स्पष्टता के लिए निर्मित उच्च स्तरीय घटक।",
    btnVariants: "बटन प्रकार",
    badgeVariants: "स्थिति व क्लिनिकल बैज",
    cardVariants: "इंटरएक्टिव मेडिकल कार्ड",
    skeletonLoaders: "कंकाल (स्केलेटन) लोडर",
    emptyStates: "रिक्त स्थिति प्रदर्शन",
    toastNotifications: "क्लिनिकल टोस्ट और अलर्ट",
    statsSection: "क्लिनिकल प्रभावशीलता मेट्रिक्स",

    // Stat Cards
    statTimeSaved: "औसत परामर्श समय",
    statTimeValue: "1.8 मिनट",
    statTimeSub: "7.4 मिनट से कम हुआ (-75%)",
    statAccuracy: "क्लिनिकल डेटा निष्कर्षण",
    statAccuracyValue: "99.4%",
    statAccuracySub: "स्नोमेड सीटी और आरएक्सनॉर्म के अनुसार",
    statAdherence: "एबीडीएम / एफएचआईआर अनुपालन",
    statAdherenceValue: "100%",
    statAdherenceSub: "सिंथेटिक परीक्षण बेंचमार्क",

    // Empty States
    emptyPatientsTitle: "कतार में कोई मरीज़ नहीं है",
    emptyPatientsDesc: "इस पाली के सभी निर्धारित मरीज़ों की जांच हो चुकी है या कतार खाली है।",
    emptyPrescriptionsTitle: "कोई दवा नहीं लिखी गई है",
    emptyPrescriptionsDesc: "एआई प्रिस्क्रिप्शन एजेंट को सक्रिय करने के लिए बोलना शुरू करें या निदान चुनें।",

    // Footer
    footerCopy: "© 2026 इंडस्ट्रा मेडिकोज़। डॉक्टरों के लिए संवेदनशीलता और सटीकता के साथ निर्मित।",
    designedFor: "उच्च-ओपीडी क्लिनिक और अस्पतालों के लिए विशेष रूप से डिज़ाइन किया गया।",
  },
} as const;

export type TranslationKey = keyof typeof dictionaries.en;

export function getDictionary(locale: Locale = "en") {
  return dictionaries[locale] || dictionaries.en;
}

export function translate(key: TranslationKey, locale: Locale = "en"): string {
  const dict = dictionaries[locale] || dictionaries.en;
  return dict[key] || dictionaries.en[key] || key;
}

// Client helper for cookie handling
export function getCookieLocale(): Locale {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(new RegExp(`(^| )${COOKIE_NAME}=([^;]+)`));
  const val = match ? match[2] : "en";
  return val === "hi" ? "hi" : "en";
}

export function setCookieLocale(locale: Locale): void {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 365; // 1 year
  document.cookie = `${COOKIE_NAME}=${locale}; path=/; max-age=${maxAge}; SameSite=Lax`;
}
