# Industra Medicose: 3-Minute AAYU 2026 Judge Walkthrough Script ⏱️🩺

**Tagline**: *Less Documentation. More Care. Smarter Healthcare.*  
**Challenge**: T01 — *The Two-Minute Doctor*  
**Presenter**: Industra Medicose Team  

---

## 🎯 Executive Pitch (30 Seconds)

> *"In high-throughput Indian Outpatient Departments (OPDs), physicians see 80 to 120 patients in a single morning. A doctor spends 7 to 9 minutes just typing notes, deciphering blurry handwritten prescriptions, and manually querying symptoms. That leaves less than 90 seconds for actual human eye contact.*
> 
> *Industra Medicose solves this. Before the patient even crosses the consultation threshold, our autonomous multi-agent clinical copilot has completed intake in Hindi or English, scanned past lab reports, and structured an 8-fact clinical summary.*
> 
> *The result? **Doctor documentation time drops to under 120 seconds**, while a zero-latency deterministic safety gate guarantees no critical symptom is missed."*

---

## 🎬 Act 1: The Rural Voice Intake & Emergency Interrupt (60 Seconds)

### Screen: `/patient/intake` or `/demo/split-screen`

1. **Launch Split-Screen Mode**:
   - Navigate to `/demo/split-screen` or click **"Live Split Screen"** in the floating Demo Control widget.
   - Point out the synchronized real-time view: Patient mobile phone on the left, Doctor OPD Queue on the right.

2. **Scenario A: Routine Fever Intake**:
   - Click **"Auto-Play Intake"** with the **Fever & Cough (Routine)** scenario selected.
   - Point to the animated Medi avatar and the bilingual conversation:
     - Medi speaks and types in Hindi (*"नमस्ते! मैं मेडी हूँ..."*).
     - The patient replies: *"Mujhe 3 din se halka bukhar aur gala kharab hai"*.
     - Point out the real-time intake progress ring advancing (20% &rarr; 60% &rarr; 100%).
   - Notice the document OCR drawer: lab report and prescription parsed into clean structured dosages (`Paracetamol 650mg TDS`, `Azithromycin 500mg OD`).

3. **Scenario B: The Zero-Latency Emergency Gate (< 2ms Interrupt)**:
   - Click **"Chest Tightness (Urgent)"** scenario or type:
     > *"mere seene mein bahut tej dard hai aur saans nahi aa rahi"*
   - **Highlight to Judges**:
     - *Immediately (< 2 milliseconds)*, before calling any LLM API, our deterministic safety gate intercepts the conversation.
     - A high-contrast emergency screen appears with a direct **"Call 112 Now"** button.
     - On the doctor's queue on the right screen, an emergency chime rings and the patient is hoisted to the very top with a pulsing red `URGENT` badge.

---

## 🩺 Act 2: The Two-Minute Doctor Review & Approval (60 Seconds)

### Screen: `/doctor/consultation/c-101`

1. **The 8 Critical Clinical Facts**:
   - Open patient **Ramesh Patel (`c-101`)**.
   - Start the on-screen review stopwatch.
   - Highlight the **"Two-Minute View"** toggle:
     - It isolates the 8 indispensable clinical facts: Chief Complaint, Duration, Current Rx, Allergies, Key Vitals, Red Flags, Differential Diagnosis, and Lab Highlights.
     - Notice the source provenance tags: `[Patient Stated]` vs `[Document Extracted: CBC 12/10]`.

2. **Physician Supervision & AI Purple Badge Verification**:
   - Every AI-generated field displays a purple `AI Draft` chip.
   - The doctor can click any field to edit or verify. Upon clicking "Verify", the chip instantly turns emerald green (`Clinician Verified`).
   - Open the **Diff Viewer**: judges can see exact additions and deletions between the AI's preliminary draft and the doctor's clinical edits.

3. **Digital Sign-Off & Patient Safety Guarantee**:
   - Click **"Approve Record (A)"**.
   - The physician attestation modal appears:
     > *"By approving this consultation, I certify that I have reviewed the patient information and assume clinical responsibility under National Medical Commission (NMC) regulations."*
   - Click **"Confirm & Publish Record"**.
   - Notice: The review stopwatch clocked in at **under 1 minute 45 seconds**!

---

## 🛡️ Act 3: Patient Portal & Governance (30 Seconds)

### Screen: `/patient` and `/admin`

1. **Patient Post-Visit Dashboard (`/patient`)**:
   - Switch to the Patient Dashboard.
   - **Critical Safety Guardrail**: Show the judges that *unverified AI text is strictly forbidden* on the patient's view.
   - Only *after* Dr. Meera Rathore's digital sign-off does the approved prescription, follow-up date, and doctor-typed advice appear.
   - Click **"Download Clinical Summary PDF"** to demonstrate the generated OPD discharge slip with clinic header and digital signature.

2. **Admin & Compliance Console (`/admin` & `/privacy`)**:
   - Navigate to `/admin`:
     - Live Agent Matrix: success rates, latency percentiles, and LLM retry counts.
     - Audit Log Viewer: immutable audit trail of every intake, document OCR, safety trigger, and physician approval.
   - Navigate to `/privacy`:
     - Plain-language DPDP Act 2023 disclosures in English and Hindi.
     - Live **"Delete My Data"** soft-delete and cryptographic cleanup action.

---

## 🏆 Closing Summary (15 Seconds)

> *"Industra Medicose doesn't replace the doctor—it liberates the doctor. Less documentation. More care. And a real two-minute clinical workflow for every busy OPD in India. Thank you!"*
