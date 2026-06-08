"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, LocateFixed, ChevronRight, MapPin, Clock } from "lucide-react";
import BottomSheetModal from "@/components/modals/BottomSheetModal";
import { fetchSuggestions, fetchLocationByCoords, fetchLocationByPlaceId, clearSuggestions, addRecentSearch } from "@/store/features/location/locationSlice";
import { useDebounce } from "@/hooks/useDebounce";
import { useAppDispatch, useAppSelector } from "@/store/useStore";
import { Suggestion } from "@/types/location";

interface LocationModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function LocationModal({ isOpen, onClose }: LocationModalProps) {
	const dispatch = useAppDispatch();
	const { suggestions, isLoadingSuggestions, recentSearches } = useAppSelector((state) => state.location);
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

	const handleGetCurrentLocation = () => {
		if (!navigator.geolocation) {
			alert('Geolocation is not supported by your browser');
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				dispatch(fetchLocationByCoords({
					lat: position.coords.latitude,
					lng: position.coords.longitude
				}));
				onClose(); // Close modal on success
			},
			(geoError) => {
				console.error('Error getting location:', geoError);
				alert('Please allow location access in your browser settings.');
			}
		);
	};

	const handleSelectSuggestion = (suggestion: Suggestion) => {
		dispatch(fetchLocationByPlaceId(suggestion));
		dispatch(addRecentSearch(suggestion));
		handleClose();
	};

	return (
		<BottomSheetModal isOpen={isOpen} onClose={handleClose} bg="bg-surface">
			<>
				<div className="p-3">
					<h2 className="text-lg font-semibold">Select your location</h2>
					<input
						type="text"
						placeholder="Search for a location"
						className="w-full mt-2 px-4 py-4 bg-white rounded-lg shadow-sm outline-none font-medium"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
					{searchTerm.length === 0 && (
						<button onClick={handleGetCurrentLocation} className="flex gap-2 items-center text-primary-400 font-medium bg-white w-full py-4 px-3 rounded-xl mt-3 relative">
							<LocateFixed /> Select current location  <ChevronRight className=" absolute right-2 text-gray-400" />
						</button>
					)}
					
					{suggestions.length > 0 ? (
						<div className="space-y-2 mt-2">
							{suggestions.map((suggestion) => (
								<button
									key={suggestion.place_id}
									onClick={() => handleSelectSuggestion(suggestion)}
									className="w-full flex items-center gap-2 bg-white p-4 rounded-xl border border-gray-100 text-left hover:bg-gray-50 active:scale-[0.98] transition-all"
								>
									<div className="bg-[#f4f6f8] p-2.5 rounded-lg shrink-0">
										<MapPin className="w-5 h-5 text-primary-300" />
									</div>
									<div className="flex-1 min-w-0">
										<h4 className="font-semibold text-gray-800 text-[15px]">
											{suggestion.main_text}
										</h4>
										<p className="text-[13px] text-gray-500">
											{suggestion.secondary_text}
										</p>
									</div>
								</button>
							))}
							{!isLoadingSuggestions && suggestions.length === 0 && (
								<div className="py-8 text-center">
									<p className="text-sm text-gray-500">No locations found for "{searchTerm}"</p>
								</div>
							)}
						</div>
					) : (
						/* Recent Searches */
						recentSearches.length > 0 && (
							<div className=" mt-5">
								<p className="muted-title">Recent Searches</p>
								<div className="space-y-2">
									{recentSearches.map((search) => (
										<button
											key={search.place_id}
											onClick={() => handleSelectSuggestion(search)}
											className="w-full flex items-center gap-2 bg-white p-4 rounded-xl border border-gray-100 text-left hover:bg-gray-50 active:scale-[0.98] transition-all"
										>
											<div className="bg-[#f4f6f8] p-2.5 rounded-lg shrink-0">
												<MapPin className="w-5 h-5 text-primary-300" />
											</div>
											<div className="flex-1 min-w-0">
												<h4 className="font-semibold text-gray-800 text-[15px]">
													{search.main_text}
												</h4>
												<p className="text-[13px] text-gray-500">
													{search.secondary_text}
												</p>
											</div>
										</button>
									))}
								</div>
							</div>
						)
					)}
				</div>
			</>
		</BottomSheetModal>
	);
}
