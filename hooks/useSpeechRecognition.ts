"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface UseSpeechRecognitionOptions {
    onResult?: (transcript: string) => void;
    onError?: (error: string) => void;
    continuous?: boolean;
    language?: string;
}

interface UseSpeechRecognitionReturn {
    isListening: boolean;
    isSupported: boolean;
    transcript: string;
    startListening: () => void;
    stopListening: () => void;
    toggleListening: () => void;
    error: string | null;
}

// Type definitions for Web Speech API
interface SpeechRecognitionEvent {
    resultIndex: number;
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    length: number;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    isFinal: boolean;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognitionErrorEvent {
    error: string;
}

interface ISpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onstart: (() => void) | null;
    onend: (() => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
}

interface ISpeechRecognitionConstructor {
    new(): ISpeechRecognition;
}

// Extend Window interface
declare global {
    interface Window {
        SpeechRecognition?: ISpeechRecognitionConstructor;
        webkitSpeechRecognition?: ISpeechRecognitionConstructor;
    }
}

export function useSpeechRecognition(
    options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
    const {
        onResult,
        onError,
        continuous = false,
        language = "en-US",
    } = options;

    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSupported, setIsSupported] = useState(false);

    const recognitionRef = useRef<ISpeechRecognition | null>(null);

    // Check for browser support on mount
    useEffect(() => {
        const SpeechRecognitionAPI =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognitionAPI) {
            setIsSupported(true);
            recognitionRef.current = new SpeechRecognitionAPI();

            const recognition = recognitionRef.current;
            recognition.continuous = continuous;
            recognition.interimResults = true;
            recognition.lang = language;

            recognition.onstart = () => {
                setIsListening(true);
                setError(null);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                let errorMessage = "An error occurred during speech recognition.";

                switch (event.error) {
                    case "no-speech":
                        errorMessage = "No speech was detected. Please try again.";
                        break;
                    case "audio-capture":
                        errorMessage = "No microphone was found. Please check your device.";
                        break;
                    case "not-allowed":
                        errorMessage = "Microphone access was denied. Please allow microphone access.";
                        break;
                    case "network":
                        errorMessage = "A network error occurred. Please check your connection.";
                        break;
                    case "aborted":
                        errorMessage = "Speech recognition was aborted.";
                        break;
                    default:
                        errorMessage = `Speech recognition error: ${event.error}`;
                }

                setError(errorMessage);
                setIsListening(false);
                onError?.(errorMessage);
            };

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                let finalTranscript = "";
                let interimTranscript = "";

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i];
                    if (result.isFinal) {
                        finalTranscript += result[0].transcript;
                    } else {
                        interimTranscript += result[0].transcript;
                    }
                }

                const currentTranscript = finalTranscript || interimTranscript;
                setTranscript(currentTranscript);

                // Only call onResult with final transcript
                if (finalTranscript) {
                    onResult?.(finalTranscript.trim());
                }
            };
        } else {
            setIsSupported(false);
        }

        // Cleanup on unmount
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, [continuous, language, onResult, onError]);

    const startListening = useCallback(() => {
        if (!recognitionRef.current || !isSupported) {
            setError("Speech recognition is not supported in your browser.");
            onError?.("Speech recognition is not supported in your browser.");
            return;
        }

        setError(null);
        setTranscript("");

        try {
            recognitionRef.current.start();
        } catch (err) {
            // Handle case where recognition is already running
            if (err instanceof Error && err.message.includes("already started")) {
                recognitionRef.current.stop();
                setTimeout(() => {
                    recognitionRef.current?.start();
                }, 100);
            }
        }
    }, [isSupported, onError]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    }, [isListening]);

    const toggleListening = useCallback(() => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }, [isListening, startListening, stopListening]);

    return {
        isListening,
        isSupported,
        transcript,
        startListening,
        stopListening,
        toggleListening,
        error,
    };
}
