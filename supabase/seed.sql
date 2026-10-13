-- ============================================================================
-- INDUSTRA MEDICOSE - SEED DATA (100% SYNTHETIC FOR CLINICAL PROTOTYPE)
-- AAYU 2026 Hackathon | Problem T01: "The Two-Minute Doctor"
-- ============================================================================

-- Disable trigger on auth.users temporarily for deterministic seeding
SET session_replication_role = 'replica';

-- 1. SYNTHETIC AUTH USERS & PROFILES

-- 1.1 DOCTORS
-- Doctor 1: Dr. Meera Rathore (General Medicine)
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
VALUES (
    '11111111-1111-4111-a111-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'dr.meera.rathore@industramedicose.demo',
    crypt('SyntheticPass2026!', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"full_name": "Dr. Meera Rathore", "role": "doctor", "specialization": "General Medicine", "hospital": "AIIMS Jodhpur Demo", "registration_no_demo": "RJ-MED-2016-8921"}'::jsonb,
    false, 'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, role, preferred_language, phone)
VALUES (
    '11111111-1111-4111-a111-000000000001',
    'Dr. Meera Rathore',
    'doctor',
    'hi',
    '+91-98290-11101'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.doctors (id, profile_id, specialization, hospital, registration_no_demo)
VALUES (
    '22222222-2222-4222-a222-000000000001',
    '11111111-1111-4111-a111-000000000001',
    'General Medicine & Diabetology',
    'AIIMS Jodhpur Demo Hospital',
    'RJ-MED-2016-8921'
) ON CONFLICT (id) DO NOTHING;

-- Doctor 2: Dr. Arjun Singhvi (Pediatrics)
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
VALUES (
    '11111111-1111-4111-a111-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'dr.arjun.singhvi@industramedicose.demo',
    crypt('SyntheticPass2026!', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"full_name": "Dr. Arjun Singhvi", "role": "doctor", "specialization": "Pediatrics", "hospital": "Umaid Hospital Jodhpur Demo", "registration_no_demo": "RJ-PED-2019-4412"}'::jsonb,
    false, 'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, role, preferred_language, phone)
VALUES (
    '11111111-1111-4111-a111-000000000002',
    'Dr. Arjun Singhvi',
    'doctor',
    'en',
    '+91-98290-11102'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.doctors (id, profile_id, specialization, hospital, registration_no_demo)
VALUES (
    '22222222-2222-4222-a222-000000000002',
    '11111111-1111-4111-a111-000000000002',
    'Pediatrics & Neonatal Care',
    'Umaid Hospital Jodhpur Demo',
    'RJ-PED-2019-4412'
) ON CONFLICT (id) DO NOTHING;

-- 1.2 SYNTHETIC PATIENTS (JODHPUR-STYLE INDIAN NAMES)

-- Patient 1: Vikramaditya Rathore (54, M, B+) - Urgent chest symptoms
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
VALUES (
    '33333333-3333-4333-a333-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'vikramaditya.rathore.demo@synthetic.in',
    crypt('SyntheticPass2026!', gen_salt('bf')),
    NOW(),
    '{"provider": "email"}'::jsonb,
    '{"full_name": "Vikramaditya Rathore", "role": "patient"}'::jsonb,
    false, 'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, role, preferred_language, phone)
VALUES ('33333333-3333-4333-a333-000000000001', 'Vikramaditya Rathore', 'patient', 'hi', '+91-94140-52101')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.patients (id, profile_id, age, sex, blood_group, known_allergies, chronic_conditions, consent_given, consent_at)
VALUES (
    '44444444-4444-4444-a444-000000000001',
    '33333333-3333-4333-a333-000000000001',
    54, 'male', 'B+',
    ARRAY['Penicillin', 'Amoxicillin']::text[],
    ARRAY['Hypertension', 'Dyslipidemia']::text[],
    true, NOW() - INTERVAL '15 days'
) ON CONFLICT (id) DO NOTHING;

-- Patient 2: Shanti Devi Gehlot (68, F, O+) - Diabetes & Osteoarthritis
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
VALUES (
    '33333333-3333-4333-a333-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'shanti.gehlot.demo@synthetic.in',
    crypt('SyntheticPass2026!', gen_salt('bf')),
    NOW(),
    '{"provider": "email"}'::jsonb,
    '{"full_name": "Shanti Devi Gehlot", "role": "patient"}'::jsonb,
    false, 'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, role, preferred_language, phone)
VALUES ('33333333-3333-4333-a333-000000000002', 'Shanti Devi Gehlot', 'patient', 'hi', '+91-94140-52102')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.patients (id, profile_id, age, sex, blood_group, known_allergies, chronic_conditions, consent_given, consent_at)
VALUES (
    '44444444-4444-4444-a444-000000000002',
    '33333333-3333-4333-a333-000000000002',
    68, 'female', 'O+',
    ARRAY['Sulfa Drugs']::text[],
    ARRAY['Type 2 Diabetes Mellitus', 'Bilateral Knee Osteoarthritis']::text[],
    true, NOW() - INTERVAL '30 days'
) ON CONFLICT (id) DO NOTHING;

-- Patient 3: Mahendra Bhati (38, M, A+) - Fever with cough
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
VALUES (
    '33333333-3333-4333-a333-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'mahendra.bhati.demo@synthetic.in',
    crypt('SyntheticPass2026!', gen_salt('bf')),
    NOW(),
    '{"provider": "email"}'::jsonb,
    '{"full_name": "Mahendra Bhati", "role": "patient"}'::jsonb,
    false, 'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, role, preferred_language, phone)
VALUES ('33333333-3333-4333-a333-000000000003', 'Mahendra Bhati', 'patient', 'en', '+91-94140-52103')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.patients (id, profile_id, age, sex, blood_group, known_allergies, chronic_conditions, consent_given, consent_at)
VALUES (
    '44444444-4444-4444-a444-000000000003',
    '33333333-3333-4333-a333-000000000003',
    38, 'male', 'A+',
    ARRAY[]::text[],
    ARRAY['Active Tobacco Smoker (10 pack-years)']::text[],
    true, NOW() - INTERVAL '7 days'
) ON CONFLICT (id) DO NOTHING;

-- Patient 4: Kavita Chouhan (29, F, AB+) - Bronchial Asthma
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
VALUES (
    '33333333-3333-4333-a333-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'kavita.chouhan.demo@synthetic.in',
    crypt('SyntheticPass2026!', gen_salt('bf')),
    NOW(),
    '{"provider": "email"}'::jsonb,
    '{"full_name": "Kavita Chouhan", "role": "patient"}'::jsonb,
    false, 'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, role, preferred_language, phone)
VALUES ('33333333-3333-4333-a333-000000000004', 'Kavita Chouhan', 'patient', 'hi', '+91-94140-52104')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.patients (id, profile_id, age, sex, blood_group, known_allergies, chronic_conditions, consent_given, consent_at)
VALUES (
    '44444444-4444-4444-a444-000000000004',
    '33333333-3333-4333-a333-000000000004',
    29, 'female', 'AB+',
    ARRAY['Aspirin', 'Ibuprofen']::text[],
    ARRAY['Bronchial Asthma']::text[],
    true, NOW() - INTERVAL '2 days'
) ON CONFLICT (id) DO NOTHING;

-- Patient 5: Aarav Joshi (4, M, O+) - Child with vomiting
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
VALUES (
    '33333333-3333-4333-a333-000000000005',
    '00000000-0000-0000-0000-000000000000',
    'aarav.joshi.guardian@synthetic.in',
    crypt('SyntheticPass2026!', gen_salt('bf')),
    NOW(),
    '{"provider": "email"}'::jsonb,
    '{"full_name": "Aarav Joshi", "role": "patient"}'::jsonb,
    false, 'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, role, preferred_language, phone)
VALUES ('33333333-3333-4333-a333-000000000005', 'Aarav Joshi', 'patient', 'hi', '+91-94140-52105')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.patients (id, profile_id, age, sex, blood_group, known_allergies, chronic_conditions, consent_given, consent_at)
VALUES (
    '44444444-4444-4444-a444-000000000005',
    '33333333-3333-4333-a333-000000000005',
    4, 'male', 'O+',
    ARRAY[]::text[],
    ARRAY[]::text[],
    true, NOW() - INTERVAL '1 day'
) ON CONFLICT (id) DO NOTHING;

-- Patient 6: Rukmani Bishnoi (45, F, B-) - Hypothyroidism
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
VALUES (
    '33333333-3333-4333-a333-000000000006',
    '00000000-0000-0000-0000-000000000000',
    'rukmani.bishnoi.demo@synthetic.in',
    crypt('SyntheticPass2026!', gen_salt('bf')),
    NOW(),
    '{"provider": "email"}'::jsonb,
    '{"full_name": "Rukmani Bishnoi", "role": "patient"}'::jsonb,
    false, 'authenticated', 'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, role, preferred_language, phone)
VALUES ('33333333-3333-4333-a333-000000000006', 'Rukmani Bishnoi', 'patient', 'hi', '+91-94140-52106')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.patients (id, profile_id, age, sex, blood_group, known_allergies, chronic_conditions, consent_given, consent_at)
VALUES (
    '44444444-4444-4444-a444-000000000006',
    '33333333-3333-4333-a333-000000000006',
    45, 'female', 'B-',
    ARRAY['Shellfish']::text[],
    ARRAY['Primary Hypothyroidism']::text[],
    true, NOW() - INTERVAL '60 days'
) ON CONFLICT (id) DO NOTHING;

-- 2. SYNTHETIC CONSULTATIONS (8 RECORDS ACROSS ALL STATUSES)

-- Consultation 1: Vikramaditya Rathore (Urgent Chest Symptoms, ready_for_review)
INSERT INTO public.consultations (id, patient_id, doctor_id, status, urgency, language, started_at, intake_duration_seconds)
VALUES (
    '55555555-5555-4555-a555-000000000001',
    '44444444-4444-4444-a444-000000000001',
    '22222222-2222-4222-a222-000000000001',
    'ready_for_review', 'urgent', 'hi',
    NOW() - INTERVAL '15 minutes', 114
) ON CONFLICT (id) DO NOTHING;

-- Consultation 2: Shanti Devi Gehlot (Diabetes Follow-Up, in_review)
INSERT INTO public.consultations (id, patient_id, doctor_id, status, urgency, language, started_at, intake_duration_seconds)
VALUES (
    '55555555-5555-4555-a555-000000000002',
    '44444444-4444-4444-a444-000000000002',
    '22222222-2222-4222-a222-000000000001',
    'in_review', 'attention', 'hi',
    NOW() - INTERVAL '35 minutes', 98
) ON CONFLICT (id) DO NOTHING;

-- Consultation 3: Mahendra Bhati (Fever with Cough, approved)
INSERT INTO public.consultations (id, patient_id, doctor_id, status, urgency, language, started_at, approved_at, intake_duration_seconds)
VALUES (
    '55555555-5555-4555-a555-000000000003',
    '44444444-4444-4444-a444-000000000003',
    '22222222-2222-4222-a222-000000000001',
    'approved', 'routine', 'en',
    NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 45 minutes', 82
) ON CONFLICT (id) DO NOTHING;

-- Consultation 4: Aarav Joshi (Child vomiting, ready_for_review)
INSERT INTO public.consultations (id, patient_id, doctor_id, status, urgency, language, started_at, intake_duration_seconds)
VALUES (
    '55555555-5555-4555-a555-000000000004',
    '44444444-4444-4444-a444-000000000005',
    '22222222-2222-4222-a222-000000000002',
    'ready_for_review', 'urgent', 'hi',
    NOW() - INTERVAL '10 minutes', 105
) ON CONFLICT (id) DO NOTHING;

-- Consultation 5: Kavita Chouhan (Asthma Exacerbation, intake active)
INSERT INTO public.consultations (id, patient_id, doctor_id, status, urgency, language, started_at, intake_duration_seconds)
VALUES (
    '55555555-5555-4555-a555-000000000005',
    '44444444-4444-4444-a444-000000000004',
    NULL,
    'intake', 'attention', 'hi',
    NOW() - INTERVAL '4 minutes', 42
) ON CONFLICT (id) DO NOTHING;

-- Consultation 6: Rukmani Bishnoi (Hypothyroidism Review, closed)
INSERT INTO public.consultations (id, patient_id, doctor_id, status, urgency, language, started_at, approved_at, intake_duration_seconds)
VALUES (
    '55555555-5555-4555-a555-000000000006',
    '44444444-4444-4444-a444-000000000006',
    '22222222-2222-4222-a222-000000000001',
    'closed', 'routine', 'hi',
    NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '10 minutes', 75
) ON CONFLICT (id) DO NOTHING;

-- Consultation 7: Vikramaditya Rathore (Historical Routine Checkup, closed)
INSERT INTO public.consultations (id, patient_id, doctor_id, status, urgency, language, started_at, approved_at, intake_duration_seconds)
VALUES (
    '55555555-5555-4555-a555-000000000007',
    '44444444-4444-4444-a444-000000000001',
    '22222222-2222-4222-a222-000000000001',
    'closed', 'routine', 'hi',
    NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days' + INTERVAL '12 minutes', 89
) ON CONFLICT (id) DO NOTHING;

-- Consultation 8: Shanti Devi Gehlot (Quarterly HbA1c Review, approved)
INSERT INTO public.consultations (id, patient_id, doctor_id, status, urgency, language, started_at, approved_at, intake_duration_seconds)
VALUES (
    '55555555-5555-4555-a555-000000000008',
    '44444444-4444-4444-a444-000000000002',
    '22222222-2222-4222-a222-000000000001',
    'approved', 'routine', 'hi',
    NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days' + INTERVAL '15 minutes', 92
) ON CONFLICT (id) DO NOTHING;

-- 3. INTAKE MESSAGES (CONVERSATION TRANSCRIPTS)

-- Messages for Consultation 1 (Chest tightness)
INSERT INTO public.intake_messages (consultation_id, role, content, input_mode, language, created_at)
VALUES
('55555555-5555-4555-a555-000000000001', 'agent', 'नमस्ते विक्रम जी। आज आपको क्या परेशानी महसूस हो रही है?', 'text', 'hi', NOW() - INTERVAL '15 minutes'),
('55555555-5555-4555-a555-000000000001', 'patient', 'डॉक्टर साहब, पिछले 2 घंटे से छाती के बीच में बहुत भारीपन और दबाव लग रहा है। दर्द बाएं कंधे की तरफ भी जा रहा है और पसीना आ रहा है।', 'voice', 'hi', NOW() - INTERVAL '14 minutes'),
('55555555-5555-4555-a555-000000000001', 'agent', 'क्या आपको सांस फूलने या चक्कर आने की भी शिकायत है? क्या पहले भी ऐसा दर्द हुआ है?', 'text', 'hi', NOW() - INTERVAL '13 minutes'),
('55555555-5555-4555-a555-000000000001', 'patient', 'सांस थोड़ी फूल रही है। पहले कभी इतना तेज दर्द नहीं हुआ। मैं बीपी की गोली Telmisartan 40mg लेता हूं।', 'voice', 'hi', NOW() - INTERVAL '12 minutes'),
('55555555-5555-4555-a555-000000000001', 'agent', 'मैंने आपकी स्थिति दर्ज कर ली है। आपके लक्षण अति-संवेदनशील हैं। डॉ. मीरा राठौर को तत्काल अलर्ट भेज दिया गया है।', 'text', 'hi', NOW() - INTERVAL '11 minutes');

-- Messages for Consultation 3 (Fever with Cough)
INSERT INTO public.intake_messages (consultation_id, role, content, input_mode, language, created_at)
VALUES
('55555555-5555-4555-a555-000000000003', 'agent', 'Hello Mahendra. How may our clinical intake team assist you today?', 'text', 'en', NOW() - INTERVAL '2 hours'),
('55555555-5555-4555-a555-000000000003', 'patient', 'I have had a high fever around 101 F for 3 days accompanied by dry cough, sore throat, and generalized body aches.', 'text', 'en', NOW() - INTERVAL '1 hour 58 minutes'),
('55555555-5555-4555-a555-000000000003', 'agent', 'Any breathing difficulty, hemoptysis (coughing blood), or chest pain?', 'text', 'en', NOW() - INTERVAL '1 hour 56 minutes'),
('55555555-5555-4555-a555-000000000003', 'patient', 'No blood, no chest pain. Only throat irritation and fever spikes in evening. Took Paracetamol 650mg SOS.', 'text', 'en', NOW() - INTERVAL '1 hour 54 minutes');

-- Messages for Consultation 4 (Child with vomiting)
INSERT INTO public.intake_messages (consultation_id, role, content, input_mode, language, created_at)
VALUES
('55555555-5555-4555-a555-000000000004', 'agent', 'नमस्ते। आरव की माताजी/पिताजी, बताएं बच्चे को क्या तकलीफ है?', 'text', 'hi', NOW() - INTERVAL '10 minutes'),
('55555555-5555-4555-a555-000000000004', 'patient', 'डॉक्टर साहब, 4 साल का आरव कल रात से 6-7 बार उल्टी कर चुका है। पानी भी नहीं पी पा रहा है और बहुत सुस्त हो गया है।', 'voice', 'hi', NOW() - INTERVAL '9 minutes'),
('55555555-5555-4555-a555-000000000004', 'agent', 'क्या बच्चे ने पिछले 6 घंटे में पेशाब किया है? क्या पेट में दर्द या दस्त भी हैं?', 'text', 'hi', NOW() - INTERVAL '8 minutes'),
('55555555-5555-4555-a555-000000000004', 'patient', 'सुबह से पेशाब नहीं किया है, होंठ सूखे हुए हैं। हल्का पतला दस्त भी 2 बार हुआ।', 'voice', 'hi', NOW() - INTERVAL '7 minutes');

-- 4. REALISTIC CLINICAL SUMMARIES

-- Summary for Consultation 1 (Chest Tightness - Urgent Case)
INSERT INTO public.clinical_summaries (
    consultation_id, chief_complaint, symptom_duration, history_of_present_illness, past_history,
    medications, allergies, red_flags, missing_info, ai_draft_note, doctor_edited_note,
    is_verified, verified_by, verified_at
) VALUES (
    '55555555-5555-4555-a555-000000000001',
    'Acute retrosternal chest pressure radiating to left shoulder with diaphoresis',
    '2 hours',
    'Patient reports sudden onset squeezing chest pressure (8/10) beginning at rest, associated with cold sweats and mild shortness of breath. No relief with rest.',
    'Essential Hypertension (5 yrs), Hyperlipidemia. Known allergy to Penicillin (anaphylactoid rash).',
    '[{"name": "Telmisartan", "dosage": "40mg", "frequency": "OD", "duration": "Chronic"}]'::jsonb,
    '[{"allergen": "Penicillin", "reaction": "Cutaneous rash & edema", "severity": "severe"}]'::jsonb,
    '[{"flag": "Acute Coronary Syndrome (ACS) suspected", "severity": "urgent", "action": "Immediate 12-lead ECG and Troponin I"}]'::jsonb,
    '["Recent lipid profile", "Baseline serum creatinine"]'::jsonb,
    'S: 54yo M with sudden onset retrosternal crushing chest pain radiating to left shoulder x2h, diaphoresis, dyspnea. O: BP 168/104, HR 108, SpO2 95%. A: Suspected Acute Coronary Syndrome (Unstable Angina / NSTEMI). P: Stat ECG, Aspirin 300mg chewed, Clopidogrel 300mg, Atorvastatin 80mg, transfer to CCU.',
    NULL,
    false, NULL, NULL
) ON CONFLICT (consultation_id) DO NOTHING;

-- Summary for Consultation 2 (Diabetes Follow-Up - Attention Case)
INSERT INTO public.clinical_summaries (
    consultation_id, chief_complaint, symptom_duration, history_of_present_illness, past_history,
    medications, allergies, red_flags, missing_info, ai_draft_note, doctor_edited_note,
    is_verified, verified_by, verified_at
) VALUES (
    '55555555-5555-4555-a555-000000000002',
    'Sub-optimally controlled Type 2 Diabetes with bilateral burning foot numbness',
    '3 weeks',
    '68yo female presenting for quarterly review. Home fasting capillary blood glucose tracking between 190-230 mg/dL. Reports persistent nocturnal paresthesia in both feet.',
    'Type 2 Diabetes Mellitus x 12 yrs, Osteoarthritis knees, Sulfa drug allergy.',
    '[{"name": "Metformin", "dosage": "500mg", "frequency": "BD", "duration": "Ongoing"}, {"name": "Paracetamol", "dosage": "650mg", "frequency": "SOS", "duration": "PRN"}]'::jsonb,
    '[{"allergen": "Sulfa drugs", "reaction": "Steven-Johnson warning / severe erythema", "severity": "severe"}]'::jsonb,
    '[{"flag": "Peripheral diabetic sensory neuropathy", "severity": "attention", "action": "Monofilament exam + HbA1c test"}]'::jsonb,
    '["Recent HbA1c value", "Urine microalbumin/creatinine ratio"]'::jsonb,
    'S: 68yo F with uncontrolled hyperglycemia and stocking-glove paresthesia. O: BP 136/82, BMI 28.4. A: Poorly controlled T2DM with probable early distal symmetric polyneuropathy. P: Increase Metformin to 1000mg BD, add Teneligliptin 20mg OD, order HbA1c, renal panel, podiatry inspection.',
    'S: 68yo F with T2DM. O: Monofilament testing demonstrates reduced sensation in 1st metatarsal bilaterally. A: T2DM with peripheral sensory neuropathy. P: Metformin titrated to 1000mg BD with meals. Added Teneligliptin 20mg OD. Foot care counseling provided. Review in 4 weeks.',
    false, '22222222-2222-4222-a222-000000000001', NULL
) ON CONFLICT (consultation_id) DO NOTHING;

-- Summary for Consultation 3 (Fever with Cough - Approved)
INSERT INTO public.clinical_summaries (
    consultation_id, chief_complaint, symptom_duration, history_of_present_illness, past_history,
    medications, allergies, red_flags, missing_info, ai_draft_note, doctor_edited_note,
    is_verified, verified_by, verified_at
) VALUES (
    '55555555-5555-4555-a555-000000000003',
    'Acute viral upper respiratory tract infection with moderate fever and dry cough',
    '3 days',
    '38yo male smoker presenting with low to moderate grade fever up to 101 F, scratchy throat, myalgia, and dry hacking cough. No dyspnea or hemoptysis.',
    'Tobacco smoking 10 pack-years. No drug allergies.',
    '[{"name": "Paracetamol", "dosage": "650mg", "frequency": "TDS SOS", "duration": "3 days"}]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    'S: 38yo M with fever 101F, dry cough, odynophagia x3d. O: Temp 100.2F, SpO2 98% room air, chest clear bilaterally. A: Acute viral pharyngitis and bronchitis. P: Paracetamol 650mg TDS x 3d, Levocetirizine + Montelukast 1 tab nocte x 5d, steam inhalation, warm saline gargles. Return if fever >5 days.',
    'S: 38yo M, 3-day history of URTI symptoms. O: Pharyngeal injection without exudates, lungs clear. A: Acute Viral Upper Respiratory Infection. P: Supportive treatment confirmed: Paracetamol 650mg PO TDS PRN, hydration, warm saline gargles. Smoking cessation advised.',
    true, '22222222-2222-4222-a222-000000000001', NOW() - INTERVAL '1 hour 45 minutes'
) ON CONFLICT (consultation_id) DO NOTHING;

-- Summary for Consultation 4 (Pediatric Vomiting - Urgent Case)
INSERT INTO public.clinical_summaries (
    consultation_id, chief_complaint, symptom_duration, history_of_present_illness, past_history,
    medications, allergies, red_flags, missing_info, ai_draft_note, doctor_edited_note,
    is_verified, verified_by, verified_at
) VALUES (
    '55555555-5555-4555-a555-000000000004',
    'Acute pediatric gastroenteritis with intractable vomiting and moderate dehydration risk',
    '18 hours',
    '4-year-old male child brought by parents with 6-7 episodes of non-bilious vomiting since yesterday evening. Inability to retain oral fluids, oliguria (no urine passed in >6 hours), dry mucous membranes.',
    'Fully vaccinated for age. No prior hospitalizations or known allergies.',
    '[]'::jsonb,
    '[]'::jsonb,
    '[{"flag": "Moderate dehydration with oliguria in young child", "severity": "urgent", "action": "Assess skin turgor, initiate oral rehydration solution (ORS) via spoon or IV hydration"}]'::jsonb,
    '["Weight in kg", "Capillary refill time"]'::jsonb,
    'S: 4yo child with frequent emesis x18h, decreased wet diapers, lethargy. O: Dry lips, sunken eyes. A: Acute gastroenteritis with dehydration. P: Ondansetron syrup 2mg single dose, slow ORS sips (5ml every 5 mins). If vomiting persists, refer to pediatric emergency for IV fluid bolus.',
    NULL,
    false, NULL, NULL
) ON CONFLICT (consultation_id) DO NOTHING;

-- Summary for Consultation 6 (Hypothyroidism Review - Closed)
INSERT INTO public.clinical_summaries (
    consultation_id, chief_complaint, symptom_duration, history_of_present_illness, past_history,
    medications, allergies, red_flags, missing_info, ai_draft_note, doctor_edited_note,
    is_verified, verified_by, verified_at
) VALUES (
    '55555555-5555-4555-a555-000000000006',
    'Routine annual thyroid function panel monitoring and general well-being check',
    'Chronic',
    '45yo female with diagnosed hypothyroidism on regular Levothyroxine therapy. Serum TSH at 2.4 uIU/mL (euthyroid). Reports stable energy and weight.',
    'Primary Hypothyroidism (6 yrs). Shellfish allergy.',
    '[{"name": "Levothyroxine Sodium", "dosage": "75mcg", "frequency": "OD on empty stomach", "duration": "Chronic"}]'::jsonb,
    '[{"allergen": "Shellfish", "reaction": "Urticaria", "severity": "moderate"}]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    'S: 45yo F for thyroid follow up. O: TSH 2.4, vitals normal. A: Controlled hypothyroidism. P: Continue Levothyroxine 75mcg OD empty stomach. Re-test TSH in 12 months.',
    'S: Routine thyroid review. TSH euthyroid at 2.4. A: Compensated hypothyroidism. P: Continue current Levothyroxine 75mcg. Repeat TSH next year.',
    true, '22222222-2222-4222-a222-000000000001', NOW() - INTERVAL '3 days'
) ON CONFLICT (consultation_id) DO NOTHING;

-- Summary for Consultation 8 (Past HbA1c Review - Approved)
INSERT INTO public.clinical_summaries (
    consultation_id, chief_complaint, symptom_duration, history_of_present_illness, past_history,
    medications, allergies, red_flags, missing_info, ai_draft_note, doctor_edited_note,
    is_verified, verified_by, verified_at
) VALUES (
    '55555555-5555-4555-a555-000000000008',
    'Routine diabetic laboratory results review and medication compliance counseling',
    'Chronic',
    '68yo female presenting for scheduled laboratory review. HbA1c was 8.2% (elevated). Serum creatinine 0.9 mg/dL. Reports good dietary compliance but reduced physical activity due to knee joint pain.',
    'T2DM, Bilateral knee osteoarthritis. Sulfa allergy.',
    '[{"name": "Metformin", "dosage": "500mg", "frequency": "BD", "duration": "Ongoing"}]'::jsonb,
    '[{"allergen": "Sulfa drugs", "reaction": "Severe cutaneous allergy", "severity": "severe"}]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    'S: 68yo F with HbA1c 8.2%. A: Inadequately controlled T2DM. P: Optimize lifestyle, counsel on physical activity and low glycemic diet.',
    'S: HbA1c 8.2% reviewed. A: Uncontrolled T2DM. P: Dietary reinforcement, gradual walking exercise for knee osteoarthritis. Re-evaluate.',
    true, '22222222-2222-4222-a222-000000000001', NOW() - INTERVAL '14 days'
) ON CONFLICT (consultation_id) DO NOTHING;

-- 5. SYNTHETIC DOCUMENTS
INSERT INTO public.documents (
    id, consultation_id, patient_id, storage_path, file_name, mime_type, ocr_text, extracted, status, confidence
) VALUES
(
    '66666666-6666-4666-a666-000000000001',
    '55555555-5555-4555-a555-000000000001',
    '44444444-4444-4444-a444-000000000001',
    '33333333-3333-4333-a333-000000000001/ecg_prior_2025.pdf',
    'Prior_Cardiology_ECG_2025.pdf',
    'application/pdf',
    'AIIMS Jodhpur Demo Diagnostic Lab. ECG 12-Lead: Normal Sinus Rhythm. Rate: 72 bpm. PR interval: 140ms. QRS: 88ms. No ST-T changes noted.',
    '{"modality": "ECG", "interpretation": "Normal Sinus Rhythm", "heart_rate": 72, "st_elevation": false}'::jsonb,
    'extracted',
    0.985
),
(
    '66666666-6666-4666-a666-000000000002',
    '55555555-5555-4555-a555-000000000002',
    '44444444-4444-4444-a444-000000000002',
    '33333333-3333-4333-a333-000000000002/hba1c_lab_report.jpg',
    'HbA1c_Lab_Report.jpg',
    'image/jpeg',
    'Thyrocare / Dr. Lal PathLabs Demo Jodhpur. Patient: Shanti Devi Gehlot. Test: Glycosylated Hemoglobin (HbA1c). Result: 8.4 %. Estimated Avg Glucose (eAG): 194 mg/dL. Biological Ref: <5.7% Normal, >6.5% Diabetic.',
    '{"test_name": "HbA1c", "result_value": 8.4, "unit": "%", "status": "high", "eag": 194}'::jsonb,
    'extracted',
    0.992
) ON CONFLICT (id) DO NOTHING;

-- 6. SYNTHETIC AGENT RUN AUDIT
INSERT INTO public.agent_runs (consultation_id, agent_name, input, output, latency_ms, status)
VALUES
(
    '55555555-5555-4555-a555-000000000001',
    'ScribeAgent',
    '{"audio_duration_seconds": 114, "language_detected": "hi", "code_switching": true}'::jsonb,
    '{"transcript_length": 340, "entities_extracted": ["chest pressure", "radiating pain", "diaphoresis", "Telmisartan 40mg"]}'::jsonb,
    380,
    'success'
),
(
    '55555555-5555-4555-a555-000000000001',
    'SafetyGuardAgent',
    '{"allergies": ["Penicillin"], "symptoms": ["chest pressure"]}'::jsonb,
    '{"rules_evaluated": 15, "urgent_hits": ["Acute Chest Pain / Angina", "Anaphylaxis Avoidance"], "contraindications": ["Avoid Penicillin / Beta-lactams"]}'::jsonb,
    210,
    'success'
),
(
    '55555555-5555-4555-a555-000000000001',
    'DiagnosticianAgent',
    '{"symptoms": "chest tightness with radiation to left shoulder"}'::jsonb,
    '{"icd10": ["I20.0", "I21.9"], "differential": ["Unstable Angina", "Non-ST Elevation Myocardial Infarction"]}'::jsonb,
    640,
    'success'
) ON CONFLICT (id) DO NOTHING;

-- 7. SYNTHETIC AUDIT LOG ENTRIES
INSERT INTO public.audit_log (actor_id, action, entity, entity_id, metadata)
VALUES
(
    '11111111-1111-4111-a111-000000000001',
    'CONSULTATION_APPROVED',
    'consultations',
    '55555555-5555-4555-a555-000000000003',
    '{"doctor_id": "22222222-2222-4222-a222-000000000001", "patient": "Mahendra Bhati", "intake_seconds": 82}'::jsonb
),
(
    '11111111-1111-4111-a111-000000000001',
    'CLINICAL_SUMMARY_VERIFIED',
    'clinical_summaries',
    '55555555-5555-4555-a555-000000000003',
    '{"verified_by": "Dr. Meera Rathore", "specialization": "General Medicine"}'::jsonb
);

-- 8. 15 BILINGUAL CLINICIAN-REVIEWABLE SAFETY RULES

INSERT INTO public.safety_rules (id, name, keywords_en, keywords_hi, severity, guidance_en, guidance_hi, is_active)
VALUES
-- Rule 1: Acute Chest Pain / Angina
(
    '77777777-7777-4777-a777-000000000001',
    'Acute Chest Pain / Angina',
    ARRAY['chest pain', 'chest pressure', 'chest tightness', 'heaviness in chest', 'left arm pain', 'jaw pain', 'crushing pain']::text[],
    ARRAY['छाती में दर्द', 'सीने में दर्द', 'छाती में भारीपन', 'सीने में दबाव', 'बाएं हाथ में दर्द', 'जबड़े में दर्द']::text[],
    'urgent',
    'Flag immediate red alert. Prompt physician for STAT 12-lead ECG, cardiac biomarkers (Troponin I), oxygen saturation check, and sublingual nitrate/antiplatelet protocol.',
    'तत्काल आपातकालीन अलर्ट दें। डॉक्टर को तुरंत 12-लीड ईसीजी, ट्रोपोनिन टेस्ट और आपातकालीन हृदय प्रोटोकॉल सक्रिय करने का निर्देश दें।',
    true
),
-- Rule 2: Severe Dyspnea / Stridor
(
    '77777777-7777-4777-a777-000000000002',
    'Severe Dyspnea / Stridor',
    ARRAY['shortness of breath', 'cannot breathe', 'gasping', 'stridor', 'severe wheezing', 'suffocating', 'blue lips', 'cyanosis']::text[],
    ARRAY['सांस फूलना', 'सांस नहीं आ रही', 'दम घुटना', 'नीले होंठ', 'सांस में सीटी की आवाज', 'अत्यधिक सांस की तकलीफ']::text[],
    'urgent',
    'Evaluate airway patency, check SpO2 immediately. Keep nebulization (Salbutamol/Ipratropium) and high-flow oxygen ready.',
    'वायुमार्ग की जांच करें, तुरंत SpO2 मापें। नेबुलाइजेशन और ऑक्सीजन सहायता तैयार रखें।',
    true
),
-- Rule 3: Acute Stroke Signs (FAST)
(
    '77777777-7777-4777-a777-000000000003',
    'Acute Stroke Signs (FAST Protocol)',
    ARRAY['facial drooping', 'arm weakness', 'slurred speech', 'sudden numbness', 'loss of speech', 'hemiparesis', 'stroke']::text[],
    ARRAY['चेहरा टेढ़ा होना', 'हाथ में कमजोरी', 'बोलने में तुतलाना', 'अचानक लकवा', 'आवाज बंद होना', 'अंग सुन्न होना']::text[],
    'urgent',
    'Activate acute stroke pathway. Note time of last known normal. Order urgent non-contrast head CT and avoid antihypertensive drops without neurologist consultation.',
    'एक्यूट स्ट्रोक प्रोटोकॉल सक्रिय करें। लक्षण शुरू होने का सटीक समय दर्ज करें। तुरंत ब्रेन सीटी स्कैन का प्रबंध करें।',
    true
),
-- Rule 4: Massive Uncontrolled Hemorrhage
(
    '77777777-7777-4777-a777-000000000004',
    'Massive Uncontrolled Hemorrhage',
    ARRAY['heavy bleeding', 'bleeding cannot stop', 'vomiting blood', 'hematemesis', 'black tarry stools', 'melena', 'blood in urine massive']::text[],
    ARRAY['अत्यधिक खून बहना', 'खून की उल्टी', 'काला मल', 'खून नहीं रुक रहा', 'लगातार रक्तस्राव']::text[],
    'urgent',
    'Apply direct pressure, secure two large-bore IV cannulae (16G/18G), cross-match blood products, and check hemodynamic stability (BP, pulse).',
    'तुरंत प्रत्यक्ष दबाव बनाएं, आईवी लाइन चालू करें, ब्लड ग्रुपिंग व क्रॉस-मैच कराएं और बीपी/पल्स की लगातार निगरानी करें।',
    true
),
-- Rule 5: Suicidal Ideation / Severe Self-Harm
(
    '77777777-7777-4777-a777-000000000005',
    'Suicidal Ideation / Severe Self-Harm',
    ARRAY['suicide', 'kill myself', 'want to die', 'end my life', 'harm myself', 'overdose']::text[],
    ARRAY['आत्महत्या', 'खुद को मारना', 'मरने का विचार', 'जान देना', 'जीवन समाप्त करना']::text[],
    'urgent',
    'Do not leave patient unattended. Connect immediately with on-call psychiatrist and activate 24/7 crisis intervention helpline (Tele-MANAS 14416).',
    'मरीज़ को अकेला न छोड़ें। तुरंत मनोचिकित्सक से संपर्क कराएं और टेली-मानस (14416) हेल्पलाइन से कनेक्ट करें।',
    true
),
-- Rule 6: High Fever in Infants under 3 Months
(
    '77777777-7777-4777-a777-000000000006',
    'High Fever in Infants under 3 Months',
    ARRAY['infant fever', 'baby fever 100.4', 'neonate fever', 'refusing feed', 'lethargic infant']::text[],
    ARRAY['छोटे बच्चे को तेज बुखार', 'शिशु को बुखार', 'दूध नहीं पी रहा', 'नवजात को बुखार', 'बच्चा सुस्त']::text[],
    'urgent',
    'Any temperature >= 100.4 F (38 C) in infant < 90 days requires full sepsis evaluation (CBC, blood culture, urine culture, lumbar puncture). Immediate pediatric review.',
    '3 महीने से छोटे शिशु में 100.4 F से अधिक बुखार होने पर तत्काल सेप्सिस जांच कराएं और बाल रोग विशेषज्ञ को दिखाएं।',
    true
),
-- Rule 7: Active Generalized Seizure
(
    '77777777-7777-4777-a777-000000000007',
    'Active Generalized Seizure / Status Epilepticus',
    ARRAY['seizure', 'fits', 'convulsion', 'jerking body', 'shaking uncontrollably', 'epilepsy fit']::text[],
    ARRAY['दौरा पड़ना', 'मिरगी का दौरा', 'झटके लगना', 'शरीर में अकड़न', 'बेहोशी के झटके']::text[],
    'urgent',
    'Ensure patient safety, turn to lateral recovery position, do not insert anything into mouth. If seizure >5 min, administer IV Lorazepam or Midazolam as per status protocol.',
    'मरीज़ को करवट दिलाएं, मुंह में कुछ न डालें। यदि दौरा 5 मिनट से अधिक रहे तो तत्काल आपातकालीन एंटी-सीज़र दवा दें।',
    true
),
-- Rule 8: Severe Anaphylaxis & Angioedema
(
    '77777777-7777-4777-a777-000000000008',
    'Severe Anaphylaxis & Angioedema',
    ARRAY['anaphylaxis', 'swollen tongue', 'throat closing', 'swollen lips', 'hives all over', 'allergic shock']::text[],
    ARRAY['गंभीर एलर्जी', 'जीभ सूज गई', 'गला बंद हो रहा', 'होंठों पर सूजन', 'पूरे शरीर पर चकत्ते']::text[],
    'urgent',
    'Administer Intramuscular Adrenaline (Epinephrine 1:1000) 0.5mg immediately in anterolateral thigh. Support airway, IV fluids, hydrocortisone and antihistamines.',
    'जांघ में तुरंत इंट्रा-मस्कुलर एड्रेनालाईन (1:1000) इंजेक्शन लगाएं। ऑक्सीजन दें और आईवी फ्लूइड्स शुरू करें।',
    true
),
-- Rule 9: Altered Mental Status / Sudden Coma
(
    '77777777-7777-4777-a777-000000000009',
    'Altered Mental Status / Sudden Coma',
    ARRAY['unconscious', 'unresponsive', 'confused suddenly', 'cannot wake up', 'passed out', 'coma', 'fainting']::text[],
    ARRAY['बेहोश', 'होश नहीं आ रहा', 'जवाब नहीं दे रहा', 'अचानक भ्रमित', 'अचेत अवस्था']::text[],
    'urgent',
    'Check bedside capillary blood glucose (rule out hypoglycemia stat). Assess GCS and pupillary reflexes. Protect airway.',
    'तुरंत शुगर (ब्लड ग्लूकोज) जांचें ताकि हाइपोग्लाइसीमिया का पता चल सके। जीसीएस स्कोर और पुतली की जांच करें।',
    true
),
-- Rule 10: Suspected Bacterial Meningitis
(
    '77777777-7777-4777-a777-000000000010',
    'Suspected Bacterial Meningitis',
    ARRAY['stiff neck', 'neck rigidity', 'fever with photophobia', 'petechial rash', 'kernig sign']::text[],
    ARRAY['गर्दन में अकड़न', 'गर्दन नहीं मुड़ रही', 'रोशनी से आंखें चुभना', 'तेज बुखार के साथ गर्दन दर्द']::text[],
    'urgent',
    'Check Kernig and Brudzinski signs. Do not delay empiric parenteral antibiotics (Ceftriaxone + Vancomycin) prior to imaging/LP if bacterial meningitis suspected.',
    'गर्दन में अकड़न की जांच करें। मेनिन्जाइटिस की आशंका पर तुरंत एंटीबायोटिक उपचार शुरू करने हेतु विशेषज्ञ से संपर्क करें।',
    true
),
-- Rule 11: Acute Abdomen / Severe Peritoneal Pain
(
    '77777777-7777-4777-a777-000000000011',
    'Acute Abdomen / Severe Peritoneal Pain',
    ARRAY['severe stomach pain', 'rigid abdomen', 'guarding', 'board like abdomen', 'rebound tenderness', 'appendix rupture']::text[],
    ARRAY['अत्यधिक तेज पेट दर्द', 'पेट पत्थर जैसा कड़ा', 'पेट छूने पर तेज चीख', 'अपेंडिक्स का दर्द']::text[],
    'urgent',
    'Keep patient Nil Per Os (NPO). Urgent surgical consult. Check upright abdominal X-ray (free air) and ultrasound abdomen. Avoid heavy narcotics before exam.',
    'मरीज़ को कुछ भी खाने-पीने न दें (एनपीओ)। तत्काल सर्जन से परामर्श कराएं और पेट का अल्ट्रासाउंड/एक्स-रे कराएं।',
    true
),
-- Rule 12: Severe Hypertensive Crisis
(
    '77777777-7777-4777-a777-000000000012',
    'Severe Hypertensive Crisis',
    ARRAY['blood pressure over 180', 'bp 180/120', 'hypertensive emergency', 'severe headache with high bp', 'blurred vision with bp']::text[],
    ARRAY['बीपी 180 से ऊपर', 'अत्यधिक उच्च रक्तचाप', 'बीपी के साथ सिर में भयंकर दर्द', 'धुंधला दिखना']::text[],
    'urgent',
    'Screen for acute end-organ damage (papilledema, acute renal impairment, pulmonary edema, aortic dissection). Controlled gradual BP reduction with IV Labetalol/Nitroglycerin.',
    'अंगों (आंख, गुर्दा, मस्तिष्क) पर असर की जांच करें। नियंत्रित गति से बीपी कम करने हेतु चिकित्सकीय प्रोटोकॉल अपनाएं।',
    true
),
-- Rule 13: Diabetic Ketoacidosis (DKA) Symptoms
(
    '77777777-7777-4777-a777-000000000013',
    'Diabetic Ketoacidosis (DKA) Symptoms',
    ARRAY['fruity breath', 'kussmaul breathing', 'high sugar vomiting', 'ketones in urine', 'dka']::text[],
    ARRAY['सांस से फल जैसी महक', 'गहरी तेज सांसें', 'शुगर के साथ उल्टी', 'कीटोएसिडोसिस के लक्षण']::text[],
    'attention',
    'Check blood/urine ketones and arterial blood gases. Initiate aggressive isotonic saline rehydration and regular insulin infusion protocol.',
    'यूरिन व ब्लड कीटोन की जांच करें। नस से स्लाइन (सलाइन) और इन्सुलिन देने का प्रोटोकॉल शुरू करें।',
    true
),
-- Rule 14: Pediatric Severe Dehydration & Lethargy
(
    '77777777-7777-4777-a777-000000000014',
    'Pediatric Severe Dehydration & Lethargy',
    ARRAY['child sunken eyes', 'no tears crying', 'skin pinch slow', 'child not peeing', 'baby limp']::text[],
    ARRAY['बच्चे की आंखें धंसी हुई', 'बिना आंसू के रोना', 'त्वचा ढीली होना', 'बच्चे का पेशाब बंद होना', 'अत्यधिक कमजोरी']::text[],
    'urgent',
    'WHO Plan C Dehydration protocol: Rapid IV Ringer Lactate fluid resuscitation. Re-assess hydration every 15-30 minutes.',
    'डब्ल्यूएचओ प्लान सी के अनुसार तत्काल रिंगर लैक्टेट आईवी ड्रिप शुरू करें और हर 15 मिनट में बच्चे की जांच करें।',
    true
),
-- Rule 15: Traumatic Brain Injury / Loss of Consciousness
(
    '77777777-7777-4777-a777-000000000015',
    'Head Trauma with Loss of Consciousness',
    ARRAY['head injury', 'hit on head lost consciousness', 'vomiting after head hit', 'unequal pupils', 'amnesia after fall']::text[],
    ARRAY['सिर पर गंभीर चोट', 'सिर टकराने के बाद बेहोशी', 'चोट के बाद उल्टी', 'पुतलियों का असमान होना', 'याददाश्त जाना']::text[],
    'urgent',
    'C-spine immobilization. Urgent non-contrast Head CT to exclude epidural/subdural hematoma. Monitor Glasgow Coma Scale (GCS) every hour.',
    'गर्दन को सीधा रखें, तुरंत हेड सीटी स्कैन कराएं ताकि अंदरूनी खून जमने का पता चल सके। हर घंटे जीसीएस स्कोर जांचें।',
    true
) ON CONFLICT (id) DO UPDATE SET
    keywords_en = EXCLUDED.keywords_en,
    keywords_hi = EXCLUDED.keywords_hi,
    guidance_en = EXCLUDED.guidance_en,
    guidance_hi = EXCLUDED.guidance_hi,
    updated_at = NOW();

-- Re-enable normal session replication role
SET session_replication_role = 'origin';
