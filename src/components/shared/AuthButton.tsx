"use client";

import React, { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface AuthButtonProps {
    href: string;
    children: ReactNode;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    className?: string;
    [key: string]: any; // Allow additional props like type, disabled, etc.
}

export function AuthButton({
    href,
    children,
    onClick,
    className = "",
    ...rest
}: AuthButtonProps) {
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        // Call custom onClick if provided
        if (onClick) {
            onClick(e);
        }

        // Navigate based on auth status
        if (isAuthenticated) {
            router.push(href);
        } else {
            router.push("/login");
        }
    };

    return (
        <button onClick={handleClick} className={`cursor-pointer ${className}`} {...rest}>
            {children}
        </button>
    );
}
