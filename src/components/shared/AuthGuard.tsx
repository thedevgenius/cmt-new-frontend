"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, getRefreshToken } from "@/lib/token";
import { useAppDispatch, useAppSelector } from "@/store/useStore";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/store/features/auth/authSlice";

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isAuthenticated, isProfileCreated } = useAuth();
    const { user } = useAppSelector((state) => state.auth);
    const [mounted, setMounted] = useState(false);

    // Wait for Redux Persist to rehydrate
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !isAuthenticated) {
            router.push("/login");
        }

        // if (mounted && isAuthenticated) {
        //     router.push("/profile/update");
        //     console.log("Profile not created");
        // }
    }, [mounted, isAuthenticated, router]);

    if (!mounted) {
        // Return a premium skeleton loader while checking auth state
        return (
            <div className="flex h-screen items-center justify-center bg-neutral-50">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-rose-500"></div>
            </div>
        );
    }

    // If authenticated, render the protected page
    if (isAuthenticated) {
        return <>{children}</>;
    }

    return null;
}