-- ============================================================================
-- INDUSTRA MEDICOSE - COMPLETE SUPABASE DATABASE SCHEMA
-- Hackathon: AAYU 2026 | Problem T01: "The Two-Minute Doctor"
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

-- 3. TABLES

-- 3.1 Profiles Table (linked to auth.users)
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

-- 3.5 Intake Messages Table
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

-- 3.6 Clinical Summaries Table
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

-- 3.7 Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE,
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

-- 3.8 Agent Runs Table (Audit for Multi-Agent Pipeline)
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

-- 3.9 Audit Log Table
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.10 Safety Rules Table (Clinician Reviewable)
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
CREATE INDEX IF NOT EXISTS idx_agent_runs_consultation ON public.agent_runs(consultation_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON public.audit_log(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_safety_rules_active ON public.safety_rules(is_active);

-- 5. HELPER SECURITY FUNCTIONS
CREATE OR REPLACE FUNCTION public.is_doctor()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'doctor'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_patient_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM public.patients WHERE profile_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_doctor_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM public.doctors WHERE profile_id = auth.uid() LIMIT 1;
$$;

-- 6. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intake_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_rules ENABLE ROW LEVEL SECURITY;

-- 6.1 PROFILES POLICIES
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
FOR SELECT USING (
  id = auth.uid() OR public.is_doctor() OR public.is_admin()
);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
FOR UPDATE USING (
  id = auth.uid() OR public.is_admin()
);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
FOR INSERT WITH CHECK (
  id = auth.uid() OR public.is_admin()
);

-- 6.2 DOCTORS POLICIES
DROP POLICY IF EXISTS "doctors_select_all" ON public.doctors;
CREATE POLICY "doctors_select_all" ON public.doctors
FOR SELECT USING (true);

DROP POLICY IF EXISTS "doctors_modify_own" ON public.doctors;
CREATE POLICY "doctors_modify_own" ON public.doctors
FOR ALL USING (
  profile_id = auth.uid() OR public.is_admin()
);

-- 6.3 PATIENTS POLICIES
-- Strict patient privacy: Patients can only access their own row
DROP POLICY IF EXISTS "patients_select" ON public.patients;
CREATE POLICY "patients_select" ON public.patients
FOR SELECT USING (
  profile_id = auth.uid() 
  OR public.is_doctor() 
  OR public.is_admin()
);

DROP POLICY IF EXISTS "patients_update_own" ON public.patients;
CREATE POLICY "patients_update_own" ON public.patients
FOR UPDATE USING (
  profile_id = auth.uid() OR public.is_admin()
);

DROP POLICY IF EXISTS "patients_insert_own" ON public.patients;
CREATE POLICY "patients_insert_own" ON public.patients
FOR INSERT WITH CHECK (
  profile_id = auth.uid() OR public.is_admin()
);

-- 6.4 CONSULTATIONS POLICIES
DROP POLICY IF EXISTS "consultations_select" ON public.consultations;
CREATE POLICY "consultations_select" ON public.consultations
FOR SELECT USING (
  patient_id = public.get_patient_id()
  OR (public.is_doctor() AND (doctor_id = public.get_doctor_id() OR doctor_id IS NULL))
  OR public.is_admin()
);

DROP POLICY IF EXISTS "consultations_insert" ON public.consultations;
CREATE POLICY "consultations_insert" ON public.consultations
FOR INSERT WITH CHECK (
  patient_id = public.get_patient_id()
  OR public.is_doctor()
  OR public.is_admin()
);

DROP POLICY IF EXISTS "consultations_update" ON public.consultations;
CREATE POLICY "consultations_update" ON public.consultations
FOR UPDATE USING (
  patient_id = public.get_patient_id()
  OR (public.is_doctor() AND (doctor_id = public.get_doctor_id() OR doctor_id IS NULL))
  OR public.is_admin()
);

-- 6.5 INTAKE MESSAGES POLICIES
DROP POLICY IF EXISTS "intake_messages_select" ON public.intake_messages;
CREATE POLICY "intake_messages_select" ON public.intake_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.consultations c
    WHERE c.id = intake_messages.consultation_id
    AND (
      c.patient_id = public.get_patient_id()
      OR (public.is_doctor() AND (c.doctor_id = public.get_doctor_id() OR c.doctor_id IS NULL))
      OR public.is_admin()
    )
  )
);

DROP POLICY IF EXISTS "intake_messages_insert" ON public.intake_messages;
CREATE POLICY "intake_messages_insert" ON public.intake_messages
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.consultations c
    WHERE c.id = intake_messages.consultation_id
    AND (
      c.patient_id = public.get_patient_id()
      OR public.is_doctor()
      OR public.is_admin()
    )
  )
);

-- 6.6 CLINICAL SUMMARIES POLICIES
DROP POLICY IF EXISTS "clinical_summaries_select" ON public.clinical_summaries;
CREATE POLICY "clinical_summaries_select" ON public.clinical_summaries
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.consultations c
    WHERE c.id = clinical_summaries.consultation_id
    AND (
      c.patient_id = public.get_patient_id()
      OR (public.is_doctor() AND (c.doctor_id = public.get_doctor_id() OR c.doctor_id IS NULL))
      OR public.is_admin()
    )
  )
);

DROP POLICY IF EXISTS "clinical_summaries_modify" ON public.clinical_summaries;
CREATE POLICY "clinical_summaries_modify" ON public.clinical_summaries
FOR ALL USING (
  public.is_doctor() OR public.is_admin()
);

-- 6.7 DOCUMENTS POLICIES
DROP POLICY IF EXISTS "documents_select" ON public.documents;
CREATE POLICY "documents_select" ON public.documents
FOR SELECT USING (
  patient_id = public.get_patient_id()
  OR public.is_doctor()
  OR public.is_admin()
);

DROP POLICY IF EXISTS "documents_insert" ON public.documents;
CREATE POLICY "documents_insert" ON public.documents
FOR INSERT WITH CHECK (
  patient_id = public.get_patient_id()
  OR public.is_doctor()
  OR public.is_admin()
);

-- 6.8 AGENT RUNS POLICIES
DROP POLICY IF EXISTS "agent_runs_select" ON public.agent_runs;
CREATE POLICY "agent_runs_select" ON public.agent_runs
FOR SELECT USING (
  public.is_doctor() OR public.is_admin()
);

DROP POLICY IF EXISTS "agent_runs_insert" ON public.agent_runs;
CREATE POLICY "agent_runs_insert" ON public.agent_runs
FOR INSERT WITH CHECK (true);

-- 6.9 AUDIT LOG POLICIES
DROP POLICY IF EXISTS "audit_log_select" ON public.audit_log;
CREATE POLICY "audit_log_select" ON public.audit_log
FOR SELECT USING (
  public.is_admin()
);

DROP POLICY IF EXISTS "audit_log_insert" ON public.audit_log;
CREATE POLICY "audit_log_insert" ON public.audit_log
FOR INSERT WITH CHECK (true);

-- 6.10 SAFETY RULES POLICIES
DROP POLICY IF EXISTS "safety_rules_select" ON public.safety_rules;
CREATE POLICY "safety_rules_select" ON public.safety_rules
FOR SELECT USING (true);

DROP POLICY IF EXISTS "safety_rules_modify" ON public.safety_rules;
CREATE POLICY "safety_rules_modify" ON public.safety_rules
FOR ALL USING (public.is_admin());

-- 7. TRIGGERS

-- 7.1 Updated At Maintenance Function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Attach set_updated_at triggers
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN
        SELECT table_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND column_name = 'updated_at'
          AND table_name NOT LIKE 'pg_%'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS trg_set_updated_at_%1$I ON public.%1$I;
            CREATE TRIGGER trg_set_updated_at_%1$I
            BEFORE UPDATE ON public.%1$I
            FOR EACH ROW
            EXECUTE FUNCTION public.set_updated_at();', tbl);
    END LOOP;
END;
$$;

-- 7.2 Auth Signup Trigger: Auto-create Profile and Role Row
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role_val public.user_role;
    user_full_name TEXT;
    pref_lang TEXT;
BEGIN
    user_role_val := COALESCE(
        (NEW.raw_user_meta_data->>'role')::public.user_role,
        'patient'::public.user_role
    );
    user_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        split_part(NEW.email, '@', 1)
    );
    pref_lang := COALESCE(
        NEW.raw_user_meta_data->>'preferred_language',
        'en'
    );

    -- Insert into profiles
    INSERT INTO public.profiles (id, full_name, role, preferred_language, phone)
    VALUES (NEW.id, user_full_name, user_role_val, pref_lang, NEW.phone)
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        updated_at = NOW();

    -- Create corresponding patient or doctor row
    IF user_role_val = 'patient' THEN
        INSERT INTO public.patients (profile_id, consent_given, consent_at)
        VALUES (NEW.id, TRUE, NOW())
        ON CONFLICT (profile_id) DO NOTHING;
    ELSIF user_role_val = 'doctor' THEN
        INSERT INTO public.doctors (profile_id, specialization, hospital, registration_no_demo)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'specialization', 'General Medicine'),
            COALESCE(NEW.raw_user_meta_data->>'hospital', 'AIIMS Jodhpur Demo'),
            COALESCE(NEW.raw_user_meta_data->>'registration_no_demo', 'DEMO-REG-0000')
        )
        ON CONFLICT (profile_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- 7.3 Audit Summary Approval Trigger
CREATE OR REPLACE FUNCTION public.audit_summary_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF (OLD.is_verified IS DISTINCT FROM NEW.is_verified AND NEW.is_verified = TRUE) THEN
        INSERT INTO public.audit_log (actor_id, action, entity, entity_id, metadata)
        VALUES (
            auth.uid(),
            'CLINICAL_SUMMARY_VERIFIED',
            'clinical_summaries',
            NEW.id,
            jsonb_build_object(
                'consultation_id', NEW.consultation_id,
                'verified_by', NEW.verified_by,
                'verified_at', NEW.verified_at,
                'chief_complaint', NEW.chief_complaint
            )
        );

        -- Also update consultation status to approved
        UPDATE public.consultations
        SET status = 'approved',
            approved_at = NOW(),
            updated_at = NOW()
        WHERE id = NEW.consultation_id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_summary_approval ON public.clinical_summaries;
CREATE TRIGGER trg_audit_summary_approval
AFTER UPDATE ON public.clinical_summaries
FOR EACH ROW
EXECUTE FUNCTION public.audit_summary_approval();

-- 8. STORAGE CONFIGURATION
-- Ensure private storage bucket 'medical-docs' exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'medical-docs',
    'medical-docs',
    false,
    52428800, -- 50MB
    ARRAY['image/png', 'image/jpeg', 'image/webp', 'application/pdf']::TEXT[]
)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Storage Policies
DROP POLICY IF EXISTS "medical_docs_patient_read" ON storage.objects;
CREATE POLICY "medical_docs_patient_read" ON storage.objects
FOR SELECT USING (
    bucket_id = 'medical-docs'
    AND (
        (auth.uid() IS NOT NULL AND name LIKE (auth.uid() || '/%'))
        OR public.is_doctor()
        OR public.is_admin()
    )
);

DROP POLICY IF EXISTS "medical_docs_patient_upload" ON storage.objects;
CREATE POLICY "medical_docs_patient_upload" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'medical-docs'
    AND (
        (auth.uid() IS NOT NULL AND name LIKE (auth.uid() || '/%'))
        OR public.is_doctor()
        OR public.is_admin()
    )
);

-- 9. SUPABASE REALTIME CONFIGURATION
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.consultations;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.clinical_summaries;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
