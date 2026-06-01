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
// import locationReducer from "./features/location/locationSlice";
import { injectStore } from "@/lib/axios"; // <-- 1. Import injectStore

const authPersistConfig = {
    key: 'auth',
    storage,
    whitelist: ['user', 'isLoggedIn'],
};

// 2. Create a specific config for Location
const locationPersistConfig = {
    key: 'location',
    storage,
    whitelist: ['currentLocation', 'recentLocations'],
};

const rootReducer = combineReducers({
    auth: persistReducer(authPersistConfig, authReducer),
    // location: persistReducer(locationPersistConfig, locationReducer),
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