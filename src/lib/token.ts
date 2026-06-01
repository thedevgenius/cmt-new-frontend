import Cookies from "js-cookie";

const ACCESS_TOKEN_KEY = "app_access_token";
const REFRESH_TOKEN_KEY = "app_refresh_token";

export const setTokens = (access: string, refresh: string) => {
    // Set access token (e.g., expires in 1 day)
    Cookies.set(ACCESS_TOKEN_KEY, access, {
        expires: 1,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    });

    // Set refresh token (e.g., expires in 7 days)
    Cookies.set(REFRESH_TOKEN_KEY, refresh, {
        expires: 7,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    });
};

export const getAccessToken = () => {
    return Cookies.get(ACCESS_TOKEN_KEY) || null;
};

export const getRefreshToken = () => {
    return Cookies.get(REFRESH_TOKEN_KEY) || null;
};

export const removeTokens = () => {
    Cookies.remove(ACCESS_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
};