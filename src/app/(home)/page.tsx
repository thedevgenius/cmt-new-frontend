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
	return (
		<div className="p-10">
			<div className="flex gap-2">
				Home Page
				{
					isAuthenticated
						? <button onClick={() => dispatch(logout())} className="text-red-600 hover:underline hover:cursor-pointer">Logout</button>
						: <Link href="/login">Login</Link>
				}
				
				
				<AuthButton href="/profile">Profile</AuthButton>

				<LocationButton>Select Location</LocationButton>
			</div>
		</div>
	);
}
