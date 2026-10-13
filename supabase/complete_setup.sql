-- ============================================================================
-- INDUSTRA MEDICOSE - COMPLETE SUPABASE DATABASE SETUP & SCHEMA
-- AAYU 2026 Hackathon | Problem T01: "The Two-Minute Doctor"
-- Run this complete script in your Supabase SQL Editor (Dashboard -> SQL Editor)
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('patient', 'doctor', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.consultation_status AS ENUM ('intake', 'ready_for_review', 'in_review', 'approved', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.consultation_urgency AS ENUM ('routine', 'attention', 'urgent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.message_role AS ENUM ('patient', 'agent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.message_input_mode AS ENUM ('voice', 'text');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.document_status AS ENUM ('uploaded', 'processing', 'extracted', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. CORE APPLICATION TABLES

-- 3.1 Profiles Table (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role public.user_role NOT NULL DEFAULT 'patient',
    preferred_language TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'hi')),
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.2 Doctors Table
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    specialization TEXT NOT NULL,
    hospital TEXT NOT NULL,
    registration_no_demo TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.3 Patients Table
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    age INT,
    sex TEXT CHECK (sex IN ('male', 'female', 'other')),
    blood_group TEXT,
    known_allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
    chronic_conditions TEXT[] DEFAULT ARRAY[]::TEXT[],
    consent_given BOOLEAN DEFAULT FALSE,
    consent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.4 Consultations Table
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    status public.consultation_status NOT NULL DEFAULT 'intake',
    urgency public.consultation_urgency NOT NULL DEFAULT 'routine',
    language TEXT NOT NULL DEFAULT 'en',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    intake_duration_seconds INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.5 Intake Messages Table (Conversational Turns)
CREATE TABLE IF NOT EXISTS public.intake_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
    role public.message_role NOT NULL,
    content TEXT NOT NULL,
    input_mode public.message_input_mode NOT NULL DEFAULT 'text',
    language TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.6 Clinical Summaries Table (SOAP Notes & Extractions)
CREATE TABLE IF NOT EXISTS public.clinical_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID UNIQUE NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
    chief_complaint TEXT,
    symptom_duration TEXT,
    history_of_present_illness TEXT,
    past_history TEXT,
    medications JSONB DEFAULT '[]'::JSONB,
    allergies JSONB DEFAULT '[]'::JSONB,
    red_flags JSONB DEFAULT '[]'::JSONB,
    missing_info JSONB DEFAULT '[]'::JSONB,
    ai_draft_note TEXT,
    doctor_edited_note TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.7 Documents Table (OCR / Uploaded Records)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    ocr_text TEXT,
    extracted JSONB DEFAULT '{}'::JSONB,
    status public.document_status NOT NULL DEFAULT 'uploaded',
    confidence NUMERIC(4,3),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.8 Prescriptions Table
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(128) NOT NULL,
    frequency VARCHAR(128) NOT NULL,
    duration VARCHAR(128) NOT NULL,
    instructions TEXT,
    is_ai_generated BOOLEAN DEFAULT TRUE,
    is_doctor_verified BOOLEAN DEFAULT FALSE,
    interaction_alert TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.9 Multi-Agent Runs Telemetry Table
CREATE TABLE IF NOT EXISTS public.agent_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE,
    agent_name TEXT NOT NULL,
    input JSONB DEFAULT '{}'::JSONB,
    output JSONB DEFAULT '{}'::JSONB,
    latency_ms INT,
    status TEXT NOT NULL DEFAULT 'success',
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.10 Clinical Audit Log Table (ABDM M2 Compliance)
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.11 Safety Rules Table (Clinician Reviewable Rule Engine)
CREATE TABLE IF NOT EXISTS public.safety_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    keywords_en TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
    keywords_hi TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
    severity TEXT NOT NULL CHECK (severity IN ('urgent', 'attention', 'routine')),
    guidance_en TEXT NOT NULL,
    guidance_hi TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_doctors_profile ON public.doctors(profile_id);
CREATE INDEX IF NOT EXISTS idx_patients_profile ON public.patients(profile_id);
CREATE INDEX IF NOT EXISTS idx_consultations_patient ON public.consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor ON public.consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON public.consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_urgency ON public.consultations(urgency);
CREATE INDEX IF NOT EXISTS idx_intake_messages_consultation ON public.intake_messages(consultation_id);
CREATE INDEX IF NOT EXISTS idx_clinical_summaries_consultation ON public.clinical_summaries(consultation_id);
CREATE INDEX IF NOT EXISTS idx_documents_consultation ON public.documents(consultation_id);
CREATE INDEX IF NOT EXISTS idx_documents_patient ON public.documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_consultation ON public.prescriptions(consultation_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_consultation ON public.agent_runs(consultation_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON public.audit_log(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_safety_rules_active ON public.safety_rules(is_active);

-- 5. AUTOMATIC PROFILE CREATION TRIGGER FOR NEW SIGNUPS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role, preferred_language, phone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'patient'),
        COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en'),
        NEW.raw_user_meta_data->>'phone'
    )
    ON CONFLICT (id) DO NOTHING;

    -- If registered as patient, create patients row
    IF (COALESCE(NEW.raw_user_meta_data->>'role', 'patient') = 'patient') THEN
        INSERT INTO public.patients (profile_id, consent_given, consent_at)
        VALUES (NEW.id, TRUE, NOW())
        ON CONFLICT (profile_id) DO NOTHING;
    END IF;

    -- If registered as doctor, create doctors row
    IF (COALESCE(NEW.raw_user_meta_data->>'role', 'patient') = 'doctor') THEN
        INSERT INTO public.doctors (profile_id, specialization, hospital, registration_no_demo)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'specialization', 'General Medicine'),
            COALESCE(NEW.raw_user_meta_data->>'hospital', 'AIIMS OPD'),
            COALESCE(NEW.raw_user_meta_data->>'registration_no_demo', 'REG-2026-OPD')
        )
        ON CONFLICT (profile_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intake_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_rules ENABLE ROW LEVEL SECURITY;

-- Allow full access for service_role and authenticated/anon prototype operations
CREATE POLICY "profiles_policy" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "doctors_policy" ON public.doctors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "patients_policy" ON public.patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "consultations_policy" ON public.consultations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "intake_messages_policy" ON public.intake_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "clinical_summaries_policy" ON public.clinical_summaries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "documents_policy" ON public.documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "prescriptions_policy" ON public.prescriptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "agent_runs_policy" ON public.agent_runs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "audit_log_policy" ON public.audit_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "safety_rules_policy" ON public.safety_rules FOR ALL USING (true) WITH CHECK (true);

-- 7. STORAGE BUCKET INITIALIZATION (for medical records & prescription scans)
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-documents', 'medical-documents', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "medical_documents_public_read" ON storage.objects
FOR SELECT USING (bucket_id = 'medical-documents');

CREATE POLICY "medical_documents_public_insert" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'medical-documents');

-- 8. INITIAL CLINICAL SAFETY RULES (Layer 1 Rule Engine)
INSERT INTO public.safety_rules (id, name, keywords_en, keywords_hi, severity, guidance_en, guidance_hi, is_active)
VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'Cardiac Emergency / ACS Rule',
    ARRAY['chest pain', 'chest pressure', 'left arm pain', 'sweating', 'crushing pain', 'shortness of breath'],
    ARRAY['छाती में दर्द', 'दबाव', 'बाएं हाथ में दर्द', 'पसीना', 'सांस फूलना'],
    'urgent',
    'Possible Acute Coronary Syndrome. Advise immediate resting posture, notify OPD emergency physician STAT, and prepare for ECG.',
    'तीव्र हृदय रोग (ACS) की आशंका। तुरंत आराम की स्थिति में बैठें, ईसीजी और आपातकालीन डॉक्टर को तुरंत सूचित करें।',
    true
),
(
    '00000000-0000-0000-0000-000000000002',
    'Acute Anaphylaxis & Hypersensitivity',
    ARRAY['throat swelling', 'unable to swallow', 'lip swelling', 'hives', 'urticaria', 'penicillin reaction'],
    ARRAY['गला सूजना', 'निगलने में असमर्थ', 'होंठ सूजना', 'चकत्ते', 'खुजली'],
    'urgent',
    'High-risk hypersensitivity / anaphylaxis alert. Check airway patency and block all beta-lactam antibiotic prescriptions.',
    'तीव्र एलर्जी / एनाफिलेक्सिस अलर्ट। वायुमार्ग की जांच करें और बीटा-लैक्टम एंटीबायोटिक दवाओं को रोकें।',
    true
),
(
    '00000000-0000-0000-0000-000000000003',
    'Severe Pediatric Dehydration',
    ARRAY['vomiting', 'sunken eyes', 'no urine', 'dry mouth', 'lethargic child'],
    ARRAY['उल्टी', 'धंसी हुई आँखें', 'पेशाब न आना', 'मुंह सूखना', 'सुस्त बच्चा'],
    'urgent',
    'Pediatric fluid crisis. Immediate ORS assessment and IV hydration readiness.',
    'बच्चों में गंभीर निर्जलीकरण। तुरंत ओआरएस और आईवी ड्रिप की आवश्यकता।',
    true
),
(
    '00000000-0000-0000-0000-000000000004',
    'Uncontrolled Hyperglycemia / DKA Warning',
    ARRAY['extreme thirst', 'frequent urination', 'fruity breath', 'confusion', 'high sugar over 250'],
    ARRAY['अत्यधिक प्यास', 'बार-बार पेशाब', 'मुंह से फल जैसी महक', 'शुगर 250 से ऊपर'],
    'attention',
    'Diabetic ketoacidosis or uncontrolled blood glucose alert. Check urine ketones and capillary blood sugar.',
    'डायबिटिक कीटोएसिडोसिस या अनियंत्रित रक्त शर्करा अलर्ट। मूत्र कीटोन और शुगर की तत्काल जांच करें।',
    true
)
ON CONFLICT (id) DO NOTHING;
