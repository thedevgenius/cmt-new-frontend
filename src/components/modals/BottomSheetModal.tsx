"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { X } from "lucide-react";

interface BottomSheetModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    preventCloseOnOverlayClick?: boolean;
}

export default function BottomSheetModal({ isOpen, onClose, children, preventCloseOnOverlayClick }: BottomSheetModalProps) {
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
            // Push a state to the history stack so the back button has something to pop
            window.history.pushState({ modalOpen: true }, "");
            window.addEventListener("popstate", handlePopState);
            console.log(window.history.state);
        }

        return () => {
            window.removeEventListener("popstate", handlePopState);
            // Clean up the history state if the modal is closed manually (not via back button)
            if (isOpen && window.history.state?.modalOpen) {
                window.history.back();
            }
        };
    }, [isOpen, onClose]);

    // Animation variants for that premium spring feel
    const modalVariants: Variants = {
        hidden: { y: "100%", opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", damping: 25, stiffness: 200 }
        },
        exit: {
            y: "100%",
            opacity: 0,
            transition: { type: "spring", damping: 25, stiffness: 200 }
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

                    {/* Modal Layout Wrapper */}
                    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center pointer-events-none p-0 md:p-4">

                        {/* Modal Content */}
                        <motion.div
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            // pointer-events-auto is crucial here because the wrapper is pointer-events-none
                            className="relative w-full md:max-w-lg bg-white rounded-t-4xl md:rounded-4xl shadow-2xl pointer-events-auto flex flex-col max-h-[90vh]"
                        >

                            {/* Floating Close Button (On Backdrop) */}
                            <button
                                onClick={onClose}
                                className="w-10 h-10 flex justify-center items-center absolute -top-14 left-[50%] translate-x-[-50%] md:-top-14 md:right-0 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-all active:scale-95"
                                aria-label="Close modal"
                            >
                                <X size={20} strokeWidth={2.5} />
                            </button>

                            {/* Optional: Mobile drag indicator pill */}
                            <div className="w-full flex justify-center pt-3 pb-1 md:hidden">
                                <div className="w-12 h-1.5 bg-gray-300 dark:bg-zinc-700 rounded-full" />
                            </div>

                            {/* Scrollable Inner Content */}
                            <div className="p-6 overflow-y-auto">
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}