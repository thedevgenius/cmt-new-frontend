"use client";

import React, { useState, useMemo } from "react";
import { Search, MapPin } from "lucide-react";
import BottomSheetModal from "@/components/modals/BottomSheetModal";

interface Location {
    id: string;
    name: string;
    city?: string;
}

interface LocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectLocation: (location: Location) => void;
    locations?: Location[];
}

// Default locations if none provided
const DEFAULT_LOCATIONS: Location[] = [
    { id: "1", name: "Times Square", city: "New York" },
    { id: "2", name: "Central Park", city: "New York" },
    { id: "3", name: "Golden Gate Bridge", city: "San Francisco" },
    { id: "4", name: "Statue of Liberty", city: "New York" },
    { id: "5", name: "Hollywood Sign", city: "Los Angeles" },
    { id: "6", name: "Space Needle", city: "Seattle" },
    { id: "7", name: "The Bean", city: "Chicago" },
    { id: "8", name: "Freedom Trail", city: "Boston" },
];

export default function LocationModal({
    isOpen,
    onClose,
    onSelectLocation,
    locations = DEFAULT_LOCATIONS,
}: LocationModalProps) {
    const [searchQuery, setSearchQuery] = useState("");

    // Filter locations based on search query
    const filteredLocations = useMemo(() => {
        if (!searchQuery.trim()) {
            return locations;
        }
        return locations.filter((loc) =>
            loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            loc.city?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, locations]);

    const handleSelectLocation = (location: Location) => {
        onSelectLocation(location);
        setSearchQuery("");
        onClose();
    };

    return (
        <BottomSheetModal isOpen={isOpen} onClose={onClose}>
            <div className="flex flex-col gap-4">
                {/* Header */}
                <h2 className="text-lg font-semibold text-gray-900">Select Location</h2>

                {/* Search Input */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search locations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Location List */}
                <div className="max-h-96 overflow-y-auto">
                    {filteredLocations.length > 0 ? (
                        <div className="space-y-2">
                            {filteredLocations.map((location) => (
                                <button
                                    key={location.id}
                                    onClick={() => handleSelectLocation(location)}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors flex items-start gap-3"
                                >
                                    <MapPin className="text-blue-500 shrink-0 mt-1" size={18} />
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{location.name}</p>
                                        {location.city && (
                                            <p className="text-sm text-gray-500">{location.city}</p>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No locations found</p>
                        </div>
                    )}
                </div>
            </div>
        </BottomSheetModal>
    );
}
