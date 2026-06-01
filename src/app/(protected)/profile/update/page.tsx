"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiClient } from "@/lib/axios";
import { useRouter } from "next/navigation";

const profileSchema = z.object({
	full_name: z.string().min(1, "Full name is required"),
	email: z.email("Invalid email").optional().or(z.literal("")),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function UpdateProfilePage() {
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState<string | null>(null);
	const router = useRouter();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<ProfileForm>({
		resolver: zodResolver(profileSchema),
		defaultValues: { full_name: "", email: "" },
	});

	useEffect(() => {
		let mounted = true;
		async function loadProfile() {
			try {
				const res = await apiClient.get("/api/users/me/");
				if (mounted && res?.data?.success && res.data.data) {
					reset({
						full_name: res.data.data.full_name || "",
						email: res.data.data.email || "",
					});
				}
			} catch (err) {
				// ignore — leave defaults
			} finally {
				if (mounted) setLoading(false);
			}
		}
		loadProfile();
		return () => {
			mounted = false;
		};
	}, [reset]);

	async function onSubmit(values: ProfileForm) {
		setMessage(null);
		try {
			const res = await apiClient.patch("/api/profile/update/", values);
			if (res?.data?.success) {
				setMessage("Profile updated successfully.");
				router.push("/profile");
			} else {
				setMessage("Failed to update profile.");
			}
		} catch (err: any) {
			setMessage(err?.response?.data?.detail || "An error occurred");
		}
	}

	return (
		<div className="p-6 max-w-lg">
			<h1 className="text-xl font-semibold mb-4">Update Profile</h1>

			{loading ? (
				<div>Loading...</div>
			) : (
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div>
						<label className="block text-sm font-medium">Full name</label>
						<input
							{...register("full_name")}
							className="mt-1 block w-full rounded border px-3 py-2"
							placeholder="Your full name"
						/>
						{errors.full_name && (
							<p className="text-sm text-red-600">{errors.full_name.message}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium">Email</label>
						<input
							{...register("email")}
							className="mt-1 block w-full rounded border px-3 py-2"
							placeholder="you@example.com"
						/>
						{errors.email && (
							<p className="text-sm text-red-600">{errors.email.message}</p>
						)}
					</div>

					<div>
						<button
							type="submit"
							disabled={isSubmitting}
							className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded"
						>
							{isSubmitting ? "Saving..." : "Save"}
						</button>
					</div>

					{message && <p className="text-sm mt-2">{message}</p>}
				</form>
			)}
		</div>
	);
}
