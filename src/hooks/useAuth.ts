import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/useStore";
import { getAccessToken, getRefreshToken } from "@/lib/token";
import { apiClient } from "@/lib/axios";

export function useAuth() {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();

    const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);

    const isAuthenticated = isLoggedIn && (accessToken || refreshToken);

    const [isProfileCreated, setIsProfileCreated] = useState<boolean | null>(null);
    const [checking, setChecking] = useState<boolean>(false);

    useEffect(() => {
        let mounted = true;

        async function checkProfile() {
            // If there are no tokens, treat as not authenticated for backend check
            if (!accessToken && !refreshToken) {
                if (mounted) setIsProfileCreated(false);
                return;
            }

            setChecking(true);
            try {
                const response = await apiClient.get("/api/users/me/");
                const data = response.data;
                if (data?.success && data?.user) {
                    const fullName = data.user.full_name as string | undefined;
                    if (mounted) setIsProfileCreated(Boolean(fullName && fullName.trim() !== ""));
                } else {
                    if (mounted) setIsProfileCreated(false);
                }
            } catch (error) {
                if (mounted) setIsProfileCreated(false);
            } finally {
                if (mounted) setChecking(false);
            }
        }

        // checkProfile();

        return () => {
            mounted = false;
        };
    }, [accessToken, refreshToken]);

    return {
        isAuthenticated: Boolean(isAuthenticated),
        isProfileCreated,
        isProfileChecking: checking,
    };
}