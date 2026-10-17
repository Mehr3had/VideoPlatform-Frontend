"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { API } from "@/lib/api";

function ResetPasswordForm() {
    const searchParams = useSearchParams();

    const uid = searchParams.get("uid") ?? "";
    const token = searchParams.get("token") ?? "";

    const [newPassword, setNewPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setMessage("");
        setSuccess(false);

        if (!uid || !token) {
            setMessage("Invalid password reset link.");
            return;
        }

        if (newPassword.length < 8) {
            setMessage("Password must be at least 8 characters.");
            return;
        }

        if (newPassword !== passwordConfirm) {
            setMessage("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API}/password-reset/confirm/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        uid,
                        token,
                        new_password: newPassword,
                        password_confirm: passwordConfirm,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.error || "Unable to reset password.");
                return;
            }

            setSuccess(true);
            setMessage("Your password has been reset successfully!");

            setNewPassword("");
            setPasswordConfirm("");
        } catch {
            setMessage(
                "Could not connect to the server. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-100 dark:bg-[#0f0f0f]">
            <Navbar />

            <section className="flex justify-center px-6 py-16">
                <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm dark:bg-[#181818]">

                    <div className="mb-6">
                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-red-50 text-2xl dark:bg-red-950">
                            🔒
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            Reset Password
                        </h1>

                        <p className="mt-2 text-gray-500 dark:text-gray-400">
                            Choose a new password for your account.
                        </p>
                    </div>

                    {message && (
                        <div
                            role="status"
                            className={`mb-5 rounded-lg p-3 text-sm ${
                                success
                                    ? "bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
                                    : "bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                            }`}
                        >
                            {message}
                        </div>
                    )}

                    {!success && (
                        <form
                            onSubmit={handleResetPassword}
                            className="space-y-5"
                        >
                            <div>
                                <label
                                    htmlFor="new-password"
                                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    New Password
                                </label>

                                <input
                                    id="new-password"
                                    type="password"
                                    autoComplete="new-password"
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(e.target.value)
                                    }
                                    required
                                    minLength={8}
                                    placeholder="Enter new password"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-red-700 focus:ring-2 focus:ring-red-100 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-red-950"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password-confirm"
                                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Confirm Password
                                </label>

                                <input
                                    id="password-confirm"
                                    type="password"
                                    autoComplete="new-password"
                                    value={passwordConfirm}
                                    onChange={(e) =>
                                        setPasswordConfirm(e.target.value)
                                    }
                                    required
                                    minLength={8}
                                    placeholder="Confirm new password"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-red-700 focus:ring-2 focus:ring-red-100 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-red-950"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-lg bg-red-700 px-5 py-3 font-medium text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading
                                    ? "Resetting password..."
                                    : "Reset Password"}
                            </button>
                        </form>
                    )}

                    <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Remember your password?{" "}

                        <Link
                            href="/login"
                            className="font-medium text-red-700 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                            Login
                        </Link>
                    </p>

                </div>
            </section>
        </main>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <main className="min-h-screen bg-gray-100">
                    <Navbar />
                    <div className="flex justify-center px-6 py-16">
                        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
                            <p className="text-gray-500">
                                Loading password reset page...
                            </p>
                        </div>
                    </div>
                </main>
            }
        >
            <ResetPasswordForm />
        </Suspense>
    );
}
