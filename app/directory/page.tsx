"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import {
  Search,
  Stethoscope,
  User,
  Star,
  MapPin,
  Share2,
  Sparkles,
  Building,
  GraduationCap,
} from "lucide-react";
import { INITIAL_DOCTORS, DoctorProfile, getTop5DoctorsForSymptom } from "@/lib/directory-data";

export default function MasterMedicalDirectoryPage() {
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("All");
  const [activeTab, setActiveTab] = useState<"doctors" | "patients">("doctors");
  const [doctorsList, setDoctorsList] = useState<DoctorProfile[]>(INITIAL_DOCTORS);

  // Fetch live doctors from Supabase via /api/doctors
  useEffect(() => {
    async function loadDoctors() {
      try {
        const res = await fetch("/api/doctors");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.doctors) && json.doctors.length > 0) {
            setDoctorsList(json.doctors);
          }
        }
      } catch (err) {
        console.warn("Could not load dynamic doctors, using cache:", err);
      }
    }
    loadDoctors();
  }, []);

  // Filter doctors using intelligent symptom & specialty matching
  const filteredDoctors = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      if (selectedSpecialty === "All") return doctorsList;
      return doctorsList.filter((doc) =>
        doc.specialization.toLowerCase().includes(selectedSpecialty.toLowerCase())
      );
    }

    // Use intelligent clinical symptom matcher
    return getTop5DoctorsForSymptom(query, doctorsList);
  }, [searchQuery, selectedSpecialty, doctorsList]);

  const handleShareProfile = (doc: DoctorProfile) => {
    const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/doctor/profile/${doc.id}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      addToast({
        type: "verified",
        title: "Profile Link Copied!",
        message: `Shareable link for ${doc.name} copied to clipboard: ${shareUrl}`,
      });
    }
  };

  const specialtiesList = [
    "All",
    "Cardiologist",
    "Neurologist",
    "General Physician",
    "Pediatrician",
    "Orthopedic Surgeon",
    "Dermatologist",
    "ENT Specialist",
    "Gastroenterologist",
  ];

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Header ("Google for Medical") */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="verified" size="md" className="bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Master Medical Directory &bull; Google for Healthcare
          </Badge>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy dark:text-white tracking-tight">
            Find &amp; Connect with <span className="text-teal-600 dark:text-teal-400">Verified Doctors</span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground">
            Search top specialists, diseases, symptoms, and hospitals across India. Zero queues, advance video slots, and verified AI clinical summaries.
          </p>

          {/* Master Search Engine Bar */}
          <div className="relative max-w-2xl mx-auto pt-2">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-teal-600 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search disease, symptom (chest pain, migraine, knee pain), doctor or hospital..."
                className="w-full pl-12 pr-28 py-3.5 text-sm sm:text-base rounded-2xl bg-white dark:bg-navy-900 border-2 border-teal-500/40 shadow-soft-lg focus:outline-none focus:border-teal-500 transition-all text-foreground"
              />
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-navy-800 text-teal-700 dark:text-teal-300 font-bold text-xs hover:bg-teal-100 transition-colors"
              >
                {searchQuery ? "Clear" : "Search"}
              </button>
            </div>
          </div>

          {/* Specialty Filter Pills */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap pt-2">
            {specialtiesList.map((spec) => (
              <button
                key={spec}
                type="button"
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedSpecialty === spec
                    ? "bg-teal-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-navy-800 text-muted-foreground hover:text-foreground"
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Controls & Tab Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-navy-700">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-xl bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 flex">
              <button
                type="button"
                onClick={() => setActiveTab("doctors")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "doctors"
                    ? "bg-white dark:bg-navy-900 text-teal-700 dark:text-teal-300 shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Doctor Directory ({filteredDoctors.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("patients")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "patients"
                    ? "bg-white dark:bg-navy-900 text-teal-700 dark:text-teal-300 shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Patient Directory (Admin View)</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/signup?role=doctor">
              <Button size="sm" variant="outline" className="border-teal-500 text-teal-700 dark:text-teal-300 text-xs">
                + Register as Doctor
              </Button>
            </Link>
            <Link href="/signup?role=patient">
              <Button size="sm" variant="default" className="bg-teal-600 hover:bg-teal-700 text-white text-xs">
                + Register as Patient
              </Button>
            </Link>
          </div>
        </div>

        {/* TAB 1: DOCTOR DIRECTORY CARDS */}
        {activeTab === "doctors" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 hover:border-teal-500/60 transition-all p-5 shadow-soft flex flex-col justify-between space-y-4 group"
              >
                {/* Doctor Card Top */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-13 h-13 w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-navy-800 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                        {doc.name.split(" ").slice(-1)[0][0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                            {doc.name}
                          </h3>
                        </div>
                        <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">
                          {doc.specialization}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-bold text-xs">
                      <Star className="w-3 h-3 fill-amber-400 stroke-amber-500" />
                      <span>{doc.rating}</span>
                      <span className="text-[10px] text-muted-foreground">({doc.reviewCount})</span>
                    </div>
                  </div>

                  {/* Qualifications & Hospital */}
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <p className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>{doc.qualification} &bull; {doc.experienceYears} yrs exp</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span className="truncate">{doc.hospital}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>{doc.city}</span>
                    </p>
                  </div>

                  {/* Sub-specialties tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {doc.subSpecialties.slice(0, 3).map((sub, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-muted-foreground font-medium"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Doctor Card Bottom: Fees & Action Buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-navy-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Consultancy Fee</span>
                      <span className="font-extrabold text-foreground text-sm">₹{doc.consultationFee}</span>
                    </div>

                    <Badge variant="verified" size="sm" className="bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200">
                      Hybrid / Video Call
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleShareProfile(doc)}
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 hover:bg-slate-50 dark:hover:bg-navy-800 text-xs font-semibold flex items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                      title="Copy public profile link to send to patients/colleagues"
                    >
                      <Share2 className="w-3.5 h-3.5 text-teal-600" />
                      <span>Share Profile</span>
                    </button>

                    <Link href={`/doctor/profile/${doc.id}`} className="block">
                      <Button
                        size="sm"
                        variant="default"
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold"
                      >
                        View &amp; Book
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: PATIENT MASTER REGISTRY (MANAGED PROFILES) */}
        {activeTab === "patients" && (
          <div className="rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-foreground">
                  ABDM Verified Patient Health Index
                </h3>
                <p className="text-xs text-muted-foreground">
                  Authorized medical staff view of registered patient profiles and intake summaries.
                </p>
              </div>
              <Badge variant="ai" size="sm">
                ABDM Compliant
              </Badge>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-navy-800">
              {[
                {
                  name: "Vikramaditya Rathore",
                  uhid: "UHID-2026-9041",
                  age: 54,
                  gender: "Male",
                  blood: "B+",
                  symptoms: "Acute retrosternal chest pain (ACS alert)",
                  doctorAssigned: "Dr. Meera Rathore (Cardiology)",
                  status: "Ready for Doctor Review",
                },
                {
                  name: "Aarav Sharma",
                  uhid: "UHID-2026-1022",
                  age: 45,
                  gender: "Male",
                  blood: "O+",
                  symptoms: "Seasonal viral fever & severe fatigue x 3 days",
                  doctorAssigned: "Dr. Vikramaditya Joshi (Medicine)",
                  status: "Follow-up Scheduled",
                },
                {
                  name: "Sunita Devi",
                  uhid: "UHID-2026-3391",
                  age: 49,
                  gender: "Female",
                  blood: "A+",
                  symptoms: "Degenerative osteoarthritis right knee pain",
                  doctorAssigned: "Dr. Ananya Sen (Orthopedics)",
                  status: "Prescription Signed",
                },
              ].map((pat, i) => (
                <div key={i} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">{pat.name}</span>
                      <span className="text-muted-foreground">({pat.uhid})</span>
                      <Badge variant="neutral" size="sm">{pat.gender}, {pat.age}y &bull; {pat.blood}</Badge>
                    </div>
                    <p className="text-muted-foreground">
                      <strong>Symptoms:</strong> {pat.symptoms} &bull; <strong>Assigned:</strong> {pat.doctorAssigned}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="verified" size="sm">{pat.status}</Badge>
                    <Link href="/patient">
                      <Button size="sm" variant="ghost" className="text-xs text-teal-600">
                        Open Portal
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
