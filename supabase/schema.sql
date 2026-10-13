-- Industra Medicose Database Schema
-- AAYU 2026 Hackathon Problem T01: The Two-Minute Doctor
-- Synthetic EHR schema compliant with Indian ABDM / FHIR R4 principles

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Patients Table
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uhid VARCHAR(32) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(16) NOT NULL,
    contact_number VARCHAR(32),
    allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
    chronic_conditions TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Consultations Table
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID,
    status VARCHAR(32) DEFAULT 'in_queue',
    audio_url TEXT,
    raw_transcript TEXT,
    soap_subjective TEXT,
    soap_objective TEXT,
    soap_assessment TEXT,
    soap_plan TEXT,
    differential_diagnosis TEXT[] DEFAULT ARRAY[]::TEXT[],
    icd10_codes TEXT[] DEFAULT ARRAY[]::TEXT[],
    vitals JSONB DEFAULT '{}'::JSONB,
    consultation_duration_seconds INT DEFAULT 0,
    ai_processing_ms INT DEFAULT 0,
    doctor_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Prescriptions Table
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(128) NOT NULL,
    frequency VARCHAR(128) NOT NULL,
    duration VARCHAR(128) NOT NULL,
    instructions TEXT,
    is_ai_generated BOOLEAN DEFAULT TRUE,
    is_doctor_verified BOOLEAN DEFAULT FALSE,
    interaction_alert TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Clinical Audit Logs (Safety & Governance)
CREATE TABLE IF NOT EXISTS public.clinical_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE,
    action VARCHAR(64) NOT NULL,
    agent_name VARCHAR(64) NOT NULL,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for lightning fast queries (<20ms in high-throughput OPD)
CREATE INDEX IF NOT EXISTS idx_patients_uhid ON public.patients(uhid);
CREATE INDEX IF NOT EXISTS idx_consultations_patient ON public.consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON public.consultations(status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_consultation ON public.prescriptions(consultation_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated doctors and anon access for demo prototype
CREATE POLICY "Allow anon select on patients" ON public.patients FOR SELECT USING (true);
CREATE POLICY "Allow anon insert on patients" ON public.patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon select on consultations" ON public.consultations FOR SELECT USING (true);
CREATE POLICY "Allow anon insert on consultations" ON public.consultations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon select on prescriptions" ON public.prescriptions FOR SELECT USING (true);
CREATE POLICY "Allow anon insert on prescriptions" ON public.prescriptions FOR INSERT WITH CHECK (true);
