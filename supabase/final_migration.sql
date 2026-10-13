-- ============================================================================
-- INDUSTRA MEDICOSE - COMPLETE PRODUCTION SUPABASE DATABASE MIGRATION
-- AAYU 2026 | "Google for Medical" & Autonomous Clinical AI Platform
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CLEANUP PREVIOUS CONFLICTING OBJECTS IF ANY
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.prescriptions CASCADE;
DROP TABLE IF EXISTS public.clinical_summaries CASCADE;
DROP TABLE IF EXISTS public.intake_messages CASCADE;
DROP TABLE IF EXISTS public.consultations CASCADE;
DROP TABLE IF EXISTS public.doctors CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 3. CORE ENUMS
DO $$ BEGIN
    CREATE TYPE public.app_user_role AS ENUM ('patient', 'doctor', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.consultation_urgency_level AS ENUM ('routine', 'attention', 'urgent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.consultation_flow_status AS ENUM ('intake', 'ready_for_review', 'in_review', 'approved', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4. TABLE DEFINITIONS

-- 4.1 Doctors Table (Medical Directory & OPD Specialists)
CREATE TABLE public.doctors (
    id TEXT PRIMARY KEY, -- e.g., 'doc-meera', 'doc-harish', or UUID
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    qualification TEXT NOT NULL,
    specialization TEXT NOT NULL,
    sub_specialties TEXT[] DEFAULT ARRAY[]::TEXT[],
    experience_years INT NOT NULL DEFAULT 5,
    hospital TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Jaipur / Telemedicine',
    registration_no TEXT NOT NULL,
    rating NUMERIC(3,2) NOT NULL DEFAULT 4.90,
    review_count INT NOT NULL DEFAULT 0,
    consultation_fee INT NOT NULL DEFAULT 500,
    modes TEXT[] DEFAULT ARRAY['video', 'clinic', 'hybrid']::TEXT[],
    available_today BOOLEAN NOT NULL DEFAULT true,
    next_slot TEXT NOT NULL DEFAULT 'Today, 4:30 PM',
    languages TEXT[] DEFAULT ARRAY['English', 'Hindi']::TEXT[],
    bio TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_verified BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.2 Patients Table (Comprehensive ABDM-aligned Health Profile)
CREATE TABLE public.patients (
    id TEXT PRIMARY KEY DEFAULT ('p-' || substr(md5(random()::text), 1, 8)),
    uhid TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    age INT NOT NULL,
    gender TEXT NOT NULL,
    blood_group TEXT DEFAULT 'B+',
    height_cm TEXT DEFAULT '170 cm',
    weight_kg TEXT DEFAULT '68 kg',
    chronic_conditions TEXT DEFAULT 'None',
    known_allergies TEXT DEFAULT 'No known drug allergies',
    current_medications TEXT DEFAULT 'None',
    emergency_contact TEXT,
    city TEXT DEFAULT 'Jaipur',
    enable_call_assistant BOOLEAN DEFAULT true,
    consent_status TEXT DEFAULT 'Active (ABDM Verified)',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.3 Consultations Queue & Clinical Summaries
CREATE TABLE public.consultations (
    id TEXT PRIMARY KEY DEFAULT ('c-' || substr(md5(random()::text), 1, 6)),
    uhid TEXT NOT NULL,
    patient_name TEXT NOT NULL,
    age_gender TEXT NOT NULL,
    blood_group TEXT DEFAULT 'B+',
    doctor_id TEXT REFERENCES public.doctors(id) ON DELETE SET NULL,
    chief_complaint TEXT NOT NULL,
    ai_summary_report TEXT,
    vitals TEXT DEFAULT 'BP: 120/80 | HR: 76 | SpO2: 98%',
    urgency public.consultation_urgency_level NOT NULL DEFAULT 'routine',
    status public.consultation_flow_status NOT NULL DEFAULT 'ready_for_review',
    intake_duration_seconds INT DEFAULT 90,
    documents_count INT DEFAULT 0,
    allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
    red_flag TEXT,
    consultation_fee INT DEFAULT 700,
    appointment_mode TEXT DEFAULT 'video',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.4 Appointments & Upcoming Reminders Table
CREATE TABLE public.appointments (
    id TEXT PRIMARY KEY DEFAULT ('apt-' || substr(md5(random()::text), 1, 8)),
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id TEXT REFERENCES public.doctors(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    doctor_name TEXT NOT NULL,
    time_slot TEXT NOT NULL,
    appointment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    mode TEXT NOT NULL DEFAULT 'video', -- 'video', 'clinic', 'hybrid'
    status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled'
    consultation_fee INT NOT NULL DEFAULT 500,
    symptoms TEXT,
    reminder_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.5 Digital Prescriptions Table
CREATE TABLE public.prescriptions (
    id TEXT PRIMARY KEY DEFAULT ('rx-' || substr(md5(random()::text), 1, 8)),
    consultation_id TEXT REFERENCES public.consultations(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    doctor_name TEXT NOT NULL,
    medicines TEXT NOT NULL,
    clinical_advice TEXT,
    next_follow_up_date DATE,
    consultation_fee INT DEFAULT 700,
    is_doctor_signed BOOLEAN NOT NULL DEFAULT true,
    signed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.6 Patient Reviews & Ratings Table
CREATE TABLE public.reviews (
    id TEXT PRIMARY KEY DEFAULT ('rev-' || substr(md5(random()::text), 1, 8)),
    doctor_id TEXT REFERENCES public.doctors(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'hinglish',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_doctors_specialization ON public.doctors(specialization);
CREATE INDEX IF NOT EXISTS idx_doctors_rating ON public.doctors(rating DESC);
CREATE INDEX IF NOT EXISTS idx_patients_uhid ON public.patients(uhid);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON public.consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_urgency ON public.consultations(urgency);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_reviews_doctor ON public.reviews(doctor_id);

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_doctors" ON public.doctors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_patients" ON public.patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_consultations" ON public.consultations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_prescriptions" ON public.prescriptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);

-- 7. INITIAL PRODUCTION SEED DATA

-- 7.1 Seed Doctors (Full Range of 5+ Specialists per Discipline)
INSERT INTO public.doctors (
    id, name, email, phone, qualification, specialization, sub_specialties,
    experience_years, hospital, city, registration_no, rating, review_count,
    consultation_fee, modes, available_today, next_slot, languages, bio, tags, is_verified
) VALUES
-- ==========================================
-- 1. GASTROENTEROLOGISTS & HEPATOLOGISTS (TOP 5 FOR JAUNDICE, LIVER, BILIRUBIN)
-- ==========================================
(
    'doc-harish',
    'Dr. Harish Chandra',
    'dr.harish@blk.in',
    '+91-98180-88808',
    'MBBS, MD, DM (Gastroenterology & Hepatology)',
    'Gastroenterologist',
    ARRAY['Jaundice Management', 'Hepatitis B & C', 'Cirrhosis & Fatty Liver', 'Gallbladder Disorders', 'Acid Reflux & GERD'],
    16,
    'BLK-Max Super Speciality Hospital',
    'New Delhi / Telemedicine',
    'DL-MED-2014-9902',
    4.96,
    380,
    750,
    ARRAY['video', 'clinic', 'hybrid'],
    true,
    'Today, 4:00 PM',
    ARRAY['English', 'Hindi'],
    'Senior Hepatologist and Gastroenterologist with 16+ years treating severe jaundice, viral hepatitis, fatty liver fibrosis, and acute digestive pathology.',
    ARRAY['Jaundice', 'Piliya', 'Liver', 'Hepatitis', 'Bilirubin', 'Yellow eyes', 'Fatty liver', 'Cirrhosis', 'Stomach pain', 'Acidity'],
    true
),
(
    'doc-rajeshwari',
    'Dr. Rajeshwari Sengupta',
    'dr.rajeshwari@medanta.in',
    '+91-98110-33311',
    'MBBS, MD (Medicine), DM (Hepatology & Liver Transplant)',
    'Gastroenterologist',
    ARRAY['Obstructive Jaundice', 'Acute Liver Failure', 'Biliary Tract Disease', 'Bilirubin Clearance', 'Pancreatitis'],
    14,
    'Medanta Institute of Liver Sciences',
    'Gurugram / Telemedicine',
    'HR-MED-2016-5120',
    4.94,
    295,
    850,
    ARRAY['video', 'clinic', 'hybrid'],
    true,
    'Today, 4:45 PM',
    ARRAY['English', 'Hindi', 'Bengali'],
    'Consultant Hepatologist specializing in neonatal & adult jaundice evaluation, high bilirubin diagnosis, ultrasound-guided liver care, and metabolic hepatic triage.',
    ARRAY['Jaundice', 'Piliya', 'Liver disease', 'Yellow skin', 'Bilirubin', 'Hepatitis', 'Gallbladder', 'Dark urine', 'SGPT', 'Enzyme elevation'],
    true
),
(
    'doc-pradeep',
    'Dr. Pradeep Narang',
    'dr.pradeep@aiims.in',
    '+91-98100-22101',
    'MBBS, MD (Medicine), DM (Gastroenterology)',
    'Gastroenterologist',
    ARRAY['Chronic Jaundice', 'Biliary Stenting', 'Portal Hypertension', 'Pancreatic Diseases', 'Endoscopic Ultrasound'],
    18,
    'AIIMS New Delhi Gastroenterology OPD',
    'New Delhi / Telemedicine',
    'DL-MED-2008-1123',
    4.95,
    430,
    800,
    ARRAY['video', 'clinic', 'hybrid'],
    true,
    'Today, 6:15 PM',
    ARRAY['English', 'Hindi', 'Punjabi'],
    'Senior Professor and Chief Gastroenterologist with 18+ years leading national clinical trials in hepatobiliary jaundice interventions and preventive liver wellness.',
    ARRAY['Jaundice', 'Piliya', 'Liver failure', 'Ascites', 'Cirrhosis', 'Bilirubin high', 'Hepatitis B', 'Stomach swelling', 'Liver cancer screening'],
    true
),
(
    'doc-amitabha',
    'Dr. Amitabha Roy',
    'dr.amitabha@fortis.in',
    '+91-94140-77112',
    'MBBS, MD, DNB (Gastroenterology)',
    'Gastroenterologist',
    ARRAY['Infectious Jaundice', 'Hepatitis A & E', 'Alcoholic Liver Disease', 'Gastric Ulcers', 'IBS & Colitis'],
    12,
    'Fortis Escorts Liver & Digestive Institute',
    'Jaipur / Telemedicine',
    'RJ-MED-2017-3841',
    4.92,
    240,
    650,
    ARRAY['video', 'clinic', 'hybrid'],
    true,
    'Today, 5:30 PM',
    ARRAY['English', 'Hindi'],
    'Expert in seasonal water-borne jaundice outbreaks, liver enzyme stabilization, dietary hepatitis recovery plans, and comprehensive abdominal pain diagnosis.',
    ARRAY['Jaundice', 'Piliya', 'Hepatitis A', 'Liver inflammation', 'Bilirubin', 'Vomiting', 'Indigestion', 'Abdominal pain', 'Gastritis'],
    true
),
(
    'doc-shalini',
    'Dr. Shalini Bansal',
    'dr.shalini@max.in',
    '+91-98710-44991',
    'MBBS, MD, DM (Digestive & Hepatic Sciences)',
    'Gastroenterologist',
    ARRAY['Hemolytic Jaundice', 'Liver Enzyme Management', 'Non-Alcoholic Fatty Liver (NAFLD)', 'Gallstones', 'Celiac Disease'],
    11,
    'Max Super Speciality Hospital',
    'New Delhi / Telemedicine',
    'DL-MED-2018-8832',
    4.91,
    210,
    700,
    ARRAY['video', 'clinic', 'hybrid'],
    true,
    'Tomorrow, 10:00 AM',
    ARRAY['English', 'Hindi'],
    'Clinician focused on non-invasive hepatic screening, bilirubin toxicity prevention, pediatric jaundice triage, and gut microbiome optimization.',
    ARRAY['Jaundice', 'Liver function test', 'LFT', 'Bilirubin', 'Fatty liver', 'Piliya', 'Hepatitis', 'Gallstones', 'Digestive issues'],
    true
),

-- ==========================================
-- 2. CARDIOLOGISTS (TOP 5 FOR CHEST PAIN & HEART ATTACK)
-- ==========================================
(
    'doc-meera',
    'Dr. Meera Rathore',
    'dr.meera@hospital.in',
    '+91-98290-11101',
    'MBBS, MD (Medicine), DM (Cardiology)',
    'Cardiologist',
    ARRAY['Heart Attack & STEMI', 'Chest Pain', 'Hypertension', 'Angina', 'Arrhythmia'],
    14,
    'AIIMS Jodhpur Medical Super-Speciality',
    'Jodhpur / Telemedicine',
    'RJ-MED-2016-8921',
    4.95,
    342,
    700,
    ARRAY['video', 'clinic', 'hybrid'],
    true,
    'Today, 4:30 PM',
    ARRAY['English', 'Hindi', 'Marwari'],
    'Senior Interventional Cardiologist with 14+ years in acute coronary syndromes, hypertensive emergency stabilization, and non-invasive cardiac triage.',
    ARRAY['Chest pain', 'Heart attack', 'High BP', 'Breathlessness', 'Palpitations', 'Cholesterol', 'Angina'],
    true
),
(
    'doc-ashok',
    'Dr. Ashok Sethia',
    'dr.ashok@fortis.in',
    '+91-98110-55412',
    'MBBS, MD, DM (Cardiology), FACC',
    'Cardiologist',
    ARRAY['Coronary Angioplasty', 'Heart Failure', 'Cardiomyopathy', 'Post-Bypass Care', 'Lipid Management'],
    20,
    'Fortis Escorts Heart Institute',
    'New Delhi / Telemedicine',
    'DL-MED-2005-7712',
    4.97,
    620,
    950,
    ARRAY['video', 'clinic', 'hybrid'],
    true,
    'Today, 5:00 PM',
    ARRAY['English', 'Hindi'],
    'Pioneering interventional cardiologist with over 20,000 angiograms and emergency angioplasties performed. Expert in cardiac risk prevention.',
    ARRAY['Heart attack', 'Cardiac arrest', 'Chest tightness', 'High blood pressure', 'Cholesterol', 'ECG abnormal'],
    true
),
(
    'doc-talwar',
    'Dr. K. K. Talwar',
    'dr.talwar@max.in',
    '+91-98180-11902',
    'MBBS, MD, DM (Cardiology), Emeritus Prof.',
    'Cardiologist',
    ARRAY['Heart Failure Management', 'Cardiomyopathy', 'Cardiac Resynchronization', 'Advanced Valve Repair'],
    24,
    'Max Healthcare Super Speciality',
    'New Delhi / Telemedicine',
    'DL-MED-1999-0012',
    4.98,
    780,
    1000,
    ARRAY['video', 'clinic', 'hybrid'],
    true,
    'Tomorrow, 2:00 PM',
    ARRAY['English', 'Hindi'],
    'Renowned former AIIMS Head of Cardiology with over 24 years of international acclaim in complex heart failure and emergency cardiac care.',
    ARRAY['Heart failure', 'Breathlessness in bed', 'Swollen ankles', 'Cardiac', 'Chest pain', 'Severe hypertension'],
    true
),

-- ==========================================
-- 3. NEUROLOGISTS (TOP 5 FOR MIGRAINE & BRAIN STROKE)
-- ==========================================
(
    'doc-rajesh',
    'Dr. Rajesh K. Varma',
    'dr.rajesh@apollo.in',
    '+91-98110-22202',
    'MBBS, MD, DM (Neurology)',
    'Neurologist',
    ARRAY['Severe Migraine', 'Stroke Recovery', 'Epilepsy', 'Nerve Pain', 'Vertigo'],
    16,
    'Apollo Multispeciality Hospitals',
    'New Delhi / Telemedicine',
    'DL-MED-2012-4410',
    4.92,
    289,
    900,
    ARRAY['video', 'clinic', 'hybrid'],
    true,
    'Today, 5:15 PM',
    ARRAY['English', 'Hindi'],
    'Chief Neurologist specializing in neuro-critical care, chronic refractory headache management, neuropathy, and preventative stroke protocols.',
    ARRAY['Headache', 'Migraine', 'Dizziness', 'Tremors', 'Numbness', 'Seizures', 'Brain stroke'],
    true
),
(
    'doc-manjari',
    'Dr. Manjari Tripathi',
    'dr.manjari@aiims.in',
    '+91-98100-77341',
    'MBBS, MD, DM (Neurology), FAMS',
    'Neurologist',
    ARRAY['Chronic Migraine & Aura', 'Epilepsy Syndromes', 'Sleep Medicine', 'Cognitive Disorders'],
    18,
    'AIIMS New Delhi Neurosciences',
    'New Delhi / Telemedicine',
    'DL-MED-2009-8812',
    4.96,
    450,
    850,
    ARRAY['video', 'clinic', 'hybrid'],
    true,
    'Tomorrow, 10:30 AM',
    ARRAY['English', 'Hindi'],
    'Leading neuro-physician dedicated to intractable migraine relief, EEG analysis, seizure disorders, and modern pharmacological neurology.',
    ARRAY['Migraine', 'Throbbing headache', 'Aura', 'Sensitivity to light', 'Epilepsy', 'Fits', 'Memory'],
    true
),

-- ==========================================
-- 4. ORTHOPEDIC SURGEONS (TOP 5 FOR JOINT & KNEE PAIN)
-- ==========================================
(
    'doc-ananya',
    'Dr. Ananya Sen',
    'dr.ananya@max.in',
    '+91-98330-33303',
    'MBBS, MS (Orthopaedics), M.Ch (Joints)',
    'Orthopedic Surgeon',
    ARRAY['Joint Pain', 'Osteoarthritis', 'Robotic Knee Care', 'Sports Injuries', 'Fractures'],
    12,
    'Max Super Speciality Hospital',
    'Gurugram / Telemedicine',
    'HR-MED-2015-7731',
    4.88,
    215,
    650,
    ARRAY['video', 'clinic', 'hybrid'],
    true,
    'Today, 6:00 PM',
    ARRAY['English', 'Hindi', 'Bengali'],
    'Orthopedic specialist with extensive experience in robotic knee preservation, degenerative osteoarthritis management, and lumbar spine therapy.',
    ARRAY['Joint pain', 'Knee pain', 'Back pain', 'Arthritis', 'Bone fracture', 'Neck pain', 'Slip disc'],
    true
),
(
    'doc-rajgopal',
    'Dr. Ashok Rajgopal',
    'dr.rajgopal@medanta.in',
    '+91-98100-33991',
    'MBBS, MS, M.Ch, FRCS (Orthopaedics)',
    'Orthopedic Surgeon',
    ARRAY['Total Knee Replacement', 'Revision Joint Surgery', 'Cartilage Preservation', 'Ligament Tear'],
    25,
    'Medanta Bone & Joint Institute',
    'Gurugram / Telemedicine',
    'HR-MED-1998-1200',
    4.97,
    710,
    950,
    ARRAY['video', 'clinic', 'hybrid'],
    true,
    'Tomorrow, 11:00 AM',
    ARRAY['English', 'Hindi'],
    'World-renowned orthopedic surgeon with over 30,000 knee replacements performed. International authority on severe joint arthritis.',
    ARRAY['Knee pain severe', 'Joint replacement', 'Cannot walk', 'Knee swelling', 'Osteoarthritis', 'Bone pain'],
    true
),

-- ==========================================
-- 5. GENERAL PHYSICIANS & INTERNAL MEDICINE
-- ==========================================
(
    'doc-vikram',
    'Dr. Vikramaditya Joshi',
    'dr.vikram@fortis.in',
    '+91-94140-44404',
    'MBBS, MD (Internal Medicine)',
    'General Physician',
    ARRAY['Viral Infections', 'Type 2 Diabetes', 'High Grade Fever', 'Gastritis', 'General Health'],
    18,
    'Fortis Memorial Research Institute',
    'Jaipur / Telemedicine',
    'RJ-MED-2009-3312',
    4.96,
    512,
    500,
    ARRAY['video', 'clinic', 'hybrid'],
    true,
    'Today, 3:45 PM',
    ARRAY['English', 'Hindi'],
    'Senior Consultant in Internal Medicine with comprehensive expertise in metabolic disorders, acute seasonal illnesses, and holistic health triage.',
    ARRAY['Fever', 'Cough', 'Cold', 'Fatigue', 'Weakness', 'Body ache', 'Infection', 'Diabetes', 'Bukhar'],
    true
),
(
    'doc-guleria',
    'Dr. Randeep Guleria',
    'dr.guleria@medanta.in',
    '+91-98110-11223',
    'MBBS, MD (Medicine), DM (Pulmonology), Padmashri',
    'General Physician',
    ARRAY['Severe Viral Fevers', 'Respiratory Infections', 'COVID & Flu Syndromes', 'Tropical Diseases'],
    26,
    'Medanta Internal Medicine & Chest',
    'Gurugram / Telemedicine',
    'DL-MED-1996-0041',
    4.99,
    890,
    900,
    ARRAY['video', 'clinic', 'hybrid'],
    true,
    'Tomorrow, 12:00 PM',
    ARRAY['English', 'Hindi'],
    'Former Director AIIMS New Delhi and national authority in internal medicine, infectious epidemics, and complex multi-system disease triage.',
    ARRAY['Dengue', 'Malaria', 'Typhoid', 'Persistent fever', 'Severe cough', 'Infection', 'Platelets low'],
    true
),

-- ==========================================
-- 6. DERMATOLOGISTS (SKIN RASH, ITCHING, ECZEMA)
-- ==========================================
(
    'doc-siddharth',
    'Dr. Siddharth Kapoor',
    'dr.siddharth@medanta.in',
    '+91-98100-66606',
    'MBBS, MD (Dermatology & Venereology)',
    'Dermatologist',
    ARRAY['Skin Rashes', 'Allergic Dermatitis', 'Eczema', 'Psoriasis', 'Acne & Hair Loss'],
    9,
    'Medanta - The Medicity',
    'Gurugram / Telemedicine',
    'HR-MED-2018-6541',
    4.89,
    174,
    600,
    ARRAY['video', 'clinic', 'hybrid'],
    true,
    'Today, 7:00 PM',
    ARRAY['English', 'Hindi', 'Punjabi'],
    'Clinical dermatologist experienced in tele-dermatoscopy, systemic skin allergies, and advanced pharmacological dermatologic therapy.',
    ARRAY['Skin rash', 'Itching', 'Allergy', 'Eczema', 'Psoriasis', 'Acne', 'Skin infection', 'Khujli', 'Daad'],
    true
),
(
    'doc-rashmi',
    'Dr. Rashmi Sarkar',
    'dr.rashmi@ladyhardinge.in',
    '+91-98180-66110',
    'MBBS, MD, MNAMS (Dermatology)',
    'Dermatologist',
    ARRAY['Chronic Urticaria', 'Autoimmune Skin Conditions', 'Pigmentary Disorders', 'Fungal Infections'],
    17,
    'Lady Hardinge Medical College & Hospital',
    'New Delhi / Telemedicine',
    'DL-MED-2009-4411',
    4.95,
    390,
    750,
    ARRAY['video', 'clinic', 'hybrid'],
    true,
    'Tomorrow, 11:15 AM',
    ARRAY['English', 'Hindi'],
    'Senior Professor and Dermatologist specializing in resistant hives, fungal ringworm infections, melasma, and skin allergy patch testing.',
    ARRAY['Urticaria', 'Hives', 'Red patches', 'Severe itching', 'Ringworm', 'Fungal infection', 'Vitiligo'],
    true
),

-- ==========================================
-- 7. PEDIATRICIANS (CHILDREN HEALTHCARE)
-- ==========================================
(
    'doc-priya',
    'Dr. Priya Mukherjee',
    'dr.priya@rainbow.in',
    '+91-98800-55505',
    'MBBS, MD (Pediatrics), DNB',
    'Pediatrician',
    ARRAY['Child Health', 'Pediatric Asthma', 'Newborn Care', 'Vaccination', 'Child Nutrition'],
    10,
    'Rainbow Children Hospital',
    'Bengaluru / Telemedicine',
    'KA-MED-2017-9023',
    4.91,
    198,
    550,
    ARRAY['video', 'clinic', 'hybrid'],
    true,
    'Tomorrow, 10:30 AM',
    ARRAY['English', 'Hindi', 'Kannada'],
    'Compassionate child healthcare specialist dedicated to pediatric developmental screening, respiratory ailments, and childhood fever protocols.',
    ARRAY['Child fever', 'Vomiting in child', 'Vaccination', 'Child cough', 'Teething', 'Pediatric', 'Bache ko bukhar'],
    true
),
(
    'doc-anupam-sibal',
    'Dr. Anupam Sibal',
    'dr.sibal@apollo.in',
    '+91-98110-44110',
    'MBBS, MD, FIMSA, FIAP (Pediatrics & Pediatric Liver)',
    'Pediatrician',
    ARRAY['Pediatric Jaundice & Liver', 'Newborn Growth', 'Childhood Metabolic Disorders', 'Complex Pediatrics'],
    22,
    'Indraprastha Apollo Hospitals',
    'New Delhi / Telemedicine',
    'DL-MED-2001-4412',
    4.98,
    560,
    850,
    ARRAY['video', 'clinic', 'hybrid'],
    true,
    'Today, 4:00 PM',
    ARRAY['English', 'Hindi'],
    'Eminent pediatric gastroenterologist and child specialist with international authority on neonatal jaundice, biliary atresia, and child liver wellness.',
    ARRAY['Child jaundice', 'Newborn yellow eyes', 'Baby liver', 'Child not gaining weight', 'Pediatric fever'],
    true
),

-- ==========================================
-- 8. ENT SPECIALISTS (EAR, NOSE, THROAT)
-- ==========================================
(
    'doc-sunita',
    'Dr. Sunita Nair',
    'dr.sunita@gangaram.in',
    '+91-98710-77707',
    'MBBS, MS (ENT / Otorhinolaryngology)',
    'ENT Specialist',
    ARRAY['Sinusitis', 'Throat Infection', 'Hearing Loss', 'Ear Pain', 'Tonsillitis'],
    15,
    'Sir Ganga Ram Hospital',
    'New Delhi / Telemedicine',
    'DL-MED-2013-1188',
    4.90,
    226,
    650,
    ARRAY['video', 'clinic', 'hybrid'],
    true,
    'Tomorrow, 11:00 AM',
    ARRAY['English', 'Hindi', 'Malayalam'],
    'Expert ENT surgeon managing acute rhinitis, chronic allergic sinusitis, middle ear infections, and vocal chord pathology.',
    ARRAY['Ear pain', 'Throat pain', 'Sinus', 'Hearing problem', 'Tonsils', 'Runny nose', 'Nosebleed', 'Kaan dard', 'Gala kharab'],
    true
),
(
    'doc-atul-mittal',
    'Dr. Atul Mittal',
    'dr.mittal@fortis.in',
    '+91-98180-99441',
    'MBBS, MS (ENT), Endoscopic Sinus Fellow',
    'ENT Specialist',
    ARRAY['Nasal Polyps & Sinus Surgery', 'Deviated Nasal Septum (DNS)', 'Snoring & Sleep Apnea', 'Allergic Rhinitis'],
    18,
    'Fortis Memorial ENT Institute',
    'Gurugram / Telemedicine',
    'HR-MED-2009-8812',
    4.95,
    410,
    800,
    ARRAY['video', 'clinic', 'hybrid'],
    true,
    'Today, 4:45 PM',
    ARRAY['English', 'Hindi'],
    'Pioneer in functional endoscopic sinus surgery (FESS), chronic headache from blocked sinuses, and snoring correction.',
    ARRAY['Sinus headache', 'Blocked nose', 'Mouth breathing', 'Snoring', 'Sneezing continuous', 'Allergy rhinitis'],
    true
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    specialization = EXCLUDED.specialization,
    consultation_fee = EXCLUDED.consultation_fee,
    rating = EXCLUDED.rating,
    tags = EXCLUDED.tags,
    sub_specialties = EXCLUDED.sub_specialties,
    bio = EXCLUDED.bio;

-- 7.2 Seed Verified Patients
INSERT INTO public.patients (
    id, uhid, full_name, email, phone, age, gender, blood_group,
    height_cm, weight_kg, chronic_conditions, known_allergies, current_medications,
    emergency_contact, city, enable_call_assistant, consent_status
) VALUES
(
    'p-101',
    'UHID-2026-9041',
    'Vikramaditya Rathore',
    'vikram@patient.in',
    '+91-98290-12345',
    54,
    'Male',
    'B+',
    '172 cm',
    '72 kg',
    'Type 2 Diabetes (8 yrs), Hypertension (5 yrs)',
    'Penicillin (Severe Hypersensitivity / Anaphylaxis)',
    'Tab Telmisartan 40mg OD, Tab Metformin 500mg BD',
    '+91-98290-99999 (Family)',
    'Jodhpur',
    true,
    'Active (ABDM Verified)'
),
(
    'p-102',
    'UHID-2026-1022',
    'Aarav Sharma',
    'aarav@patient.in',
    '+91-94140-52101',
    45,
    'Male',
    'O+',
    '175 cm',
    '68 kg',
    'None',
    'No known drug allergies',
    'None',
    '+91-94140-88888 (Spouse)',
    'Jaipur',
    true,
    'Active (ABDM Verified)'
),
(
    'p-103',
    'UHID-2026-3391',
    'Sunita Devi',
    'sunita@patient.in',
    '+91-98291-77777',
    49,
    'Female',
    'A+',
    '158 cm',
    '65 kg',
    'Degenerative Osteoarthritis Right Knee (3 yrs)',
    'Sulfa drugs',
    'Tab Calcium + Vitamin D3 OD',
    '+91-98291-11111 (Son)',
    'Jaipur',
    true,
    'Active (ABDM Verified)'
)
ON CONFLICT (uhid) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    chronic_conditions = EXCLUDED.chronic_conditions;

-- 7.3 Seed Live Consultations Queue with AI Summaries
INSERT INTO public.consultations (
    id, uhid, patient_name, age_gender, blood_group, doctor_id,
    chief_complaint, ai_summary_report, vitals, urgency, status,
    intake_duration_seconds, documents_count, allergies, red_flag, consultation_fee, appointment_mode
) VALUES
(
    'c-101',
    'UHID-2026-9041',
    'Vikramaditya Rathore',
    '54M',
    'B+',
    'doc-harish',
    'Acute Jaundice: Scleral icterus (yellow eyes), dark yellow urine, epigastric discomfort x 4 days',
    'AI Report Synthesis: Reconciled with ABDM health locker. Total Bilirubin: 6.8 mg/dL (Direct: 4.2). SGPT: 240 U/L. Viral Hepatitis Profile flagged. Recommended immediate Hepatology evaluation.',
    'BP: 124/80 | HR: 78 | Bilirubin: 6.8',
    'urgent',
    'ready_for_review',
    114,
    2,
    ARRAY['Penicillin (Severe Hypersensitivity)'],
    'Suspected Acute Hepatitis / Obstructive Jaundice Alert',
    750,
    'video'
),
(
    'c-102',
    'UHID-2026-1022',
    'Aarav Sharma',
    '45M',
    'O+',
    'doc-meera',
    'Acute retrosternal crushing chest pain radiating to left arm x 2 hours',
    'AI Report Synthesis: ECG confirms acute STEMI marker. Suspected Acute Coronary Syndrome.',
    'BP: 130/85 | HR: 84 | SpO2: 98%',
    'urgent',
    'ready_for_review',
    98,
    1,
    ARRAY[]::TEXT[],
    'ACS / STEMI Alert',
    700,
    'video'
),
(
    'c-103',
    'UHID-2026-3391',
    'Sunita Devi',
    '49F',
    'A+',
    'doc-ananya',
    'Severe right knee joint pain and morning stiffness x 2 weeks',
    'AI Report Synthesis: Grade 2 osteoarthritis markers on bilateral knee X-Ray. Recommends calcium & physiotherapy.',
    'BP: 125/80 | SpO2: 99%',
    'routine',
    'approved',
    85,
    1,
    ARRAY['Sulfa drugs'],
    NULL,
    650,
    'clinic'
)
ON CONFLICT (id) DO NOTHING;

-- 7.4 Seed Appointments with Reminders
INSERT INTO public.appointments (
    id, patient_id, doctor_id, patient_name, doctor_name, time_slot,
    appointment_date, mode, status, consultation_fee, symptoms, reminder_sent
) VALUES
(
    'apt-101',
    'p-101',
    'doc-harish',
    'Vikramaditya Rathore',
    'Dr. Harish Chandra',
    'Today, 4:00 PM',
    CURRENT_DATE,
    'video',
    'scheduled',
    750,
    'Acute Jaundice & High Bilirubin Evaluation',
    false
),
(
    'apt-102',
    'p-102',
    'doc-meera',
    'Aarav Sharma',
    'Dr. Meera Rathore',
    'Today, 4:30 PM',
    CURRENT_DATE,
    'video',
    'scheduled',
    700,
    'Chest pain & cardiac evaluation',
    false
)
ON CONFLICT (id) DO NOTHING;

-- 7.5 Seed Patient Reviews
INSERT INTO public.reviews (
    id, doctor_id, patient_name, rating, comment, language
) VALUES
(
    'rev-101',
    'doc-harish',
    'Rameshwar Prasad',
    5,
    'Doctor Harish diagnosed my Jaundice and high bilirubin immediately. His prescribed diet and medicine brought my liver enzymes back to normal in 5 days! Best liver doctor.',
    'hinglish'
),
(
    'rev-102',
    'doc-rajeshwari',
    'Aarav Sharma',
    5,
    'Excellent advice on obstructive jaundice and gallbladder issues. Very polite and knowledgeable.',
    'en'
),
(
    'rev-103',
    'doc-meera',
    'Mohan Lal Sharma',
    5,
    'Doctor sahab ne Hindi me poori dawai samjhayi. Video call par turant consultation mil gaya, bina bheed me khade huye.',
    'hi'
),
(
    'rev-104',
    'doc-ananya',
    'Gurpreet Singh',
    5,
    'Knee pain advice was very effective. Hybrid mode is very convenient.',
    'en'
),
(
    'rev-105',
    'doc-rajesh',
    'Sunita Devi',
    5,
    'Severe migraine treated successfully after suffering for 2 years. Highly recommend Dr. Rajesh Varma.',
    'en'
)
ON CONFLICT (id) DO NOTHING;
