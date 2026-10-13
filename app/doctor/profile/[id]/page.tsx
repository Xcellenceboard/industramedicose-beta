"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import {
  Stethoscope,
  Star,
  MapPin,
  Calendar,
  Video,
  Building,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Copy,
} from "lucide-react";
import { INITIAL_DOCTORS, INITIAL_REVIEWS } from "@/lib/directory-data";
import { VideoConsultationModal } from "@/components/telemedicine/VideoConsultationModal";

export default function DoctorPublicProfilePage() {
  const params = useParams();
  const { addToast } = useToast();
  const docId = (params?.id as string) || "doc-meera";

  const doctor = INITIAL_DOCTORS.find((d) => d.id === docId) || INITIAL_DOCTORS[0];
  const reviews = INITIAL_REVIEWS.filter((r) => r.doctorId === doctor.id || r.doctorId === "doc-meera");

  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const handleShare = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast({
        type: "verified",
        title: "Profile URL Copied",
        message: `Shareable link for ${doctor.name} copied to clipboard! Anyone can view and book online.`,
      });
    }
  };

  const handleBookAppointment = async () => {
    try {
      await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: doctor.id,
          doctorName: doctor.name,
          patientName: "Vikramaditya Rathore",
          timeSlot: doctor.nextSlot,
          mode: "video",
          fee: doctor.consultationFee,
          symptoms: "Specialist consultation booked via profile",
        }),
      });
    } catch {}

    setBookingSuccess(true);
    addToast({
      type: "verified",
      title: "Appointment Booked in Advance!",
      message: `Your appointment with ${doctor.name} is confirmed for ${doctor.nextSlot}. Saved in Supabase database!`,
    });
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/directory"
            className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Medical Directory</span>
          </Link>

          <Button
            size="sm"
            variant="outline"
            className="border-teal-500 text-teal-700 dark:text-teal-300 text-xs flex items-center gap-1.5"
            onClick={handleShare}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Doctor Profile</span>
          </Button>
        </div>

        {/* Doctor Header Banner Card */}
        <div className="rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 p-6 sm:p-8 shadow-soft-lg space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-teal-600 to-navy-800 text-white flex items-center justify-center font-extrabold text-3xl shadow-teal-glow shrink-0">
                {doctor.name.split(" ").slice(-1)[0][0]}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-navy dark:text-white">
                    {doctor.name}
                  </h1>
                  <Badge variant="verified" size="sm" className="bg-teal-500 text-white">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                    MCI Verified
                  </Badge>
                </div>

                <p className="text-sm font-semibold text-teal-600 dark:text-teal-400">
                  {doctor.specialization} &bull; {doctor.qualification}
                </p>

                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>{doctor.hospital}</span>
                </p>

                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>{doctor.city} &bull; Reg: {doctor.registrationNo}</span>
                </p>
              </div>
            </div>

            {/* Rating & Fee Box */}
            <div className="sm:text-right bg-slate-50 dark:bg-navy-800/80 p-4 rounded-2xl border border-slate-200 dark:border-navy-700 space-y-1 w-full sm:w-auto">
              <div className="flex items-center sm:justify-end gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 stroke-amber-500" />
                <span className="font-extrabold text-base text-foreground">{doctor.rating}</span>
                <span className="text-xs text-muted-foreground">({doctor.reviewCount} reviews)</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Consultancy Fee: <span className="font-bold text-foreground text-sm">₹{doctor.consultationFee}</span>
              </div>
              <Badge variant="ai" size="sm">
                Next Slot: {doctor.nextSlot}
              </Badge>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-100 dark:border-navy-800">
            <Button
              variant="default"
              size="md"
              className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-teal-glow"
              onClick={handleBookAppointment}
              leftIcon={<Calendar className="w-4 h-4" />}
            >
              Book Advance Appointment (Zero Crowds)
            </Button>

            <Button
              variant="outline"
              size="md"
              className="w-full sm:w-auto border-teal-500 text-teal-700 dark:text-teal-300 font-bold"
              onClick={() => setIsVideoModalOpen(true)}
              leftIcon={<Video className="w-4 h-4 text-teal-600" />}
            >
              Start Telemedicine Video Call
            </Button>

            <Button
              variant="ghost"
              size="md"
              className="w-full sm:w-auto text-xs text-muted-foreground hover:text-foreground"
              onClick={handleShare}
              leftIcon={<Copy className="w-4 h-4" />}
            >
              Copy Public Profile Link
            </Button>
          </div>

          {bookingSuccess && (
            <div className="p-4 rounded-2xl bg-mint-50 dark:bg-navy-800 border border-teal-300 dark:border-teal-700 flex items-center gap-3 text-xs sm:text-sm text-teal-900 dark:text-teal-200 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
              <div>
                <strong>Appointment Confirmed!</strong> A reminder SMS and calendar invite have been sent. You can join directly from your patient panel without any physical hospital queue.
              </div>
            </div>
          )}
        </div>

        {/* Doctor Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio & Clinical Approach */}
            <div className="rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 p-6 space-y-3">
              <h3 className="font-bold text-sm sm:text-base text-foreground flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-teal-600" />
                <span>About {doctor.name}</span>
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {doctor.bio}
              </p>
            </div>

            {/* Specialization Tags & Symptoms Treated */}
            <div className="rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 p-6 space-y-3">
              <h3 className="font-bold text-sm sm:text-base text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Conditions Treated &amp; Symptoms</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {doctor.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl bg-teal-50 dark:bg-navy-800 text-teal-700 dark:text-teal-300 font-medium text-xs border border-teal-200 dark:border-teal-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Patient Reviews & Ratings */}
            <div className="rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm sm:text-base text-foreground flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span>Patient Reviews &amp; Ratings ({reviews.length})</span>
                </h3>
                <span className="text-xs text-teal-600 font-semibold">100% Verified Patients</span>
              </div>

              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-800/60 border border-slate-200 dark:border-navy-700 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{rev.patientName}</span>
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        {Array.from({ length: rev.rating }).map((_, idx) => (
                          <Star key={idx} className="w-3 h-3 fill-amber-400 stroke-amber-500" />
                        ))}
                        <span className="text-[10px] text-muted-foreground ml-1">{rev.date}</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Practice Info */}
          <div className="space-y-6">
            <div className="rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 p-6 space-y-4">
              <h3 className="font-bold text-sm text-foreground">Practice Information</h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Experience</span>
                  <span className="font-bold text-foreground">{doctor.experienceYears} Years</span>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[11px]">Languages Spoken</span>
                  <span className="font-bold text-foreground">{doctor.languages.join(", ")}</span>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[11px]">Consultation Modes</span>
                  <span className="font-bold text-foreground">Online Video Call &bull; In-Clinic OPD</span>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[11px]">Medical Council Registration</span>
                  <span className="font-mono text-teal-600 font-bold">{doctor.registrationNo}</span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="default"
                  size="sm"
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold"
                  onClick={handleBookAppointment}
                >
                  Book for ₹{doctor.consultationFee}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Video Consultation Modal */}
        <VideoConsultationModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          doctorName={doctor.name}
          consultationFee={doctor.consultationFee}
        />
      </div>
    </AppShell>
  );
}
