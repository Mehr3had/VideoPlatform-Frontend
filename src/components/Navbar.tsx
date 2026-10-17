"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { API } from "@/lib/api";

export default function Navbar() {
    const [username, setUsername] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [darkMode, setDarkMode] = useState(false);

    const pathname = usePathname();

    useEffect(() => {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            setUsername(null);
            setUserId(null);
            setIsAdmin(false);
            setUnreadCount(0);
            return;
        }

        const getCurrentUser = async () => {
            try {
                const response = await fetch(`${API}/me/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) return;

                const data = await response.json();

                setUsername(data.username);
                setUserId(data.id);
                setIsAdmin(data.is_admin === true);

                localStorage.setItem("username", data.username);
            } catch (error) {
                console.error("Current user error:", error);
            }
        };

        getCurrentUser();
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            setUnreadCount(0);
            return;
        }

        const getUnreadCount = async () => {
            try {
                const response = await fetch(
                    `${API}/notifications/unread-count/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) return;

                const data = await response.json();

                setUnreadCount(
                    data.unread_count ?? data.count ?? 0
                );
            } catch (error) {
                console.error("Unread notifications error:", error);
            }
        };

        getUnreadCount();
    }, [pathname]);

    useEffect(() => {
        const handleNotificationsUpdated = (event: Event) => {
            const customEvent = event as CustomEvent<number>;
            setUnreadCount(customEvent.detail);
        };

        window.addEventListener(
            "notifications-updated",
            handleNotificationsUpdated
        );

        return () => {
            window.removeEventListener(
                "notifications-updated",
                handleNotificationsUpdated
            );
        };
    }, []);

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        const isDark = savedTheme === "dark";

        setDarkMode(isDark);
        document.documentElement.classList.toggle("dark", isDark);
    }, []);

    const toggleTheme = () => {
        const nextDarkMode = !darkMode;

        setDarkMode(nextDarkMode);
        localStorage.setItem("theme", nextDarkMode ? "dark" : "light");
        document.documentElement.classList.toggle("dark", nextDarkMode);
    };

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("username");

        setUsername(null);
        setUserId(null);
        setIsAdmin(false);
        setUnreadCount(0);
    };

    return (
        <nav className="border-b border-gray-200 bg-white dark:border-[#303030] dark:bg-[#181818] px-8 py-4">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
                <Link
                    href="/"
                    className="text-xl font-bold text-gray-900 dark:text-gray-100"
                >
                    VideoPlatform
                </Link>

                <div className="flex items-center gap-5">

                    {username && userId && isAdmin && (
                        <Link
                            href="/admin"
                            className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
                        >
                            Admin Panel
                        </Link>
                    )}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        aria-label={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        className="rounded-lg p-2 text-2xl transition hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <span aria-hidden="true">
                            {darkMode ? "☀️" : "🌙"}
                        </span>
                    </button>
                    {username && userId ? (
                        <>
                            <Link
                                href="/notifications"
                                title="Notifications"
                                aria-label={`Notifications${
                                    unreadCount > 0
                                        ? `, ${unreadCount} unread`
                                        : ""
                                }`}
                                className="relative rounded-lg p-2 text-2xl transition hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <span aria-hidden="true">🔔</span>

                                {unreadCount > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                                        {unreadCount > 99
                                            ? "99+"
                                            : unreadCount}
                                    </span>
                                )}
                            </Link>

                            <Link
                                href="/settings"
                                title="Settings"
                                aria-label="Settings"
                                className="rounded-lg p-2 text-2xl text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 hover:text-red-700"
                            >
                                <span aria-hidden="true">⚙️</span>
                            </Link>

                            <Link
                                href={`/profile/${userId}`}
                                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-700"
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
