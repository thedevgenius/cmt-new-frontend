"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import BackButton from "@/components/ui/BackButton";
import { useAppDispatch, useAppSelector } from "@/store/useStore";
import { logout } from "@/store/features/auth/authSlice";
import {
	ArrowLeft, ChevronRight, BellOff, Sliders, Moon,
	Globe, Users, HelpCircle, Info, Shield, LogOut, Pencil
} from 'lucide-react';

export default function ProfileSettings() {
	// State for toggles (optional, just to show interactivity)
	const [pauseNotifications, setPauseNotifications] = useState(true);
	const [darkMode, setDarkMode] = useState(false);

	return (
		<div className="min-h-dvh bg-surface text-black pb-10 flex justify-center">
			<div className="w-full max-w-2xl flex flex-col">

				{/* Header */}
				<header className="flex items-center px-3 py-3">
					<BackButton className="flex items-center justify-center size-11 rounded-full bg-white text-gray-700 active:bg-gray-300 transition" />
					<h1 className="flex-1 text-center text-lg font-medium pr-10">My Profile</h1>
				</header>

				{/* Profile Section */}
				<section className="bg-white rounded-2xl mx-4 my-1 overflow-hidden">
					<button className="w-full flex items-center p-4 active:bg-gray-50 transition-colors text-left">
						<img
							src="https://i.pravatar.cc/150?img=11"
							alt="Profile"
							className="w-16 h-16 rounded-full object-cover bg-gray-200 mr-4"
						/>
						<div className="flex-1">
							<h2 className="text-[20px] font-semibold text-black leading-tight">Your Name</h2>
							<p className="text-[15px] text-gray-500 mt-0.5">@yourname</p>
						</div>
						<Pencil size={18} className="text-gray-400 text-primary-600 underline" />
					</button>
				</section>

				{/* Notification & General */}
				<section className="bg-white rounded-2xl mx-4 my-1 overflow-hidden flex flex-col">
					<ListItem
						icon={BellOff}
						label="Pause notifications"
						rightElement={
							<Toggle checked={pauseNotifications} onChange={() => setPauseNotifications(!pauseNotifications)} />
						}
					/>
					<ListItem
						icon={Sliders}
						label="General settings"
						isLast
					/>
				</section>

				{/* Appearance & Contacts */}
				<section className="bg-white rounded-2xl mx-4 my-1 overflow-hidden flex flex-col">
					<ListItem
						icon={Moon}
						label="Dark mode"
						rightElement={
							<Toggle checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
						}
					/>
					<ListItem
						icon={Globe}
						label="Language"
					/>
					<ListItem
						icon={Users}
						label="My Contacts"
						isLast
					/>
				</section>

				{/* Info & Legal */}
				<section className="bg-white rounded-2xl mx-4 my-1 overflow-hidden flex flex-col">
					<ListItem
						icon={HelpCircle}
						label="FAQ"
					/>
					<ListItem
						icon={Info}
						label="Terms of service"
					/>
					<ListItem
						icon={Shield}
						label="User policy"
						isLast
					/>
				</section>

				{/* Logout Button */}
				<button className="mx-4 mt-6 mb-4 flex items-center justify-center p-4 bg-white rounded-full text-[#ff3b30] font-semibold shadow-sm active:bg-gray-50 transition-colors">
					<LogOut size={20} strokeWidth={2.5} className="mr-2" />
					Log Out
				</button>

			</div>
		</div>
	);
}


function ListItem({
	icon: Icon,
	label,
	rightElement,
	isLast = false
}: {
	icon: React.ElementType,
	label: string,
	rightElement?: React.ReactNode,
	isLast?: boolean
}) {
	return (
		<div className="flex items-center pl-4 active:bg-gray-50 cursor-pointer transition-colors group">
			{/* Icon Area */}
			<div className="mr-4 text-[#3a3a3c]">
				<Icon size={20} strokeWidth={1.5} />
			</div>

			{/* Content Area with bottom border matching iOS inset */}
			<div className={`flex-1 flex items-center justify-between py-3.5 pr-4 ${!isLast ? 'border-b border-gray-200' : ''}`}>
				<span className="text-sm font-medium text-black">{label}</span>

				{/* Render either a custom element (like a toggle) or the default chevron */}
				{rightElement ? rightElement : <ChevronRight size={20} className="text-gray-400" />}
			</div>
		</div>
	);
}

/**
 * Pure Tailwind CSS Toggle Switch
 */
function Toggle({ checked, onChange }: { checked: boolean, onChange: () => void }) {
	return (
		<label className="relative inline-flex items-center cursor-pointer">
			<input
				type="checkbox"
				className="sr-only peer"
				checked={checked}
				onChange={onChange}
			/>
			<div className="w-[51px] h-[31px] bg-[#e9e9ea] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[20px] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:shadow-[0_2px_4px_rgba(0,0,0,0.2)] after:rounded-full after:h-[27px] after:w-[27px] after:transition-all peer-checked:bg-[#34c759]"></div>
		</label>
	);
}