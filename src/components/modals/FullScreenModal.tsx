"use client";

import { useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { X } from "lucide-react";

interface FullScreenModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    preventCloseOnOverlayClick?: boolean;
}

export default function FullScreenModal({
    isOpen,
    onClose,
    children,
    preventCloseOnOverlayClick = false
}: FullScreenModalProps) {

    // Handle ESC key press
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener("keydown", handleKeyDown);
        }
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    // Handle Mobile Back Button integration
    useEffect(() => {
        const handlePopState = () => {
            if (isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            window.history.pushState({ modalOpen: true }, "");
            window.addEventListener("popstate", handlePopState);
        }

        return () => {
            window.removeEventListener("popstate", handlePopState);
            if (isOpen && window.history.state?.modalOpen) {
                window.history.back();
            }
        };
    }, [isOpen, onClose]);

    // Animation variants: Opens from the center (scale 0.95 -> 1)
    const modalVariants: Variants = {
        hidden: {
            opacity: 0,
            scale: 0.95,
            y: 10 // Slight upward motion combined with the scale
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { type: "spring", damping: 25, stiffness: 300 }
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            y: 10,
            transition: { duration: 0.2 } // Faster, linear exit feels better for closing
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => {
                            if (!preventCloseOnOverlayClick) {
                                onClose();
                            }
                        }}
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Layout Wrapper - Always centered */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-0 md:p-4">

                        {/* Modal Content */}
                        <motion.div
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            // w-full & h-[100dvh] forces full screen on mobile.
                            // md:h-auto & md:rounded-[2rem] snaps it back to a standard modal on desktop.
                            className="relative w-full h-dvh md:h-auto md:max-h-[90vh] md:max-w-lg bg-white md:rounded-4xl shadow-2xl pointer-events-auto flex flex-col overflow-hidden"
                        >

                            {/* Close Button (Inside content, top right) */}
                            <button
                                onClick={onClose}
                                className="absolute top-3 right-3 z-10 p-2 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-600 dark:text-gray-300 rounded-full transition-all active:scale-95"
                                aria-label="Close modal"
                            >
                                <X size={20} strokeWidth={2.5} />
                            </button>

                            {/* Scrollable Inner Content */}
                            {/* pt-16 ensures the content doesn't slide underneath the absolute positioned close button */}
                            <div className="p-3 h-full overflow-y-auto flex flex-col">
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}