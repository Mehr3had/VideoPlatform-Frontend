"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { API } from "@/lib/api";

export default function RegisterPage() {

    const [username, setUsername] = useState("");
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
                `${API}/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        username: username,
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
        <main className="min-h-screen bg-gray-100">

            <Navbar />

            <section className="flex justify-center px-6 py-16">

                <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">

                    <h1 className="text-3xl font-bold text-gray-900">
                        Create Account
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Join VideoPlatform today.
                    </p>

                    {error && (
                        <div className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={handleRegister}
                        className="mt-6 space-y-5"
                    >

                        <div>

                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Username
                            </label>

                            <input
                                type="text"
                                value={username}
                                onChange={(e) =>
                                    setUsername(e.target.value)
                                }
                                required
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-700"
                                placeholder="Enter username"
                            />

                        </div>

                        <div>

                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Password
                            </label>

                            <input
                                type="password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                required
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-700"
                                placeholder="Enter password"
                            />

                        </div>

                        <div>

                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Confirm Password
                            </label>

                            <input
                                type="password"
                                value={passwordConfirm}
                                onChange={(e) =>
                                    setPasswordConfirm(e.target.value)
                                }
                                required
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-700"
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

                    <p className="mt-6 text-center text-sm text-gray-500">

                        Already have an account?{" "}

                        <Link
                            href="/login"
                            className="font-medium text-red-700 hover:text-red-800"
                        >
                            Login
                        </Link>

                    </p>

                </div>

            </section>

        </main>
    );
}