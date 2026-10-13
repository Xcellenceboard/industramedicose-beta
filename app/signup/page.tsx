"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  User,
  Stethoscope,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  AlertCircle,
  Heart,
  GraduationCap,
  IndianRupee,
} from "lucide-react";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRoleParam = searchParams.get("role") === "doctor" ? "doctor" : "patient";
  const { addToast } = useToast();

  const [role, setRole] = useState<"patient" | "doctor">(initialRoleParam);

  // Common fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Patient-specific fields
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [bloodGroup, setBloodGroup] = useState("B+");
  const [height, setHeight] = useState("172");
  const [weight, setWeight] = useState("68");
  const [chronicConditions, setChronicConditions] = useState("None");
  const [allergies, setAllergies] = useState("No known allergies");
  const [currentMedications, setCurrentMedications] = useState("None");
  const [city, setCity] = useState("Jaipur");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [enableCallAssistant, setEnableCallAssistant] = useState(true);

  // Doctor-specific fields
  const [qualification, setQualification] = useState("MBBS, MD (Medicine)");
  const [specialization, setSpecialization] = useState("General Medicine");
  const [workExperience, setWorkExperience] = useState("12");
  const [hospital, setHospital] = useState("AIIMS Jodhpur Medical Super-Speciality");
  const [registrationNo, setRegistrationNo] = useState("RJ-MED-2026-DEMO");
  const [consultationFee, setConsultationFee] = useState("500");
  const [consultationMode, setConsultationMode] = useState<"video" | "clinic" | "hybrid">("hybrid");
  const [bio, setBio] = useState("Experienced specialist offering patient-first telemedicine consultations and hospital OPD.");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        fullName,
        email,
        phone,
        password,
        confirmPassword,
        role,
        ...(role === "patient"
          ? {
              age,
              gender,
              bloodGroup,
              height,
              weight,
              chronicConditions,
              allergies,
              currentMedications,
              emergencyContact,
              city,
              enableCallAssistant,
            }
          : {
              qualification,
              specialization,
              workExperience,
              hospital,
              registrationNo,
              consultationFee,
              consultationMode,
              bio,
            }),
      };

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Registration failed. Please check form details.");
        return;
      }

      addToast({
        type: "verified",
        title: "Profile Created Successfully",
        message: `Welcome, ${fullName}! Redirecting to your ${role === "doctor" ? "Doctor OPD Panel" : "Patient Dashboard"}.`,
      });

      window.location.href = role === "doctor" ? "/doctor" : "/patient";
    } catch {
      setErrorMsg("Network error during registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div
          role="alert"
          className="p-4 rounded-xl border border-coral-300 dark:border-coral-800 bg-coral-50/90 dark:bg-coral-950/80 text-coral-900 dark:text-coral-200 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in"
        >
          <AlertCircle className="w-5 h-5 text-coral-600 dark:text-coral-400 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMsg}</div>
        </div>
      )}

      {/* Role Selector Tabs & Dropdown Indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-foreground uppercase tracking-wider">
            Choose Registration Type
          </label>
          <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
            English / हिंदी (Hinglish AI)
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 dark:bg-navy-800 rounded-2xl border border-slate-200 dark:border-navy-700">
          <button
            type="button"
            onClick={() => setRole("patient")}
            className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
              role === "patient"
                ? "border-teal-500 bg-white dark:bg-navy-900 text-teal-700 dark:text-teal-300 shadow-sm"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-sm">
              <User className="w-4 h-4 text-teal-600" />
              <span>Register as Patient</span>
            </div>
            <span className="text-[11px] opacity-80">मरीज पंजीकरण • AI Assistant & OPD</span>
          </button>

          <button
            type="button"
            onClick={() => setRole("doctor")}
            className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
              role === "doctor"
                ? "border-teal-500 bg-white dark:bg-navy-900 text-teal-700 dark:text-teal-300 shadow-sm"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-sm">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span>Register as Doctor</span>
            </div>
            <span className="text-[11px] opacity-80">डॉक्टर पंजीकरण • OPD, Video & Scribe</span>
          </button>
        </div>
      </div>

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Information */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span>1. Basic Profile Details</span>
          </span>

          <div className="space-y-1.5">
            <label htmlFor="full-name" className="text-xs font-semibold text-foreground">
              {role === "doctor" ? "Doctor Full Name (with Dr. prefix)" : "Patient Full Name"}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="full-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={role === "doctor" ? "Dr. Meera Rathore" : "Vikramaditya Rathore"}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-navy-800/80 border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[44px] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="signup-email" className="text-xs font-semibold text-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="signup-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === "doctor" ? "dr.meera@hospital.in" : "vikram@patient.in"}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-navy-800/80 border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[44px] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="signup-phone" className="text-xs font-semibold text-foreground">
                Mobile Number (Phone Call & OTP)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="signup-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91-98290-12345"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-navy-800/80 border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[44px] transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* PATIENT SPECIFIC MEDICAL FIELDS */}
        {role === "patient" && (
          <div className="p-4 rounded-2xl border border-teal-500/30 bg-teal-50/40 dark:bg-navy-800/60 space-y-4">
            <span className="text-xs font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-teal-600" />
              <span>2. Patient Health & Vitals Information</span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Age (Years)</label>
                <input
                  type="number"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="45"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[38px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[38px]"
                >
                  <option value="male">Male (पुरुष)</option>
                  <option value="female">Female (महिला)</option>
                  <option value="other">Other (अन्य)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[38px]"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">City / State</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Jaipur / Jodhpur"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[38px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Height (cm)</label>
                <input
                  type="text"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="170 cm"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[38px]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Weight (kg)</label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="70 kg"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[38px]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">
                Previous Diseases / Medical Conditions (पुरानी बीमारियां)
              </label>
              <input
                type="text"
                value={chronicConditions}
                onChange={(e) => setChronicConditions(e.target.value)}
                placeholder="E.g., Diabetes (5 yrs), High Blood Pressure, Asthma, Thyroid, or None"
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[38px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Known Drug Allergies</label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="E.g., Penicillin allergy, Sulfa drugs, or None"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[38px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Current Regular Medicines</label>
                <input
                  type="text"
                  value={currentMedications}
                  onChange={(e) => setCurrentMedications(e.target.value)}
                  placeholder="E.g., Metformin 500mg, Telmisartan 40mg, or None"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[38px]"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-semibold text-muted-foreground">Emergency Contact (Family/Caregiver Mobile)</label>
                <input
                  type="tel"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="+91-98765-43210 (Kin Contact)"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[38px]"
                />
              </div>
            </div>

            {/* Hinglish Assistant Option */}
            <div className="p-3 rounded-xl bg-teal-100/70 dark:bg-teal-950/40 border border-teal-300 dark:border-teal-800 flex items-start gap-3">
              <input
                id="enable-assistant"
                type="checkbox"
                checked={enableCallAssistant}
                onChange={(e) => setEnableCallAssistant(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-teal-600 focus:ring-teal-500 cursor-pointer accent-teal-600"
              />
              <label htmlFor="enable-assistant" className="text-xs text-teal-900 dark:text-teal-200 cursor-pointer">
                <strong className="block font-bold">24/7 AI Voice Calling Assistant (Hinglish)</strong>
                Attends patient calls, listens in regional Hinglish/Hindi/English, analyzes medical symptoms, and matches top 5 specialist doctors.
              </label>
            </div>
          </div>
        )}

        {/* DOCTOR SPECIFIC CLINICAL CREDENTIALS */}
        {role === "doctor" && (
          <div className="p-4 rounded-2xl border border-teal-500/30 bg-teal-50/40 dark:bg-navy-800/60 space-y-4">
            <span className="text-xs font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-teal-600" />
              <span>2. Doctor Credentials & Practice Setup</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Medical Qualification</label>
                <input
                  type="text"
                  required
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="MBBS, MD (Medicine), DM (Cardiology)"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[38px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Specialisation</label>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[38px]"
                >
                  <option value="Cardiologist">Cardiologist (हृदय रोग विशेषज्ञ)</option>
                  <option value="Neurologist">Neurologist (न्यूरोलॉजिस्ट)</option>
                  <option value="General Physician">General Physician (सामान्य चिकित्सक)</option>
                  <option value="Pediatrician">Pediatrician (बाल रोग विशेषज्ञ)</option>
                  <option value="Orthopedic Surgeon">Orthopedic Surgeon (हड्डी रोग विशेषज्ञ)</option>
                  <option value="Dermatologist">Dermatologist (त्वचा रोग विशेषज्ञ)</option>
                  <option value="ENT Specialist">ENT Specialist (नाक कान गला विशेषज्ञ)</option>
                  <option value="Gastroenterologist">Gastroenterologist (पेट व लिवर रोग)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Work Experience (Years)</label>
                <input
                  type="number"
                  required
                  value={workExperience}
                  onChange={(e) => setWorkExperience(e.target.value)}
                  placeholder="12"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[38px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">State Registration No.</label>
                <input
                  type="text"
                  required
                  value={registrationNo}
                  onChange={(e) => setRegistrationNo(e.target.value)}
                  placeholder="RJ-MED-2016-8921"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[38px]"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-semibold text-muted-foreground">Hospital / Clinic Affiliation</label>
                <input
                  type="text"
                  required
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  placeholder="AIIMS Jodhpur Medical Super-Speciality"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[38px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Consultation Fee (₹)</label>
                <div className="relative">
                  <IndianRupee className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="number"
                    required
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                    placeholder="500"
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[38px]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Consultation Mode</label>
                <select
                  value={consultationMode}
                  onChange={(e) => setConsultationMode(e.target.value as "video" | "clinic" | "hybrid")}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[38px]"
                >
                  <option value="hybrid">Hybrid (Video Call + Clinic OPD)</option>
                  <option value="video">Online Video Call Only (Telemedicine)</option>
                  <option value="clinic">In-Clinic Visit Only</option>
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-semibold text-muted-foreground">Doctor Bio & Specialization Focus</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell patients about your expertise, treatment approach, and clinical experience..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Security Password */}
        <div className="space-y-3 pt-1">
          <span className="text-xs font-bold text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>3. Account Security Password</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="signup-password" className="text-xs font-semibold text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="signup-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-navy-800/80 border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[44px] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirm-password" className="text-xs font-semibold text-foreground">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-navy-800/80 border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[44px] transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          variant="default"
          size="md"
          className="w-full shadow-teal-glow mt-4 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3"
          isLoading={loading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Complete Registration &amp; Open {role === "doctor" ? "Doctor Panel" : "Patient Dashboard"}
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground pt-4 border-t border-slate-100 dark:border-navy-800">
        <span>Already registered on Industra Medicose? </span>
        <Link
          href="/login"
          className="text-teal-600 dark:text-teal-400 font-bold hover:underline"
        >
          Sign In Here
        </Link>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create Your Industra Medicose Account"
      subtitle="Select whether you are registering as a Patient or Doctor. Powered by clinical AI copilot."
    >
      <Suspense fallback={<div className="p-8 text-center text-teal-600">Loading registration form...</div>}>
        <SignupForm />
      </Suspense>
    </AuthLayout>
  );
}
