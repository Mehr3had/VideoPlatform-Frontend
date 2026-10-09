"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

import { API } from "@/lib/api";

export default function SettingsPage() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [newUsername, setNewUsername] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    const [usernameLoading, setUsernameLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    const [usernameMessage, setUsernameMessage] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");

    const [usernameError, setUsernameError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);

    const handleUsernameSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        const token = localStorage.getItem("accessToken");

        if (!token) {
            router.push("/login");
            return;
        }

        setUsernameLoading(true);
        setUsernameMessage("");

        try {
            const response = await fetch(
                `${API}/account/username/`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        username: newUsername.trim(),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setUsernameError(true);
                setUsernameMessage(
                    data.error || "Failed to update username."
                );
                return;
            }

            setUsernameError(false);
            setUsername(data.username);
            setNewUsername(data.username);

            localStorage.setItem("username", data.username);

            setUsernameMessage("Username updated successfully!");
        } catch (error) {
            console.error("Username update error:", error);
            setUsernameError(true);
            setUsernameMessage("Could not connect to the server.");
        } finally {
            setUsernameLoading(false);
        }
    };

    const handlePasswordSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        const token = localStorage.getItem("accessToken");

        if (!token) {
            router.push("/login");
            return;
        }

        if (newPassword !== passwordConfirm) {
            setPasswordError(true);
            setPasswordMessage("New passwords do not match.");
            return;
        }

        setPasswordLoading(true);
        setPasswordMessage("");

        try {
            const response = await fetch(
                `${API}/account/password/`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        current_password: currentPassword,
                        new_password: newPassword,
                        password_confirm: passwordConfirm,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setPasswordError(true);
                setPasswordMessage(
                    data.error || "Failed to update password."
                );
                return;
            }

            setPasswordError(false);
            setPasswordMessage(
                "Password updated! Please log in again."
            );

            setCurrentPassword("");
            setNewPassword("");
            setPasswordConfirm("");
        } catch (error) {
            console.error("Password update error:", error);
            setPasswordError(true);
            setPasswordMessage("Could not connect to the server.");
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-100">
            <Navbar />

            <section className="mx-auto max-w-3xl space-y-8 px-6 py-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Account Settings
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Manage your username and password.
                    </p>
                </div>

                <section className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Change Username
                    </h2>

                    <form
                        onSubmit={handleUsernameSubmit}
                        className="mt-6 space-y-5"
                    >
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                New Username
                            </label>
                            <input
                                required
                                minLength={1}
                                value={newUsername}
                                onChange={(event) =>
                                    setNewUsername(event.target.value)
                                }
                                placeholder="Enter a new username"
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-red-700"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={usernameLoading}
                            className="rounded-lg bg-red-700 px-5 py-3 font-medium text-white hover:bg-red-800 disabled:opacity-50"
                        >
                            {usernameLoading ? "Saving..." : "Update Username"}
                        </button>

                        {usernameMessage && (
                            <p
                                role="status"
                                className={`text-sm ${
                                    usernameError
                                        ? "text-red-600"
                                        : "text-green-700"
                                }`}
                            >
                                {usernameMessage}
                            </p>
                        )}
                    </form>
                </section>

                <section className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Change Password
                    </h2>

                    <form
                        onSubmit={handlePasswordSubmit}
                        className="mt-6 space-y-5"
                    >
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Current Password
                            </label>
                            <input
                                type="password"
                                required
                                autoComplete="current-password"
                                value={currentPassword}
                                onChange={(event) =>
                                    setCurrentPassword(event.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-red-700"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                New Password
                            </label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                autoComplete="new-password"
                                value={newPassword}
                                onChange={(event) =>
                                    setNewPassword(event.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-red-700"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                autoComplete="new-password"
                                value={passwordConfirm}
                                onChange={(event) =>
                                    setPasswordConfirm(event.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-red-700"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={passwordLoading}
                            className="rounded-lg bg-red-700 px-5 py-3 font-medium text-white hover:bg-red-800 disabled:opacity-50"
                        >
                            {passwordLoading ? "Saving..." : "Update Password"}
                        </button>

                        {passwordMessage && (
                            <p
                                role="status"
                                className={`text-sm ${
                                    passwordError
                                        ? "text-red-600"
                                        : "text-green-700"
                                }`}
                            >
                                {passwordMessage}
                            </p>
                        )}
                    </form>
                </section>
            </section>
        </main>
    );
}