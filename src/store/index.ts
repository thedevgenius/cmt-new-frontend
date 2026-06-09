import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from "redux-persist";
import storage from "./storage";
import authReducer from "./features/auth/authSlice"; // Or wherever your authSlice is
import locationReducer from "./features/location/locationSlice";
import categoryReducer from "./features/category/categorySlice";
import categorySearchReducer from "./features/category/categorySearchSlice"; // <-- Import the new search slice
import { injectStore } from "@/lib/axios"; // <-- 1. Import injectStore

const authPersistConfig = {
    key: 'auth',
    storage,
    whitelist: ['user', 'isLoggedIn'],
};

const locationPersistConfig = {
    key: 'location',
    storage,
    whitelist: ['currentLocation', 'recentSearches'], // Persist both current location and recents
};

const categoryPersistConfig = {
    key: 'search',
    storage,
    // CRITICAL: We ONLY want to persist the recent searches. 
    // We do NOT want to persist 'isLoading' or old 'results'.
    whitelist: ['recentSearches'],
};

const rootReducer = combineReducers({
    auth: persistReducer(authPersistConfig, authReducer),
    location: persistReducer(locationPersistConfig, locationReducer),
    category: persistReducer(categoryPersistConfig, categoryReducer),
    categorySearch: categorySearchReducer, // <-- Add the new search slice
});

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

// <-- 2. Inject the store into Axios right here!
injectStore(store);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;