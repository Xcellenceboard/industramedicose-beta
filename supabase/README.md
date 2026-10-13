# Industra Medicose - Supabase Backend Setup Guide 🏥⚡

This directory contains the database migration files, synthetic seed data, and Row Level Security (RLS) policies for **Industra Medicose** (AAYU 2026 Hackathon, Problem T01: *"The Two-Minute Doctor"*).

---

## 📂 Directory Structure

```plaintext
supabase/
├── migrations/
│   └── 20260101000000_init_schema.sql  # Complete schema, RLS, triggers & storage setup
├── seed.sql                            # Synthetic seed (2 doctors, 6 patients, 8 consultations, 15 safety rules)
└── README.md                           # This setup guide
```

---

## 🚀 How to Run in Supabase SQL Editor

### Method 1: Web SQL Editor (Fastest)

1. **Log in to Supabase**: Navigate to your Supabase Project Dashboard (`https://supabase.com/dashboard/project/avuslmtusrndxcmuigvx`).
2. **Open SQL Editor**: In the left sidebar, click on **SQL Editor**.
3. **Execute Migration**:
   - Create a **New query**.
   - Copy the entire contents of [`supabase/migrations/20260101000000_init_schema.sql`](file:///d:/industramedicose%20beta/supabase/migrations/20260101000000_init_schema.sql).
   - Paste into the SQL editor and click **Run** (Ctrl+Enter / Cmd+Enter).
   - Verify all tables, enums, triggers, and storage buckets are created successfully.
4. **Execute Seed Data**:
   - Create another **New query**.
   - Copy the entire contents of [`supabase/seed.sql`](file:///d:/industramedicose%20beta/supabase/seed.sql).
   - Paste and click **Run**.
   - This populates synthetic doctors, patients, consultations across all 5 statuses, transcripts, and 15 bilingual clinical safety rules.

---

### Method 2: Supabase CLI

If you have the Supabase CLI installed locally:

```bash
# Link your remote Supabase project
npx supabase link --project-ref avuslmtusrndxcmuigvx

# Push migrations to the linked project
npx supabase db push

# Apply seed data
npx supabase db execute --file ./supabase/seed.sql
```

---

## 🛡️ Security & Row Level Security (RLS) Architecture

Every table in the database has **Row Level Security (RLS) enabled**:

1. **`profiles`**:
   - Users can read and update only their own profile row (`id = auth.uid()`).
   - Doctors and Admins can view patient profiles within their care pathway.
2. **`patients`**:
   - Patients can only view and edit their own medical record (`profile_id = auth.uid()`).
   - Doctors can view patient records only if assigned to an active or pending consultation for that patient.
   - Cross-patient reads are strictly blocked.
3. **`consultations`**:
   - Patients can only query consultations matching `patient_id = get_patient_id()`.
   - Doctors can access consultations where `doctor_id = get_doctor_id()` or unassigned consultations waiting in triage (`doctor_id IS NULL AND status = 'ready_for_review'`).
4. **`clinical_summaries` & `intake_messages`**:
   - Inherits parent consultation permissions via `EXISTS` subqueries.
   - Only doctors and admins can modify or verify clinical summaries.
5. **`audit_log`**:
   - Restricted to `admin` role for compliance auditing.
6. **`medical-docs` Storage Bucket**:
   - Private bucket requiring signed URLs.
   - Patients can only access files under `{patient_id}/*`.

---

## 🔄 Realtime Capabilities

Supabase Realtime is enabled for instant OPD updates on:
- `public.consultations` (live triage board and status changes)
- `public.clinical_summaries` (real-time streaming of AI Scribe SOAP drafts)

To listen on client:
```typescript
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
const channel = supabase
  .channel("opd_live_updates")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "consultations" },
    (payload) => console.log("Realtime Consultation Event:", payload)
  )
  .subscribe();
```

---

## 🧪 Validating RLS Isolation

To verify that patient A cannot query or mutate patient B's clinical data, run the provided automated validation test:

```bash
npx tsx scripts/test-rls.ts
```
