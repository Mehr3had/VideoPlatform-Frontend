"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { API } from "@/lib/api";

export default function RegisterPage() {

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleRegister = async (e: any) => {

        e.preventDefault();

        setError("");

        if (password !== passwordConfirm) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {

            const response = await fetch(
                `${API}/register/`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        username: username,
                        email: email,
                        password: password,
                        password_confirm: passwordConfirm,
                    }),
                }
            );

            const data = await response.json();

            if (response.ok) {

                alert("Registration successful!");

                router.push("/login");

            } else {

                setError(
                    data.error || "Registration failed."
                );

            }

        } catch (error) {

            console.log(
                "Registration error:",
                error
            );

            setError(
                "Something went wrong. Please try again."
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
                        Create Account
                    </h1>

                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                        Join VideoPlatform today.
                    </p>

                    {error && (
                        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={handleRegister}
                        className="mt-6 space-y-5"
                    >

                        <div>

                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Username
                            </label>

                            <input
                                type="text"
                                value={username}
                                onChange={(e) =>
                                    setUsername(e.target.value)
                                }
                                required
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-red-700 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100 dark:placeholder:text-gray-500"
                                placeholder="Enter username"
                            />

                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                required
                                autoComplete="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="Enter your email address"
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-red-700 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100 dark:placeholder:text-gray-500"
                            />
                        </div>

                        <div>

                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Password
                            </label>

                            <input
                                type="password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                required
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-red-700 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100 dark:placeholder:text-gray-500"
                                placeholder="Enter password"
                            />

                        </div>

                        <div>

                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Confirm Password
                            </label>

                            <input
                                type="password"
                                value={passwordConfirm}
                                onChange={(e) =>
                                    setPasswordConfirm(e.target.value)
                                }
                                required
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-red-700 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100 dark:placeholder:text-gray-500"
                                placeholder="Confirm password"
                            />

                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-red-700 px-5 py-3 font-medium text-white hover:bg-red-800 disabled:opacity-50"
                        >
                            {loading
                                ? "Creating account..."
                                : "Create Account"}
                        </button>

                    </form>

                    <div className="mt-2 text-center">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-base font-medium text-white transition hover:bg-blue-700"
                        >
                            ← Back to Home
                        </Link>
                    </div>

                    <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">

                        Already have an account?{" "}

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