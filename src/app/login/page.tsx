"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "@/store/useStore";
import { requestOtpThunk, verifyOtpThunk, resetStep, clearError } from "@/store/features/auth/authSlice";
import { phoneSchema, PhoneFormValues } from "@/lib/validations/auth.schema";
import { ArrowLeft, ShieldCheck, Pencil } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import BackButton from "@/components/ui/BackButton";
import toast from "react-hot-toast";

export default function LoginPage() {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { isAuthenticated } = useAuth();

	// Pull all application state from Redux
	const { step, isLoading, error, formattedPhone, user } = useAppSelector((state) => state.auth);

	// Local state/refs for the 4-box OTP
	const [otpValues, setOtpValues] = useState(["", "", "", ""]);
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

	useEffect(() => {
		if (isAuthenticated && !user) {
			router.push("/profile/update");
		} else if (isAuthenticated && user) {
			router.push("/");
		}
	}, [isAuthenticated, router]);

	// Step 1 Form
	const phoneForm = useForm<PhoneFormValues>({
		resolver: zodResolver(phoneSchema),
		defaultValues: { phone: "" }
	});

	// Prevent non-digit input in phone field and sanitize paste
	const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
		phoneForm.setValue("phone", digits, { shouldDirty: true, shouldValidate: true });
	};

	const handlePhonePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault();
		const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 10);
		phoneForm.setValue("phone", pasted, { shouldDirty: true, shouldValidate: true });
	};

	const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		// Allow control/navigation keys
		if (
			e.key === "Backspace" ||
			e.key === "Delete" ||
			e.key === "ArrowLeft" ||
			e.key === "ArrowRight" ||
			e.key === "Tab" ||
			(e.ctrlKey || e.metaKey)
		) {
			return;
		}

		// Prevent non-digit keys
		if (!/^[0-9]$/.test(e.key)) {
			e.preventDefault();
		}
	};

	const onPhoneSubmit = (data: PhoneFormValues) => {
		const phoneWithCode = `91${data.phone}`;
		dispatch(requestOtpThunk(phoneWithCode))
			.unwrap()
			.then(() => {
				toast.success("OTP sent successfully");
			})
			.catch((err) => {
				const message = typeof err === "string" ? err : (err as any)?.message || "Failed to send OTP";
				toast.error(message);
			});
	};

	// Step 2 OTP Handlers
	const lastSubmittedOtp = useRef("");

	const verifyOtpValue = (fullOtp: string) => {
		if (fullOtp.length < 4) return;
		if (!formattedPhone) return;
		// prevent duplicate submissions for same otp
		if (lastSubmittedOtp.current === fullOtp) return;
		lastSubmittedOtp.current = fullOtp;

		dispatch(verifyOtpThunk({ phone: formattedPhone, otp: fullOtp }))
			.unwrap()
			.then(() => {
				toast.success("Logged in successfully");
			})
			.catch((err) => {
				const message = typeof err === "string" ? err : (err as any)?.message || "OTP verification failed";
				toast.error(message);
			});
	};

	useEffect(() => {
		const fullOtp = otpValues.join("");
		if (fullOtp.length === 4 && !isLoading) {
			verifyOtpValue(fullOtp);
		}
	}, [otpValues, isLoading, formattedPhone]);

	const handleOtpChange = (index: number, value: string) => {
		// Only allow numeric input
		if (!/^[0-9]*$/.test(value)) return;

		dispatch(clearError());
		const newOtp = [...otpValues];
		newOtp[index] = value;
		setOtpValues(newOtp);

		// Auto-focus next input
		if (value && index < 3) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
		// Auto-focus previous input on backspace if current is empty
		if (e.key === "Backspace" && !otpValues[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault();
		dispatch(clearError());

		const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 4);
		if (!pastedData) return;

		const newOtp = [...otpValues];
		for (let i = 0; i < pastedData.length; i++) {
			newOtp[i] = pastedData[i];
		}
		setOtpValues(newOtp);

		// Focus the next empty box or the last box
		const focusIndex = Math.min(pastedData.length, 3);
		inputRefs.current[focusIndex]?.focus();
	};

	const onOtpSubmit = (e: React.BaseSyntheticEvent) => {
		e.preventDefault();
		const fullOtp = otpValues.join("");

		if (fullOtp.length < 4) {
			return;
		}

		verifyOtpValue(fullOtp);
	};

	if (isAuthenticated) {
		return null;
	}

	return (
		<div className="md:bg-surface md:flex md:items-center md:min-h-dvh">
			{step === "phone" && (
				<div className="SendOtp min-h-dvh max-w-2xl md:w-xl mx-auto relative px-3 flex items-center justify-center md:shadow md:px-6 md:bg-white md:rounded-xl md:min-h-[80dvh]">
					<div className="w-full">
						<header className="absolute top-3 left-3">
							<BackButton>Back</BackButton>
						</header>

						<div className="flex-1 flex flex-col items-center justify-center px-6 pb-6">
							<div className="w-28 h-28 bg-primary-50 rounded-full flex items-center justify-center mb-8 relative">
								<ShieldCheck size={60} className="text-primary-500" strokeWidth={1.5} />
							</div>
							<h1 className="text-3xl font-extrabold text-text tracking-tight mb-2">Comynity</h1>
							<p className="text-[15px] text-text-400 text-center">
								Discover and connect with communities near you.
							</p>
						</div>

						<div className="space-y-4">
							<form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
								<div>
									<div className="flex items-center bg-slate-100 border border-slate-200 rounded-full h-14 px-2 mb-2 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-50 transition-all">
										<button className="flex items-center gap-2 px-3 border-r border-slate-200 h-8 shrink-0 active:opacity-70">
											<span className="text-lg leading-none select-none">🇮🇳</span>
											<span className="text-[15px] font-semibold text-text">+91</span>
										</button>
										<input
											type="tel"
											{...phoneForm.register("phone")}
											onChange={handlePhoneChange}
											onPaste={handlePhonePaste}
											onKeyDown={handlePhoneKeyDown}
											placeholder="Enter Your Phone number"
											className="flex-1 h-full bg-transparent border-none outline-none px-3 text-[15px] font-medium text-text placeholder-text-300"
											autoComplete="tel"
											maxLength={10}
										/>
									</div>
									{/* {phoneForm.formState.errors.phone && (
										<p className="mt-1 text-sm text-red-600">
											{phoneForm.formState.errors.phone.message}
										</p>
									)} */}
								</div>
								<button
									type="submit"
									disabled={isLoading || !phoneForm.formState.isValid}
									className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isLoading ? "Sending..." : "Send OTP"}
								</button>
							</form>
						</div>

						<p className="text-center text-[11px] text-text-400 px-4 leading-relaxed mt-5">
							By continuing, you agree to Comynity's{" "}
							<button className="font-bold text-text hover:underline">Terms of Service</button> and{" "}
							<button className="font-bold text-text hover:underline">Privacy Policy</button>.
						</p>
					</div>
				</div>
			)}

			{step === "otp" && (
				<div className="VerifyOTP min-h-dvh max-w-3xl mx-auto relative px-3 pt-4">
					<div className="w-full">
						<header className="flex items-center shrink-0 mb-5 gap-3">
							<button
								onClick={() => router.back()}
								className="w-10 h-10 flex items-center justify-center border border-slate-200/80 rounded-full text-text hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
							>
								<ArrowLeft size={20} strokeWidth={2.5} />
							</button>
							<h2>Verify OTP</h2>
						</header>

						<form onSubmit={onOtpSubmit} className="space-y-6">
							<div className="text-sm text-gray-600 text-center">
								OTP sent to  <br />
								+{formattedPhone}
								<button
									type="button"
									onClick={() => {
										dispatch(resetStep());
										setOtpValues(["", "", "", ""]);
									}}
									className="ml-2 text-blue-600 hover:underline"
								>
									(Change)
								</button>
							</div>

							<div className="flex justify-center gap-3">
								{otpValues.map((value, index) => (
									<input
										key={index}
										ref={(el) => { inputRefs.current[index] = el; }}
										type="text"
										inputMode="numeric"
										maxLength={1}
										value={value}
										onChange={(e) => handleOtpChange(index, e.target.value)}
										onKeyDown={(e) => handleKeyDown(index, e)}
										onPaste={handlePaste}
										className="w-16 h-16 text-center text-2xl font-bold text-text bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:border-primary-500 focus:bg-primary-50/30 focus:shadow-[0_0_0_4px_rgba(45,166,96,0.1)] transition-all"
									/>
								))}
							</div>

							<p className="text-center text-red-600 mb-5">{error}</p>

							<button
								type="submit"
								disabled={isLoading || otpValues.join("").length < 4}
								className="btn btn-primary w-full disabled:opacity-50 transition-colors"
							>
								{isLoading ? "Verifying..." : "Verify & Login"}
							</button>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}