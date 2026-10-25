"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export type VoiceState =
  | "idle"              // Ready for interaction
  | "speaking"          // Browser TTS is reading the panel question
  | "listening"         // Browser SpeechRecognition is recording
  | "permission-denied" // Microphone access blocked by user/browser
  | "unsupported";      // Web Speech API not supported in this browser

// Type declarations for browser Web Speech Recognition
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionInstanceLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstanceLike;

interface UseInterviewVoiceOptions {
  onTranscriptUpdate?: (text: string) => void;
}

export function useInterviewVoice(options?: UseInterviewVoiceOptions) {
  const [isVoiceSupported] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return "speechSynthesis" in window;
  });

  const [isRecognitionSupported] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const RecognitionConstructor =
      (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor })
        .webkitSpeechRecognition;
    return typeof RecognitionConstructor !== "undefined";
  });

  const [voiceState, setVoiceState] = useState<VoiceState>(() => {
    if (typeof window === "undefined") return "idle";
    const hasTTS = "speechSynthesis" in window;
    const hasRecognition =
      typeof (
        (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor })
          .SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor })
          .webkitSpeechRecognition
      ) !== "undefined";
    return (!hasRecognition && !hasTTS) ? "unsupported" : "idle";
  });

  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const [voiceErrorMessage, setVoiceErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstanceLike | null>(null);
  const isManuallyStoppingRef = useRef<boolean>(true); // Default to true so mic never rogue-restarts
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedTranscriptRef = useRef<string>("");

  // Helper to safely clear silence detection timer
  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  // Store options in a ref so event callbacks never capture stale props
  const optionsRef = useRef<UseInterviewVoiceOptions | undefined>(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Initialize Speech Recognition on client mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const RecognitionConstructor: SpeechRecognitionConstructor | undefined =
      (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor })
        .webkitSpeechRecognition;

    const hasRecognition = typeof RecognitionConstructor !== "undefined";

    if (!hasRecognition) return;

    if (hasRecognition && RecognitionConstructor) {
      try {
        const recognition = new RecognitionConstructor();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-IN"; // Default to Indian English for authentic SBI PO accents

        recognition.onstart = () => {
          setVoiceState("listening");
          setVoiceErrorMessage(null);
        };

        recognition.onresult = (event: SpeechRecognitionEventLike) => {
          let currentInterim = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              const cleaned = transcript.trim();
              if (cleaned) {
                // Deduplicate if browser re-emits trailing final transcript on silence restart
                const existing = accumulatedTranscriptRef.current.trim();
                if (!existing.endsWith(cleaned)) {
                  accumulatedTranscriptRef.current = (existing ? existing + " " : "") + cleaned;
                }
              }
            } else {
              currentInterim += transcript;
            }
          }

          setInterimTranscript(currentInterim);
          const fullText = (accumulatedTranscriptRef.current + (currentInterim ? " " + currentInterim : "")).trim();
          setLiveTranscript(fullText);

          if (optionsRef.current?.onTranscriptUpdate) {
            optionsRef.current.onTranscriptUpdate(fullText);
          }

          // Restart silence timer: if user speaks and then pauses for 3 seconds,
          // auto-stop the microphone so it doesn't linger active indefinitely.
          clearSilenceTimer();
          if (fullText.length > 0) {
            silenceTimerRef.current = setTimeout(() => {
              isManuallyStoppingRef.current = true;
              try {
                recognitionRef.current?.stop();
              } catch {
                // ignore
              }
              setVoiceState("idle");
            }, 3000);
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
          clearSilenceTimer();
          console.warn("Speech recognition error:", event.error);
          if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            setVoiceState("permission-denied");
            setVoiceErrorMessage("Microphone access was denied. Please allow microphone permissions in your browser address bar.");
          } else if (event.error === "no-speech") {
            // Gracefully stop listening on silence
            isManuallyStoppingRef.current = true;
            setVoiceState("idle");
          } else {
            setVoiceErrorMessage(`Speech recognition error: ${event.error}`);
            setVoiceState("idle");
          }
        };

        recognition.onend = () => {
          clearSilenceTimer();
          setInterimTranscript("");
          setVoiceState("idle");
        };

        recognitionRef.current = recognition;
      } catch (e) {
        console.warn("Could not instantiate speech recognition:", e);
      }
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup abort errors
        }
      }
    };
  }, []);

  // Preload and cache available voices on mount
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    function loadVoices() {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        voicesRef.current = v;
      }
    }

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Keep a reference to prevent browser garbage collection of active utterance
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  /**
   * Speak question or prompt aloud using browser SpeechSynthesis
   */
  const speakText = useCallback(
    (text: string, onComplete?: () => void) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

      const synth = window.speechSynthesis;

      // Ensure microphone is stopped while speaking to prevent self-pickup loop
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }

      // Stop previous utterance
      synth.cancel();

      if (!text || text.trim().length === 0) return;

      const utterance = new SpeechSynthesisUtterance(text.trim());
      utterance.rate = 0.95; // Clear and measured pace suitable for panel questions
      utterance.pitch = 1.0;
      utterance.lang = "en-IN";

      // Select best voice: 1) Indian English, 2) any English, 3) default
      const availableVoices = voicesRef.current.length > 0 ? voicesRef.current : synth.getVoices();
      const inVoice =
        availableVoices.find((v) => v.lang === "en-IN" || v.lang.replace("_", "-") === "en-IN") ||
        availableVoices.find((v) => v.lang.startsWith("en-") || v.lang.startsWith("en_")) ||
        availableVoices[0];

      if (inVoice) {
        utterance.voice = inVoice;
      }

      activeUtteranceRef.current = utterance;
      setVoiceState("speaking");

      utterance.onend = () => {
        activeUtteranceRef.current = null;
        setVoiceState("idle");
        if (onComplete) onComplete();
      };

      utterance.onerror = (e) => {
        // "canceled" and "interrupted" are normal when speech is replaced or stopped by user
        if (e.error === "canceled" || e.error === "interrupted") {
          activeUtteranceRef.current = null;
          setVoiceState("idle");
          return;
        }
        console.warn("SpeechSynthesis utterance error:", e.error);
        activeUtteranceRef.current = null;
        setVoiceState("idle");
      };

      synth.speak(utterance);
    },
    []
  );

  /**
   * Stop any active TTS speaking
   */
  const stopSpeaking = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    if (voiceState === "speaking") {
      setVoiceState("idle");
    }
  }, [voiceState]);

  /**
   * Start listening to candidate speech via microphone
   */
  const startListening = useCallback(
    (existingText = "") => {
      if (!recognitionRef.current) {
        setVoiceState("unsupported");
        return;
      }

      // Stop any active TTS first
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      accumulatedTranscriptRef.current = existingText.trim();
      setLiveTranscript(existingText.trim());
      isManuallyStoppingRef.current = false;
      setVoiceErrorMessage(null);

      try {
        recognitionRef.current.start();
        setVoiceState("listening");
      } catch (err: unknown) {
        // Recognition might already be running
        console.warn("Recognition start warning:", err);
      }
    },
    []
  );

  /**
   * Stop microphone recording
   */
  const stopListening = useCallback(() => {
    clearSilenceTimer();
    isManuallyStoppingRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setInterimTranscript("");
    setVoiceState("idle");
  }, []);

  /**
   * Reset transcript and states
   */
  const resetVoiceState = useCallback(() => {
    stopSpeaking();
    stopListening();
    accumulatedTranscriptRef.current = "";
    setLiveTranscript("");
    setVoiceErrorMessage(null);
    setVoiceState("idle");
  }, [stopSpeaking, stopListening]);

  return {
    isVoiceSupported,
    isRecognitionSupported,
    voiceState,
    liveTranscript,
    interimTranscript,
    voiceErrorMessage,
    speakText,
    stopSpeaking,
    startListening,
    stopListening,
    resetVoiceState,
  };
}
