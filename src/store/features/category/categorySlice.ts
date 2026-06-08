import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Category, CategorySearchResponse } from '@/types/category';
import { categoryApi } from '@/services/categoryApi';

export type RecentCategory = Pick<Category, 'name' | 'slug'>;

interface CategorySearchState {
    results: Category[];
    recentSearches: RecentCategory[];
    totalCount: number;
    isLoading: boolean;
    error: string | null;
}

const initialState: CategorySearchState = {
    results: [],
    recentSearches: [],
    totalCount: 0,
    isLoading: false,
    error: null,
};

// --- THUNK ---
export const fetchCategories = createAsyncThunk<
    CategorySearchResponse,
    string,
    { rejectValue: string }
>(
    'categorySearch/fetchCategories',
    async (query: string, { rejectWithValue }) => {
        try {
            const response = await categoryApi.searchCategories(query);
            return response;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to search categories');
        }
    }
);

// --- SLICE ---
const categorySearchSlice = createSlice({
    name: 'categorySearch',
    initialState,
    reducers: {
        clearSearchResults: (state) => {
            state.results = [];
            state.totalCount = 0;
            state.error = null;
        },
        addRecentSearch: (state, action: PayloadAction<Category | RecentCategory>) => {
            // Extract ONLY the fields we care about
            const { name, slug } = action.payload;
            const lightweightCategory: RecentCategory = { name, slug };

            // Remove if it already exists to prevent duplicates
            const filteredSearches = state.recentSearches.filter(cat => cat.slug !== slug);

            // Add to the top, keep only the latest 5
            state.recentSearches = [lightweightCategory, ...filteredSearches].slice(0, 5);
        },
        removeRecentSearch: (state, action: PayloadAction<string>) => {
            // Allow users to delete a specific recent search by ID
            state.recentSearches = state.recentSearches.filter(cat => cat.slug !== action.payload);
        },
        clearRecentSearches: (state) => {
            state.recentSearches = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.isLoading = false;
                state.results = action.payload.results;
                state.totalCount = action.payload.count;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                state.results = [];
            });
    }
});

export const { clearSearchResults, addRecentSearch, removeRecentSearch, clearRecentSearches } = categorySearchSlice.actions;
export default categorySearchSlice.reducer;