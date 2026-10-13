"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Mic, MicOff, AlertCircle } from "lucide-react";

interface VoiceWaveformProps {
  isRecording: boolean;
  onToggleRecord: () => void;
  language: "en" | "hi" | "hinglish";
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: { transcript: string };
    };
  };
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
}

export function VoiceWaveform({
  isRecording,
  onToggleRecord,
  language,
  onTranscript,
  disabled = false,
}: VoiceWaveformProps) {
  const [micError, setMicError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize SpeechRecognition
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionConstructor =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      setMicError(
        language === "hi"
          ? "आपके ब्राउज़र में वॉइस रिकॉग्निशन समर्थित नहीं है। कृपया लिखकर भेजें।"
          : "Speech recognition is not supported in this browser. Please type below."
      );
      return;
    }

    const recognition = new SpeechRecognitionConstructor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === "hi" ? "hi-IN" : "en-IN";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          finalTranscript += transcript;
        }
      }
      if (finalTranscript.trim()) {
        onTranscript(finalTranscript.trim());
      }
    };

    recognition.onerror = (event: { error: string }) => {
      console.warn("Speech recognition error:", event.error);
      if (event.error === "not-allowed" || event.error === "permission-denied") {
        setMicError(
          language === "hi"
            ? "माइक्रोफ़ोन अनुमति अस्वीकृत है। कृपया ब्राउज़र सेटिंग्स में माइक चालू करें।"
            : "Microphone access denied. Please enable mic permissions or type below."
        );
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    };
  }, [language, onTranscript]);

  // Clean up AudioContext & visualizer
  const stopAudioVisualizer = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  }, []);

  // Start AudioContext & live waveform animation
  const startAudioVisualizer = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        animationFrameRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 1.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height * 0.85;

          const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
          gradient.addColorStop(0, "#14b8a6");
          gradient.addColorStop(1, "#0d9488");

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, canvas.height - barHeight, barWidth - 2, barHeight + 2, 4);
          ctx.fill();

          x += barWidth + 1;
        }
      };

      draw();
    } catch (err) {
      console.warn("Audio visualizer note:", err);
    }
  }, []);

  // Toggle start/stop
  useEffect(() => {
    if (isRecording) {
      setMicError(null);
      try {
        recognitionRef.current?.start();
      } catch {
        // Recognition might already be running
      }
      startAudioVisualizer();
    } else {
      try {
        recognitionRef.current?.stop();
      } catch {
        // Recognition might not be running
      }
      stopAudioVisualizer();
    }

    return () => {
      stopAudioVisualizer();
    };
  }, [isRecording, startAudioVisualizer, stopAudioVisualizer]);

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      {/* Waveform Canvas when recording */}
      {isRecording && (
        <div className="w-full max-w-xs h-10 px-2 flex items-center justify-center animate-in fade-in duration-200">
          <canvas
            ref={canvasRef}
            width={240}
            height={40}
            className="w-full h-full rounded-xl bg-teal-500/10"
          />
        </div>
      )}

      {/* Mic Button */}
      <button
        type="button"
        onClick={onToggleRecord}
        disabled={disabled}
        aria-label={isRecording ? "Stop voice recording" : "Start speaking in Hindi or English"}
        className={`relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 shadow-lg ${
          isRecording
            ? "bg-coral-500 hover:bg-coral-600 text-white shadow-coral-500/30 scale-105"
            : "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/30 hover:scale-105"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        {/* Pulsing ring during recording */}
        {isRecording && (
          <span className="absolute inset-0 rounded-full bg-coral-400 animate-ping opacity-75" />
        )}

        <div className="relative z-10">
          {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </div>
      </button>

      {/* Recording status hint */}
      <div className="text-[11px] font-medium text-muted-foreground text-center">
        {isRecording
          ? language === "hi"
            ? "सुन रहा हूँ... बोलना जारी रखें या रुकने के लिए दबाएं"
            : "Listening... speak now or tap to stop"
          : language === "hi"
          ? "बोलने के लिए माइक दबाएं"
          : "Tap mic to speak"}
      </div>

      {/* Mic Permission Warning */}
      {micError && (
        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{micError}</span>
        </div>
      )}
    </div>
  );
}
