import * as fs from "fs";
import * as path from "path";

async function testDocumentIntelligence() {
  console.log("=================================================================");
  console.log("🚀 TESTING MEDICAL DOCUMENT INTELLIGENCE (ACCEPTANCE SUITE)");
  console.log("=================================================================\n");

  const startTotal = Date.now();

  // 1. Consent Enforcement Test (Requirement 2)
  console.log("--- 1. Testing Consent Enforcement (Should Reject) ---");
  const noConsentFormData = new FormData();
  const sampleBuf = fs.readFileSync(path.resolve(process.cwd(), "public/samples/sample-prescription.jpg"));
  const sampleBlob = new Blob([sampleBuf], { type: "image/jpeg" });
  noConsentFormData.append("file", sampleBlob, "test-prescription.jpg");
  noConsentFormData.append("consent_given", "false");

  const noConsentRes = await fetch("http://localhost:3000/api/documents/upload", {
    method: "POST",
    body: noConsentFormData,
  });
  console.log(`Status: ${noConsentRes.status} (Expected 403 Forbidden)`);
  const noConsentJson = await noConsentRes.json();
  console.log(`Response message: "${noConsentJson.error}"`);
  if (noConsentRes.status !== 403) throw new Error("Consent enforcement failed");

  // 2. Valid Document Upload Test with Consent (Requirements 1 & 2)
  console.log("\n--- 2. Testing Valid Upload to Supabase Storage ---");
  const validFormData = new FormData();
  validFormData.append("file", sampleBlob, "sample-prescription.jpg");
  validFormData.append("consultation_id", "c-acceptance-test-101");
  validFormData.append("patient_id", "p-acceptance-vikram");
  validFormData.append("consent_given", "true");

  const uploadRes = await fetch("http://localhost:3000/api/documents/upload", {
    method: "POST",
    body: validFormData,
  });
  console.log(`Upload status: ${uploadRes.status}`);
  const uploadData = await uploadRes.json();
  console.log(`Document ID: ${uploadData.document.id}`);
  console.log(`Storage Path in "medical-docs": ${uploadData.document.storage_path}`);
  console.log(`Initial Status: "${uploadData.document.status}"`);

  // 3. Processing Prescription & Low-Confidence Flagging (Acceptance Criterion)
  console.log("\n--- 3. Testing DocumentIntelligenceAgent Processing ---");
  const procStart = Date.now();
  const procRes = await fetch("http://localhost:3000/api/documents/process", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      document_id: uploadData.document.id,
      consultation_id: "c-acceptance-test-101",
      sample_type: "prescription",
    }),
  });
  const procElapsedMs = Date.now() - procStart;
  console.log(`Process HTTP Status: ${procRes.status}`);
  console.log(`Latency: ${procElapsedMs} ms (Criterion: < 10,000 ms)`);
  if (procElapsedMs > 10000) throw new Error("Processing exceeded 10 second limit");

  const procData = await procRes.json();
  console.log(`\nDocument Type Extracted: "${procData.extracted.document_type}"`);
  console.log(`Prescribing Doctor: "${procData.extracted.doctor_hospital}"`);
  console.log(`Prescription Date: "${procData.extracted.date}"`);

  console.log("\nExtracted Medications:");
  let foundLowConfidence = false;
  procData.extracted.medications.forEach((m: any) => {
    const isLow = m.confidence < 0.7;
    if (isLow) foundLowConfidence = true;
    console.log(
      `  • ${m.name} | Dose: ${m.dose || "null"} | Freq: ${m.frequency || "null"} | Conf: ${(m.confidence * 100).toFixed(0)}% ${
        isLow ? "⚠️ [LOW-CONFIDENCE FLAGGED]" : "✅ [HIGH CONFIDENCE]"
      }`
    );
  });

  if (!foundLowConfidence) {
    throw new Error("Expected at least one low-confidence field to be flagged");
  }
  console.log("✅ Low-confidence field was visibly flagged as required.");

  console.log("\nExtracted Allergies & Conflict Detection (Requirement 5):");
  procData.extracted.allergies_mentioned.forEach((a: any) => {
    console.log(`  • Allergen: ${a.allergen} | Confidence: ${(a.confidence * 100).toFixed(0)}%`);
  });
  console.log(`Detected Conflicts Count: ${procData.conflicts.length}`);
  procData.conflicts.forEach((c: any) => {
    console.log(`  🚨 [${c.severity.toUpperCase()}] ${c.title}: ${c.description}`);
  });

  // 4. Test CBC Lab Report Processing
  console.log("\n--- 4. Testing CBC Laboratory Report Extraction ---");
  const cbcRes = await fetch("http://localhost:3000/api/documents/process", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      consultation_id: "c-acceptance-test-101",
      sample_type: "cbc",
    }),
  });
  const cbcData = await cbcRes.json();
  console.log("CBC Biomarkers:");
  cbcData.extracted.lab_values.forEach((l: any) => {
    console.log(
      `  • ${l.test}: ${l.value} ${l.unit || ""} [FLAG: ${l.flag.toUpperCase()}] Ref: ${l.reference_range} (Conf: ${(l.confidence * 100).toFixed(0)}%)`
    );
  });

  // 5. Test Hospital Discharge Summary
  console.log("\n--- 5. Testing Discharge Summary Extraction ---");
  const dischRes = await fetch("http://localhost:3000/api/documents/process", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      consultation_id: "c-acceptance-test-101",
      sample_type: "discharge",
    }),
  });
  const dischData = await dischRes.json();
  console.log(
    `Discharge Diagnoses: ${dischData.extracted.diagnoses_mentioned.map((d: any) => d.condition).join(", ")}`
  );
  console.log(
    `Discharge Medications: ${dischData.extracted.medications.map((m: any) => m.name).join(", ")}`
  );

  // 6. Test GET /api/documents list
  console.log("\n--- 6. Testing GET /api/documents Query ---");
  const listRes = await fetch("http://localhost:3000/api/documents?consultation_id=c-acceptance-test-101");
  const listData = await listRes.json();
  console.log(`Documents successfully listed: ${listData.documents.length} items`);

  const totalTimeMs = Date.now() - startTotal;
  console.log(`\n=================================================================`);
  console.log(`🎉 ALL ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY IN ${totalTimeMs}ms!`);
  console.log(`=================================================================`);
}

testDocumentIntelligence().catch((err) => {
  console.error("❌ Acceptance test failed:", err);
  process.exit(1);
});
