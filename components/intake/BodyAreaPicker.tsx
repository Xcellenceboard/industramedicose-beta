"use client";

import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface BodyArea {
  id: string;
  labelEn: string;
  labelHi: string;
  color?: string;
}

export const BODY_AREAS: BodyArea[] = [
  { id: "head", labelEn: "Head / Neck", labelHi: "सिर / गर्दन" },
  { id: "chest", labelEn: "Chest", labelHi: "सीने / छाती" },
  { id: "abdomen", labelEn: "Stomach / Abdomen", labelHi: "पेट" },
  { id: "back", labelEn: "Back / Spine", labelHi: "पीठ / कमर" },
  { id: "left_arm", labelEn: "Arms / Shoulders", labelHi: "हाथ / कंधे" },
  { id: "legs", labelEn: "Legs / Knees", labelHi: "पैर / घुटने" },
  { id: "throat", labelEn: "Throat", labelHi: "गला" },
  { id: "whole_body", labelEn: "Whole Body (Fever/Fatigue)", labelHi: "पूरा शरीर (बुखार/थकान)" },
];

interface BodyAreaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectArea: (area: BodyArea) => void;
  language: "en" | "hi" | "hinglish";
}

export function BodyAreaPicker({
  isOpen,
  onClose,
  onSelectArea,
  language,
}: BodyAreaPickerProps) {
  const [selectedId, setSelectedId] = useState<string>("chest");
  const isHi = language === "hi";

  if (!isOpen) return null;

  const handleConfirm = () => {
    const area = BODY_AREAS.find((a) => a.id === selectedId) || BODY_AREAS[1];
    onSelectArea(area);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="body-picker-title"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-navy-900 rounded-3xl p-6 shadow-2xl border border-teal-500/30 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800">
          <div>
            <h3 id="body-picker-title" className="text-base font-bold text-navy dark:text-white">
              {isHi ? "तकलीफ का स्थान चुनें" : "Tap the Affected Body Area"}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isHi ? "जिस अंग में दर्द या परेशानी है उसे चुनें" : "Select where you are feeling discomfort"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Human Body SVG Outline */}
        <div className="flex justify-center py-2">
          <svg
            viewBox="0 0 160 260"
            className="w-36 h-56 select-none"
            aria-label="Human body anatomical selector"
          >
            {/* Background silhouette glow */}
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Head & Neck */}
            <circle
              cx="80"
              cy="30"
              r="20"
              className={`cursor-pointer transition-colors ${
                selectedId === "head"
                  ? "fill-teal-500 stroke-teal-300 stroke-2"
                  : "fill-slate-200 dark:fill-navy-700 hover:fill-teal-200"
              }`}
              onClick={() => setSelectedId("head")}
            />
            {/* Throat */}
            <rect
              x="74"
              y="52"
              width="12"
              height="10"
              rx="3"
              className={`cursor-pointer transition-colors ${
                selectedId === "throat"
                  ? "fill-teal-500 stroke-teal-300 stroke-2"
                  : "fill-slate-300 dark:fill-navy-600 hover:fill-teal-200"
              }`}
              onClick={() => setSelectedId("throat")}
            />

            {/* Torso - Chest */}
            <path
              d="M 55 64 Q 80 62 105 64 L 102 100 Q 80 102 58 100 Z"
              className={`cursor-pointer transition-colors ${
                selectedId === "chest"
                  ? "fill-teal-500 stroke-teal-300 stroke-2"
                  : "fill-slate-200 dark:fill-navy-700 hover:fill-teal-200"
              }`}
              onClick={() => setSelectedId("chest")}
            />

            {/* Torso - Abdomen */}
            <path
              d="M 58 102 Q 80 104 102 102 L 98 135 Q 80 138 62 135 Z"
              className={`cursor-pointer transition-colors ${
                selectedId === "abdomen"
                  ? "fill-teal-500 stroke-teal-300 stroke-2"
                  : "fill-slate-200 dark:fill-navy-700 hover:fill-teal-200"
              }`}
              onClick={() => setSelectedId("abdomen")}
            />

            {/* Left Arm & Shoulder */}
            <path
              d="M 53 66 Q 40 90 35 125 L 45 127 Q 50 95 60 70 Z"
              className={`cursor-pointer transition-colors ${
                selectedId === "left_arm"
                  ? "fill-teal-500 stroke-teal-300 stroke-2"
                  : "fill-slate-200 dark:fill-navy-700 hover:fill-teal-200"
              }`}
              onClick={() => setSelectedId("left_arm")}
            />
            {/* Right Arm & Shoulder */}
            <path
              d="M 107 66 Q 120 90 125 125 L 115 127 Q 110 95 100 70 Z"
              className={`cursor-pointer transition-colors ${
                selectedId === "left_arm"
                  ? "fill-teal-500 stroke-teal-300 stroke-2"
                  : "fill-slate-200 dark:fill-navy-700 hover:fill-teal-200"
              }`}
              onClick={() => setSelectedId("left_arm")}
            />

            {/* Pelvis / Lower Back */}
            <path
              d="M 62 137 Q 80 140 98 137 L 95 152 Q 80 156 65 152 Z"
              className={`cursor-pointer transition-colors ${
                selectedId === "back"
                  ? "fill-teal-500 stroke-teal-300 stroke-2"
                  : "fill-slate-300 dark:fill-navy-600 hover:fill-teal-200"
              }`}
              onClick={() => setSelectedId("back")}
            />

            {/* Left Leg */}
            <path
              d="M 65 155 L 60 210 Q 58 245 68 250 L 76 250 Q 72 210 77 155 Z"
              className={`cursor-pointer transition-colors ${
                selectedId === "legs"
                  ? "fill-teal-500 stroke-teal-300 stroke-2"
                  : "fill-slate-200 dark:fill-navy-700 hover:fill-teal-200"
              }`}
              onClick={() => setSelectedId("legs")}
            />
            {/* Right Leg */}
            <path
              d="M 83 155 L 88 210 Q 90 245 80 250 L 92 250 Q 102 210 95 155 Z"
              className={`cursor-pointer transition-colors ${
                selectedId === "legs"
                  ? "fill-teal-500 stroke-teal-300 stroke-2"
                  : "fill-slate-200 dark:fill-navy-700 hover:fill-teal-200"
              }`}
              onClick={() => setSelectedId("legs")}
            />
          </svg>
        </div>

        {/* Area Buttons Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {BODY_AREAS.map((area) => {
            const isSelected = selectedId === area.id;
            return (
              <button
                key={area.id}
                type="button"
                onClick={() => setSelectedId(area.id)}
                className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                  isSelected
                    ? "bg-teal-500 text-white border-teal-500 shadow-sm"
                    : "bg-slate-50 dark:bg-navy-800 text-foreground border-slate-200 dark:border-navy-700 hover:bg-slate-100"
                }`}
              >
                <div>{isHi ? area.labelHi : area.labelEn}</div>
                <div className="text-[10px] opacity-80 mt-0.5">
                  {isHi ? area.labelEn : area.labelHi}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-navy-800">
          <Button variant="ghost" size="sm" onClick={onClose}>
            {isHi ? "रद्द करें" : "Cancel"}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleConfirm}
            className="shadow-teal-glow"
            leftIcon={<Check className="w-4 h-4" />}
          >
            {isHi ? "चुना हुआ अंग जोड़ें" : "Add to Message"}
          </Button>
        </div>
      </div>
    </div>
  );
}
