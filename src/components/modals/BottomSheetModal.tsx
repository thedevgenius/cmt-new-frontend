"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { X } from "lucide-react";

interface BottomSheetModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    preventCloseOnOverlayClick?: boolean;
    bg: string;
}

export default function BottomSheetModal({ isOpen, onClose, children, preventCloseOnOverlayClick, bg }: BottomSheetModalProps) {

    // 1. Create a ref to always hold the latest version of onClose
    const onCloseRef = useRef(onClose);

    // 2. Update the ref whenever onClose changes, without triggering history effects
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    // Handle ESC key press
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onCloseRef.current(); // Use the ref here
            }
        };

        if (isOpen) {
            window.addEventListener("keydown", handleKeyDown);
        }
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]); // <-- Removed onClose from dependencies

    // Handle Mobile Back Button integration
    // useEffect(() => {
    //     const handlePopState = () => {
    //         if (isOpen) {
    //             onCloseRef.current(); // Use the ref here
    //         }
    //     };

    //     if (isOpen) {
    //         // Push a state to the history stack so the back button has something to pop
    //         window.history.pushState({ modalOpen: true }, "");
    //         window.addEventListener("popstate", handlePopState);
    //     }

    //     return () => {
    //         window.removeEventListener("popstate", handlePopState);
    //         // Clean up the history state if the modal is closed manually (not via back button)
    //         if (isOpen && window.history.state?.modalOpen) {
    //             window.history.back();
    //         }
    //     };
    // }, [isOpen]); // <-- Removed onClose from dependencies. Now this ONLY runs when the modal opens/closes!
    

    // Animation variants for that premium spring feel
    const modalVariants: Variants = {
        hidden: { y: "100%", opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", damping: 27, stiffness: 200 }
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
                        onTap={() => {
                            if (!preventCloseOnOverlayClick) {
                                onClose(); // Normal onClose is fine to use directly in JSX
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
                            className={`relative w-full md:max-w-lg ${bg} rounded-t-2xl md:rounded-3xl shadow-2xl pointer-events-auto flex flex-col min-h-[60dvh] max-h-[90vh]`}
                        >

                            {/* Floating Close Button (On Backdrop) */}
                            <button
                                onClick={onClose}
                                className="w-10 h-10 flex justify-center items-center absolute -top-14 left-[50%] translate-x-[-50%] md:-top-14 md:right-0 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-all active:scale-95"
                                aria-label="Close modal"
                            >
                                <X size={20} strokeWidth={2.5} />
                            </button>

                            {/* Scrollable Inner Content */}
                            <div className="overflow-y-auto">
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}