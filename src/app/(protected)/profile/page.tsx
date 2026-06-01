"use client";

import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/useStore";
import { logout } from "@/store/features/auth/authSlice";

export default function ProfilePage() {
	const dispatch = useAppDispatch();
	return (
		<div className="p-10">
			User Profile
		</div>
	);
}
