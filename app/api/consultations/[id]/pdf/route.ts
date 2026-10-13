import { NextRequest, NextResponse } from "next/server";
import { SYNTHETIC_CONSULTATIONS } from "@/lib/synthetic-data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const consultationId = params.id;
    const data = SYNTHETIC_CONSULTATIONS[consultationId] || SYNTHETIC_CONSULTATIONS["c-101"];

    const { consultation, patient, summary, soap_draft } = data;
    const approvedDate = consultation.approved_at
      ? new Date(consultation.approved_at).toLocaleString("en-IN")
      : new Date().toLocaleString("en-IN");

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>OPD Record - ${patient.full_name} (${patient.uhid})</title>
  <style>
    @page { size: A4; margin: 16mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 24px; font-size: 13px; line-height: 1.5; }
    .header { border-bottom: 2px solid #0d9488; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start; }
    .clinic-title { font-size: 20px; font-weight: 800; color: #0f2b48; margin: 0; }
    .clinic-subtitle { font-size: 11px; color: #64748b; margin-top: 3px; }
    .badge-urgent { background: #fee2e2; color: #b91c1c; border: 1px solid #f87171; font-weight: 700; padding: 3px 8px; border-radius: 6px; font-size: 10px; text-transform: uppercase; }
    .patient-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 16px; }
    .patient-field { font-size: 11px; }
    .patient-label { color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 9px; display: block; margin-bottom: 2px; }
    .patient-val { font-weight: 700; color: #0f172a; }
    .allergy-box { background: #fff1f2; border: 1px solid #fecdd3; color: #9f1239; border-radius: 6px; padding: 8px 12px; margin-bottom: 16px; font-weight: 700; font-size: 12px; }
    .section { margin-bottom: 16px; }
    .section-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #0d9488; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px; }
    .soap-box { margin-bottom: 10px; }
    .soap-tag { font-weight: 800; color: #0f2b48; font-size: 11px; display: inline-block; width: 24px; }
    .soap-text { white-space: pre-wrap; font-size: 12px; color: #334155; margin-left: 6px; }
    .med-table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 11px; }
    .med-table th { background: #f1f5f9; text-align: left; padding: 6px 8px; border: 1px solid #e2e8f0; font-size: 10px; color: #475569; }
    .med-table td { padding: 6px 8px; border: 1px solid #e2e8f0; }
    .footer { border-top: 1px dashed #cbd5e1; padding-top: 12px; margin-top: 24px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 10px; color: #64748b; }
    .signature-box { text-align: right; }
    .signature-seal { font-family: monospace; font-size: 11px; font-weight: bold; color: #0d9488; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="background: #0f2b48; color: white; padding: 10px 16px; border-radius: 8px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
    <span style="font-size: 12px; font-weight: 600;">Clinical OPD Summary &bull; Ready for Printing / PDF Export</span>
    <button onclick="window.print()" style="background: #0d9488; color: white; border: none; padding: 6px 14px; border-radius: 6px; font-weight: bold; cursor: pointer;">Print / Save as PDF</button>
  </div>

  <div class="header">
    <div>
      <h1 class="clinic-title">AIIMS JODHPUR &bull; OUTPATIENT CLINICAL RECORD</h1>
      <div class="clinic-subtitle">Department of General Medicine & Diabetology &bull; Industra Medicose Clinical Co-Pilot</div>
    </div>
    <div style="text-align: right;">
      <span class="badge-urgent">${consultation.urgency}</span>
      <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Record ID: ${consultation.id}</div>
    </div>
  </div>

  <div class="patient-grid">
    <div class="patient-field">
      <span class="patient-label">Patient Name</span>
      <span class="patient-val">${patient.full_name}</span>
    </div>
    <div class="patient-field">
      <span class="patient-label">UHID</span>
      <span class="patient-val">${patient.uhid}</span>
    </div>
    <div class="patient-field">
      <span class="patient-label">Age / Sex / Blood</span>
      <span class="patient-val">${patient.age}y / ${patient.sex} / ${patient.blood_group}</span>
    </div>
    <div class="patient-field">
      <span class="patient-label">Verified Date & Time</span>
      <span class="patient-val">${approvedDate}</span>
    </div>
  </div>

  ${
    patient.known_allergies && patient.known_allergies.length > 0
      ? `<div class="allergy-box">⚠️ KNOWN DRUG ALLERGIES: ${patient.known_allergies.join(", ")}</div>`
      : `<div style="background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 6px 10px; border-radius: 6px; font-size: 11px; margin-bottom: 14px;">No known drug allergies reported (NKDA).</div>`
  }

  <div class="section">
    <div class="section-title">Chief Complaint & Triage Summary</div>
    <div style="font-weight: 700; color: #0f172a; margin-bottom: 4px;">${summary.chief_complaint}</div>
    <div style="font-size: 12px; color: #475569;">${summary.hpi}</div>
  </div>

  <div class="section">
    <div class="section-title">Verified SOAP Clinical Note</div>
    <div class="soap-box">
      <span class="soap-tag">S:</span>
      <span class="soap-text">${soap_draft.subjective}</span>
    </div>
    <div class="soap-box">
      <span class="soap-tag">O:</span>
      <span class="soap-text">${soap_draft.objective}</span>
    </div>
    <div class="soap-box">
      <span class="soap-tag">A:</span>
      <span class="soap-text">${soap_draft.assessment}</span>
    </div>
    <div class="soap-box">
      <span class="soap-tag">P:</span>
      <span class="soap-text">${soap_draft.plan}</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Prescribed / Verified Medication Regimen</div>
    <table class="med-table">
      <thead>
        <tr>
          <th>Medication Name</th>
          <th>Dosage</th>
          <th>Frequency</th>
          <th>Indication</th>
        </tr>
      </thead>
      <tbody>
        ${(summary.medications || [])
          .map(
            (m: { name?: string; dose?: string; frequency?: string; indication?: string }) => `<tr>
            <td style="font-weight: 700;">${m.name || ""}</td>
            <td>${m.dose}</td>
            <td>${m.frequency}</td>
            <td>${m.indication}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <div>
      <div>Industra Medicose &bull; AAYU 2026 Clinical Copilot System</div>
      <div>ABDM Milestone 2 Compliant &bull; FHIR R4 Bundle Enclosed</div>
      <div style="font-size: 9px; margin-top: 2px;">This record was reviewed, verified and authorized by the licensed clinician on duty.</div>
    </div>
    <div class="signature-box">
      <div class="signature-seal">Digitally Signed by:</div>
      <div style="font-size: 12px; font-weight: 800; color: #0f2b48;">Dr. Meera Rathore, MD</div>
      <div style="font-size: 10px; color: #64748b;">Reg No: RJ-MED-2016-8921</div>
      <div style="font-size: 9px; color: #94a3b8;">Timestamp: ${approvedDate}</div>
    </div>
  </div>
</body>
</html>`;

    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="OPD_Record_${patient.uhid}.html"`,
      },
    });
  } catch (error) {
    console.error("[PDF Export Error]:", error);
    return NextResponse.json({ error: "Failed to generate PDF record" }, { status: 500 });
  }
}
