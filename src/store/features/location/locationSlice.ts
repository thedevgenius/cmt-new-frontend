import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { LocationDetails, Suggestion } from '@/types/location';
import { locationApi } from '@/services/locationApi';

interface LocationState {
    currentLocation: LocationDetails | null;
    recentSearches: Suggestion[];
    suggestions: Suggestion[];
    isLoadingSuggestions: boolean;
    isLocating: boolean;
    error: string | null;
}

const initialState: LocationState = {
    currentLocation: null,
    recentSearches: [],
    suggestions: [],
    isLoadingSuggestions: false,
    isLocating: false,
    error: null,
};

// --- THUNKS ---

export const fetchSuggestions = createAsyncThunk(
    'location/fetchSuggestions',
    async (query: string, { rejectWithValue }) => {
        try {
            const results = await locationApi.getSuggestions(query);
            return results;
        } catch (err) {
            return rejectWithValue('Failed to fetch suggestions');
        }
    }
);

export const fetchLocationByPlaceId = createAsyncThunk(
    'location/fetchLocationByPlaceId',
    async (suggestion: Suggestion, { dispatch, rejectWithValue }) => {
        try {
            const coordsData = await locationApi.getCoordinatesByPlaceId(suggestion.place_id);

            // Dispatch the action to add to recent searches immediately
            dispatch(addRecentSearch(suggestion));

            return {
                lat: coordsData.lat,
                lng: coordsData.lng,
                landmark: suggestion.main_text,
                city: coordsData.city
            } as LocationDetails;
        } catch (err) {
            return rejectWithValue('Failed to fetch location details.');
        }
    }
);

export const fetchLocationByCoords = createAsyncThunk(
    'location/fetchLocationByCoords',
    async ({ lat, lng }: { lat: number; lng: number }, { rejectWithValue }) => {
        try {
            const geocodeData = await locationApi.getReverseGeocode(lat, lng);
            console.log(geocodeData);
            return {
                lat,
                lng,
                landmark: geocodeData.landmark || "Current Location",
                city: geocodeData.city
            } as LocationDetails;
        } catch (err) {
            return rejectWithValue('Could not identify your location address.');
        }
    }
);

// --- SLICE ---

const locationSlice = createSlice({
    name: 'location',
    initialState,
    reducers: {
        addRecentSearch: (state, action: PayloadAction<Suggestion>) => {
            const filteredSearches = state.recentSearches.filter(
                (item) => item.place_id !== action.payload.place_id
            );
            state.recentSearches = [action.payload, ...filteredSearches].slice(0, 5);
        },
        clearSuggestions: (state) => {
            state.suggestions = [];
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Suggestions
            .addCase(fetchSuggestions.pending, (state) => {
                state.isLoadingSuggestions = true;
                state.error = null;
            })
            .addCase(fetchSuggestions.fulfilled, (state, action) => {
                state.isLoadingSuggestions = false;
                state.suggestions = action.payload;
            })
            .addCase(fetchSuggestions.rejected, (state, action) => {
                state.isLoadingSuggestions = false;
                // Optional: handle silent failure for suggestions or set error
            })

            // Fetch By Place ID (User clicked a suggestion)
            .addCase(fetchLocationByPlaceId.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchLocationByPlaceId.fulfilled, (state, action) => {
                state.currentLocation = action.payload;
                state.suggestions = []; // Clear suggestions on success
            })
            .addCase(fetchLocationByPlaceId.rejected, (state, action) => {
                state.error = action.payload as string;
            })

            // Fetch By Coords (Use Current Location)
            .addCase(fetchLocationByCoords.pending, (state) => {
                state.isLocating = true;
                state.error = null;
            })
            .addCase(fetchLocationByCoords.fulfilled, (state, action) => {
                state.isLocating = false;
                state.currentLocation = action.payload;
                
            })
            .addCase(fetchLocationByCoords.rejected, (state, action) => {
                state.isLocating = false;
                state.error = action.payload as string;
            });
    },
});

export const { addRecentSearch, clearSuggestions, setError } = locationSlice.actions;
export default locationSlice.reducer;