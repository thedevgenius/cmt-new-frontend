"use client";

import React, { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
    children?: ReactNode;
    className?: string;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    showIcon?: boolean;
    [key: string]: any;
}

export default function BackButton({
    children,
    className = "",
    onClick,
    showIcon = true,
    ...rest
}: BackButtonProps) {
    const router = useRouter();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        // Call custom onClick if provided
        if (onClick) {
            onClick(e);
        }

        // Check if there's history available
        // If history.length is 1, user directly opened the page (no previous pages)
        if (window.history.length <= 2) {
            router.push("/");
        } else {
            router.back();
        }
    };

    return (
        <button onClick={handleClick} className={className} {...rest}>
            {showIcon && <ArrowLeft size={20} className="inline" />}
            {/* {children || "Back"} */}
        </button>
    );
}
