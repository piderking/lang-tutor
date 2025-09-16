"use client";
import { useEffect } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
}

export default function AnkiModal({ isOpen, onClose, url }: ModalProps) {
    // Close modal on Escape key
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" >
            {/* Modal Box */}
            < div className="relative w-[90%] max-w-4xl h-[80%] bg-white rounded-2xl shadow-xl overflow-hidden" >
                {/* Close Button */}
                < button
                    onClick={onClose}
                    className="absolute top-3 right-3 z-10 bg-gray-800 text-white rounded-full p-2 hover:bg-gray-600 transition"
                >
                    ✕
                </button>

                {/* Iframe */}
                <iframe
                    src={url}
                    className="w-full h-full border-0"
                    title="AnkiWeb"
                />
            </div>
        </div>
    );
}
