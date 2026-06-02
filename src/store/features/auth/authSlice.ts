import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/axios"; // Import your Axios instance directly
import { setTokens, removeTokens } from "@/lib/token";

// --- THUNKS ---

export const requestOtpThunk = createAsyncThunk(
    "auth/requestOtp",
    async (phone: string, { rejectWithValue }) => {
        try {
            // Make the API call directly here
            const response = await apiClient.post("/api/otp/request/", { phone });
            const data = response.data;

            if (!data.success) {
                return rejectWithValue(data.message || "Failed to send OTP");
            }
            return { phone };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "An error occurred");
        }
    }
);

export const verifyOtpThunk = createAsyncThunk(
    "auth/verifyOtp",
    async ({ phone, otp }: { phone: string; otp: string }, { rejectWithValue }) => {
        try {
            // Make the API call directly here
            const response = await apiClient.post("/api/otp/verify/", { phone, otp });
            const data = response.data;

            if (!data.success || !data.tokens) {
                return rejectWithValue(data.detail || "Invalid OTP");
            }

            // Set cookies
            setTokens(data.tokens.access, data.tokens.refresh);
            return { user: { userName: data.user.full_name, phone: data.user.phone } };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.detail || "Invalid OTP or network error");
        }
    }
);

// --- SLICE ---

interface AuthState {
    isLoggedIn: boolean;
    user: any | null;
    isLoading: boolean;
    error: string | null;
    step: string | "phone" | "otp" | "profile";
    formattedPhone: string | null;
}

const initialState: AuthState = {
    isLoggedIn: false,
    user: null,
    isLoading: false,
    error: null,
    step: "phone",
    formattedPhone: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            state.isLoggedIn = false;
            state.user = null;
            state.step = "phone";
            state.formattedPhone = null;
            removeTokens();
        },
        resetStep: (state) => {
            state.step = "phone";
            state.error = null;
            state.formattedPhone = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Request OTP
        builder.addCase(requestOtpThunk.pending, (state) => {
            // state.isLoading = true;
            state.error = null;
        });
        builder.addCase(requestOtpThunk.fulfilled, (state, action) => {
            state.isLoading = false;
            state.step = "otp"; // Move to OTP step
            state.formattedPhone = action.payload.phone;
        });
        builder.addCase(requestOtpThunk.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Verify OTP
        builder.addCase(verifyOtpThunk.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(verifyOtpThunk.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isLoggedIn = true;
            state.user = action.payload.user;
        
        });
        builder.addCase(verifyOtpThunk.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });
    },
});

export const { logout, resetStep, clearError } = authSlice.actions;
export default authSlice.reducer;