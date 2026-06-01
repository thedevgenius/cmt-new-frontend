import axios from "axios";
import { getAccessToken, getRefreshToken, setTokens, removeTokens } from "./token";

// --- ADD THIS BLOCK ---
// We hold the store in a variable to avoid circular imports
let store: any;
export const injectStore = (_store: any) => {
    store = _store;
};
// ----------------------

export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "https://cmt-final-backend.onrender.com",
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor: Attach Access Token
apiClient.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401s & Refresh Tokens
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = getRefreshToken();

            if (refreshToken) {
                try {
                    const { data } = await axios.post(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/token/refresh/`,
                        { refresh: refreshToken }
                    );

                    setTokens(data.access, refreshToken);
                    originalRequest.headers.Authorization = `Bearer ${data.access}`;
                    return apiClient(originalRequest);
                } catch (refreshError) {
                    removeTokens();
                    // --- UPDATE THIS LINE ---
                    if (store) store.dispatch({ type: "auth/logout" });
                    return Promise.reject(refreshError);
                }
            } else {
                removeTokens();
                // --- UPDATE THIS LINE ---
                if (store) store.dispatch({ type: "auth/logout" });
            }
        }
        return Promise.reject(error);
    }
);