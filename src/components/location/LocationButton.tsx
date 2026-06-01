"use client";

import React, { useState, ReactNode } from "react";
import LocationModal from "@/components/location/LocationModal";

interface Location {
    id: string;
    name: string;
    city?: string;
}

interface LocationButtonProps {
    children: ReactNode;
    onLocationSelect?: (location: Location) => void;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    className?: string;
    locations?: Location[];
    [key: string]: any;
}

export default function LocationButton({
    children,
    onLocationSelect,
    onClick,
    className = "",
    locations,
    ...rest
}: LocationButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        // Call custom onClick if provided
        if (onClick) {
            onClick(e);
        }
        // Open location modal
        setIsModalOpen(true);
    };

    const handleLocationSelect = (location: Location) => {
        // Call parent callback if provided
        if (onLocationSelect) {
            onLocationSelect(location);
        }
    };

    return (
        <>
            <button onClick={handleClick} className={className} {...rest}>
                {children}
            </button>

            <LocationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelectLocation={handleLocationSelect}
                locations={locations}
            />
        </>
    );
}
