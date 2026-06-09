import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CategoryNode, RecentCategory } from '@/types/category';
import axios from 'axios';

// --- HELPER FUNCTION (From Step 2) ---
const searchCategoryTree = (nodes: CategoryNode[], query: string): CategoryNode[] => {
    let results: CategoryNode[] = [];
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return results;

    for (const node of nodes) {
        const matchesQuery = node.name.toLowerCase().split(' ').some(word => word.startsWith(lowerQuery)) || 
                     node.slug.toLowerCase().split('-').some(word => word.startsWith(lowerQuery));
        if (matchesQuery) {
            const { children, ...flatNode } = node;
            results.push(flatNode);
        }
        if (node.children && node.children.length > 0) {
            results = results.concat(searchCategoryTree(node.children, query));
        }
    }
    return results;
};

// --- STATE INTERFACE ---
interface CategorySearchState {
    fullTree: CategoryNode[];      // Stores the master JSON downloaded once
    isTreeLoaded: boolean;         // Tracks if we need to fetch the master JSON
    isTreeLoading: boolean;        // Tracks active fetch state
    treeError: string | null;      // Tracks fetch error
    
    searchResults: CategoryNode[]; // The filtered results to show in UI
    recentSearches: RecentCategory[]; 
}

const initialState: CategorySearchState = {
    fullTree: [],
    isTreeLoaded: false,
    isTreeLoading: false,
    treeError: null,
    searchResults: [],
    recentSearches: [],
};

// --- ONLY ONE THUNK TO LOAD THE MASTER TREE ---
export const fetchCategoryTree = createAsyncThunk<
    CategoryNode[], 
    void, 
    { rejectValue: string }
>(
    'categorySearch/fetchCategoryTree',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('http://192.168.0.82:8000/api/categories/tree/');
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to load categories');
        }
    }
);

// --- SLICE ---
const categorySearchSlice = createSlice({
    name: 'categorySearch',
    initialState,
    reducers: {
        // Synchronous Local Search Reducer
        executeLocalSearch: (state, action: PayloadAction<string>) => {
            const query = action.payload;
            if (!query.trim()) {
                state.searchResults = [];
            } else {
                state.searchResults = searchCategoryTree(state.fullTree, query);
            }
        },
        clearSearchResults: (state) => {
            state.searchResults = [];
        },
        addRecentSearch: (state, action: PayloadAction<CategoryNode | RecentCategory>) => {
            const { id, name, slug } = action.payload;
            const lightweightCategory: RecentCategory = { id, name, slug };
            const filteredSearches = state.recentSearches.filter(cat => cat.id !== id);
            state.recentSearches = [lightweightCategory, ...filteredSearches].slice(0, 5);
        },
        removeRecentSearch: (state, action: PayloadAction<number>) => {
            state.recentSearches = state.recentSearches.filter(cat => cat.id !== action.payload);
        },
        clearRecentSearches: (state) => {
            state.recentSearches = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategoryTree.pending, (state) => {
                state.isTreeLoading = true;
                state.treeError = null;
            })
            .addCase(fetchCategoryTree.fulfilled, (state, action) => {
                state.isTreeLoading = false;
                state.isTreeLoaded = true;
                state.fullTree = action.payload;
            })
            .addCase(fetchCategoryTree.rejected, (state, action) => {
                state.isTreeLoading = false;
                state.treeError = action.payload as string;
            });
    }
});

export const { 
    executeLocalSearch, 
    clearSearchResults, 
    addRecentSearch, 
    removeRecentSearch, 
    clearRecentSearches 
} = categorySearchSlice.actions;

export default categorySearchSlice.reducer;