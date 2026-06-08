"use client";

import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/useStore";
import { logout } from "@/store/features/auth/authSlice";
import { useAuth } from "@/hooks/useAuth";
import { AuthButton } from "@/components/shared/AuthButton";
import LocationButton from "@/components/location/LocationButton";

export default function Home() {
	const dispatch = useAppDispatch();
	const { isAuthenticated } = useAuth();
	const { currentLocation } = useAppSelector((state) => state.location);
    const locationLabel = `${currentLocation?.landmark || "Select Location"}${currentLocation?.city?.name ? `, ${currentLocation.city.name}` : ""}`;
    const landmarkSlug = currentLocation?.landmark
        ? currentLocation.landmark
              .trim()
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, "")
        : currentLocation?.city?.slug || "unknown-city";
	return (
		<div className="p-10">
			<div className="flex gap-2 flex-wrap items-center">
				Home Page
				{
					isAuthenticated
						? <button onClick={() => dispatch(logout())} className="text-red-600 hover:underline hover:cursor-pointer">Logout</button>
						: <Link href="/login">Login</Link>
				}
			
				<AuthButton href="/profile">Profile</AuthButton>

				<LocationButton className="bg-gray-200 p-2">{locationLabel}</LocationButton>
                <Link href="/search">Search</Link>
                
                <Link href={`${currentLocation?.city?.slug || "kolkata"}/${landmarkSlug}/hotels`}>Test Category link</Link>
			</div>
		</div>
	);
}
