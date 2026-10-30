"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useNavbarNotifications } from "@/hooks/useNavbarNotifications";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage, type Language } from "@/context/LanguageContext";

const translations = {
    fa: {
        openMenu: "باز کردن منو",
        viewProfile: "مشاهده پروفایل",
        adminPanel: "پنل مدیریت",
        notifications: "اعلان‌ها",
        settings: "تنظیمات",
        lightMode: "تغییر به حالت روشن",
        darkMode: "تغییر به حالت تاریک",
        logout: "خروج از حساب",
        login: "ورود",
        register: "ثبت‌نام",
        language: "زبان برنامه",
        persian: "فارسی",
        english: "English",
    },
    en: {
        openMenu: "Open menu",
        viewProfile: "View profile",
        adminPanel: "Admin Panel",
        notifications: "Notifications",
        settings: "Settings",
        lightMode: "Switch to Light Mode",
        darkMode: "Switch to Dark Mode",
        logout: "Logout",
        login: "Login",
        register: "Register",
        language: "App language",
        persian: "فارسی",
        english: "English",
    },
};

export default function Navbar() {
    const { username, userId, isAdmin, profileImage, logout } = useAuth();
    const { unreadCount, setUnreadCount } = useNavbarNotifications();
    const { darkMode, toggleTheme } = useTheme();
    const { language, setLanguage, isPersian } = useLanguage();
    const t = translations[language];
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setMenuOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    const handleLogout = () => {
        logout();
        setUnreadCount(0);
        setMenuOpen(false);
    };

    const handleLanguageChange = (nextLanguage: Language) => {
        setLanguage(nextLanguage);
        setMenuOpen(false);
    };

    const menuItemClass =
        "flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#303030]";

    return (
        <nav className="relative z-50 border-b border-gray-200 bg-white px-4 py-3 dark:border-[#303030] dark:bg-[#181818] sm:px-8">
            <div className="flex w-full items-center justify-between">
                <Link
                    href="/"
                    className="text-xl font-bold text-gray-900 dark:text-gray-100"
                >
                    VideoPlatform
                </Link>

                <div className="relative" ref={menuRef}>
                    {username && userId ? (
                        <>
                            <button
                                type="button"
                                onClick={() => setMenuOpen((previous) => !previous)}
                                aria-label={t.openMenu}
                                aria-expanded={menuOpen}
                                aria-haspopup="true"
                                className="flex h-10 w-10 items-center justify-center rounded-full text-2xl text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#303030]"
                            >
                                ⋮
                            </button>

                            {menuOpen && (
                                <div
                                    role="menu"
                                    className={`absolute top-full mt-2 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white py-2 shadow-xl dark:border-[#303030] dark:bg-[#202020] ${
                                        isPersian ? "left-0" : "right-0"
                                    }`}
                                >
                                    <Link
                                        href={`/profile/${userId}`}
                                        role="menuitem"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-3 border-b border-gray-200 px-4 py-3 hover:bg-gray-100 dark:border-[#303030] dark:hover:bg-[#303030]"
                                    >
                                        {profileImage ? (
                                            <img
                                                src={profileImage}
                                                alt=""
                                                className="h-11 w-11 shrink-0 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-200 text-lg font-bold text-gray-700 dark:bg-[#404040] dark:text-gray-100">
                                                {username.charAt(0).toUpperCase()}
                                            </div>
                                        )}

                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-gray-900 dark:text-gray-100">
                                                {username}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {t.viewProfile}
                                            </p>
                                        </div>
                                    </Link>

                                    {isAdmin && (
                                        <Link
                                            href="/admin"
                                            role="menuitem"
                                            onClick={() => setMenuOpen(false)}
                                            className={menuItemClass}
                                        >
                                            <span aria-hidden="true">🛡️</span>
                                            {t.adminPanel}
                                        </Link>
                                    )}

                                    <Link
                                        href="/notifications"
                                        role="menuitem"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center justify-between px-4 py-3 text-sm text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#303030]"
                                    >
                                        <span className="flex items-center gap-3">
                                            <span aria-hidden="true">🔔</span>
                                            {t.notifications}
                                        </span>

                                        {unreadCount > 0 && (
                                            <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                                                {unreadCount > 99 ? "99+" : unreadCount}
                                            </span>
                                        )}
                                    </Link>

                                    <Link
                                        href="/settings"
                                        role="menuitem"
                                        onClick={() => setMenuOpen(false)}
                                        className={menuItemClass}
                                    >
                                        <span aria-hidden="true">⚙️</span>
                                        {t.settings}
                                    </Link>

                                    <button
                                        type="button"
                                        role="menuitem"
                                        onClick={() => {
                                            toggleTheme();
                                            setMenuOpen(false);
                                        }}
                                        className={menuItemClass}
                                    >
                                        <span aria-hidden="true">
                                            {darkMode ? "☀️" : "🌙"}
                                        </span>
                                        {darkMode ? t.lightMode : t.darkMode}
                                    </button>

                                    <div className="my-2 border-t border-gray-200 dark:border-[#303030]" />

                                    <div className="px-4 py-3">
                                        <p className="mb-3 text-sm font-medium text-gray-800 dark:text-gray-200">
                                            🌐 {t.language}
                                        </p>

                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleLanguageChange("fa")}
                                                aria-pressed={language === "fa"}
                                                className={`rounded-lg border px-2 py-2 text-sm transition ${
                                                    language === "fa"
                                                        ? "border-[var(--accent)] bg-[var(--accent)]/10 font-semibold text-[var(--accent)]"
                                                        : "border-gray-200 text-gray-700 hover:bg-gray-100 dark:border-[#404040] dark:text-gray-200 dark:hover:bg-[#303030]"
                                                }`}
                                            >
                                                🇮🇷 {t.persian}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleLanguageChange("en")}
                                                aria-pressed={language === "en"}
                                                className={`rounded-lg border px-2 py-2 text-sm transition ${
                                                    language === "en"
                                                        ? "border-[var(--accent)] bg-[var(--accent)]/10 font-semibold text-[var(--accent)]"
                                                        : "border-gray-200 text-gray-700 hover:bg-gray-100 dark:border-[#404040] dark:text-gray-200 dark:hover:bg-[#303030]"
                                                }`}
                                            >
                                                🇬🇧 {t.english}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="my-2 border-t border-gray-200 dark:border-[#303030]" />

                                    <button
                                        type="button"
                                        role="menuitem"
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                    >
                                        <span aria-hidden="true">↪</span>
                                        {t.logout}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div
                            className={`flex items-center gap-2 ${
                                isPersian ? "flex-row" : "flex-row-reverse"
                            }`}
                        >
                            <Link
                                href="/login"
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-100 dark:border-[#404040] dark:text-gray-200 dark:hover:bg-[#303030]"
                            >
                                {t.login}
                            </Link>

                            <Link
                                href="/register"
                                className="accent-button rounded-lg px-4 py-2 text-sm font-medium transition"
                            >
                                {t.register}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}