"use client";

import React, { useState, useEffect } from "react";
import { Search, MapPin, Crosshair, Loader2, Clock } from "lucide-react";
import BottomSheetModal from "@/components/modals/BottomSheetModal";
import { useAppDispatch, useAppSelector } from "@/store/useStore";
import {
    fetchSuggestions,
    fetchLocationByPlaceId,
    fetchLocationByCoords,
    clearSuggestions,
    setError
} from "@/store/features/location/locationSlice";
import { Suggestion } from "@/types/location";

interface LocationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LocationModal({
    isOpen,
    onClose,
}: LocationModalProps) {
    const dispatch = useAppDispatch();

    // Pull state from Redux
    const {
        recentSearches,
        suggestions,
        isLoadingSuggestions,
        isLocating,
        error
    } = useAppSelector((state) => state.location);

    const [query, setQuery] = useState('');

    // Clear local input when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setQuery('');
            dispatch(clearSuggestions());
        }
    }, [isOpen, dispatch]);

    // Debounced API call for suggestions
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim().length > 2) {
                dispatch(fetchSuggestions(query));
            } else {
                dispatch(clearSuggestions());
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [query, dispatch]);

    const handleSuggestionClick = async (suggestion: Suggestion) => {
        // Dispatch the thunk to fetch coords and save to Redux
        await dispatch(fetchLocationByPlaceId(suggestion));

        // Clear input and close modal
        setQuery('');
        onClose();
    };

    const handleCurrentLocationClick = () => {
        if (!navigator.geolocation) {
            dispatch(setError("Geolocation is not supported by your browser."));
            return;
        }

        dispatch(setError(null));

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                await dispatch(fetchLocationByCoords({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                }));
                onClose(); // Close modal upon successful location fetch
            },
            () => {
                dispatch(setError("Location permission denied. Please enable it in your browser."));
            }
        );
    };

    return (
        <BottomSheetModal isOpen={isOpen} onClose={onClose}>
            <div className="flex flex-col w-full h-[50vh] sm:h-[60vh] bg-white">

                {/* Search Bar Header */}
                <div className="p-4 border-b shrink-0">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Select your location
                    </h2>
                    <div className="relative flex items-center w-full h-12 rounded-lg bg-gray-100 px-3 focus-within:ring-1 focus-within:ring-green-500">
                        <Search className="w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            className="w-full bg-transparent outline-none ml-3 text-sm text-gray-700"
                            placeholder="Search for area, street name..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                        {isLoadingSuggestions && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
                    </div>
                    {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">

                    {/* Current Location Button - Hidden if typing */}
                    {query.length === 0 && (
                        <button
                            onClick={handleCurrentLocationClick}
                            disabled={isLocating}
                            className="flex items-center w-full text-left group disabled:opacity-70"
                        >
                            <div className="flex items-center justify-center w-10 h-10 rounded-full text-green-600 bg-green-50 group-hover:bg-green-100 transition-colors">
                                {isLocating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Crosshair className="w-5 h-5" />}
                            </div>
                            <div className="ml-4">
                                <p className="text-green-600 font-medium text-sm">Use current location</p>
                                <p className="text-gray-400 text-xs mt-0.5">Using GPS</p>
                            </div>
                        </button>
                    )}

                    {/* Suggestions / Results */}
                    {query.length > 0 ? (
                        <div className="space-y-4">
                            {suggestions.map((suggestion) => (
                                <button
                                    key={suggestion.place_id}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="flex items-start w-full text-left py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded px-2 -mx-2 transition-colors"
                                >
                                    <div className="mt-0.5 min-w-5">
                                        <MapPin className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{suggestion.main_text}</p>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{suggestion.secondary_text}</p>
                                    </div>
                                </button>
                            ))}
                            {!isLoadingSuggestions && suggestions.length === 0 && (
                                <div className="py-8 text-center">
                                    <p className="text-sm text-gray-500">No locations found for "{query}"</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Recent Searches */
                        recentSearches.length > 0 && (
                            <div className="border-t pt-4">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                                    Recent Searches
                                </p>
                                <div className="space-y-1">
                                    {recentSearches.map((search) => (
                                        <button
                                            key={`recent-${search.place_id}`}
                                            onClick={() => handleSuggestionClick(search)}
                                            className="flex items-center w-full text-left py-3 hover:bg-gray-50 rounded px-2 -mx-2 transition-colors"
                                        >
                                            <Clock className="w-5 h-5 text-gray-400 shrink-0" />
                                            <div className="ml-3 flex-1 overflow-hidden">
                                                <p className="text-sm font-medium text-gray-700 truncate">{search.main_text}</p>
                                                <p className="text-xs text-gray-500 truncate">{search.secondary_text}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </BottomSheetModal>
    );
}