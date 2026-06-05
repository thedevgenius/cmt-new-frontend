"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, Crosshair, ChevronRight, MapPin } from "lucide-react";
import BottomSheetModal from "@/components/modals/BottomSheetModal";
import { fetchSuggestions, clearSuggestions } from "@/store/features/location/locationSlice";
import { useDebounce } from "@/hooks/useDebounce";
import { useAppDispatch, useAppSelector } from "@/store/useStore";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LocationModal({ isOpen, onClose }: LocationModalProps) {
    const dispatch = useAppDispatch();
    const { suggestions, isLoadingSuggestions } = useAppSelector((state) => state.location);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 400);

    useEffect(() => {
        if (debouncedSearchTerm) {
            dispatch(fetchSuggestions(debouncedSearchTerm));
        }
    }, [debouncedSearchTerm, dispatch]);

    const handleClose = () => {
        setSearchTerm("");
        dispatch(clearSuggestions());
        onClose();
    }

  return (
    <BottomSheetModal isOpen={isOpen} onClose={handleClose} bg="bg-surface">
      <>
        <div className="p-3">
          <h2 className="text-lg font-semibold">Select your location</h2>
          <input
            type="text"
            placeholder="Search for a location"
            className="w-full mt-3 px-4 py-3 bg-white rounded-lg shadow-sm outline-none focus:ring-1 focus:ring-primary-300 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

            <div className="min-h-60">
            {isLoadingSuggestions ? (
              <p className="text-center mt-4 text-gray-500">Loading suggestions...</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {suggestions.map((suggestion) => (
                  <li key={suggestion.place_id} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    {suggestion.main_text}, {suggestion.secondary_text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </>
    </BottomSheetModal>
  );
}
