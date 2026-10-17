"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { API } from "@/lib/api";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setMessage("");
        setSuccess(false);
        setLoading(true);

        try {
            const response = await fetch(
                `${API}/password-reset/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.error || "Unable to process your request."
                );
                return;
            }

            setSuccess(true);
            setMessage(
                data.message ||
                "If an account is associated with this email, you will receive password reset instructions."
            );

            setEmail("");
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

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Forgot Password?
                    </h1>

                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                        Enter your registered email address and we’ll
                        send you instructions to reset your password.
                    </p>

                    {message && (
                        <div
                            role="status"
                            className={`mt-6 rounded-lg p-3 text-sm ${
                                success
                                    ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
                                    : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                            }`}
                        >
                            {message}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="mt-6 space-y-5"
                    >
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Email Address
                            </label>

                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Enter your email"
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-700 focus:ring-2 focus:ring-red-100 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-red-950"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-red-700 px-5 py-3 font-medium text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>

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
