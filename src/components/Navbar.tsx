"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API } from "@/lib/api";

export default function Navbar() {

    const [username, setUsername] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);

    useEffect(() => {

        const token = localStorage.getItem("accessToken");

        if (!token) {
            return;
        }

        const getCurrentUser = async () => {

            try {

                const response = await fetch(
                    `${API}/me/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (response.ok) {

                    setUsername(data.username);
                    setUserId(data.id);

                    localStorage.setItem(
                        "username",
                        data.username
                    );

                } else {

                    console.log(
                        "Failed to get current user:",
                        data
                    );

                }

            } catch (error) {

                console.log(
                    "Current user error:",
                    error
                );

            }

        };

        getCurrentUser();

    }, []);

    const handleLogout = () => {

        localStorage.removeItem("accessToken");
        localStorage.removeItem("username");

        setUsername(null);
        setUserId(null);
    };

    return (
        <nav className="border-b bg-white px-8 py-4">

            <div className="mx-auto flex max-w-7xl items-center justify-between">

                <Link
                    href="/"
                    className="text-xl font-bold text-gray-900"
                >
                    VideoPlatform
                </Link>

                <div className="flex items-center gap-5">

                    {username && userId ? (
                        <>
                            <Link
                                href="/settings"
                                className="text-sm font-medium text-gray-700 hover:text-red-700"
                            >
                                Settings
                            </Link>
                            
                            <Link
                                href={`/profile/${userId}`}
                                className="text-sm font-medium text-gray-700 hover:text-red-700"
                            >
                                Hi, {username}
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="rounded-lg border border-red-700 px-5 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="rounded-lg border border-red-700 px-5 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                            >
                                Login
                            </Link>

                            <Link
                                href="/register"
                                className="rounded-lg bg-red-700 px-5 py-2 text-sm font-medium text-white hover:bg-red-800"
                            >
                                Register
                            </Link>
                        </>
                    )}

                </div>

            </div>

        </nav>
    );
}