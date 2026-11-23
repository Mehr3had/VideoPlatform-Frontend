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
        lightMode: "\u062D\u0627\u0644\u062A \u0631\u0648\u0632",
        darkMode: "\u062D\u0627\u0644\u062A \u0634\u0628",
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
        lightMode: "Day mode",
        darkMode: "Night mode",
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

    const handleLogout = async () => {
        await logout();
        setUnreadCount(0);
        setMenuOpen(false);
    };

    const handleLanguageChange = (nextLanguage: Language) => {
        setLanguage(nextLanguage);
        setMenuOpen(false);
    };

    const menuItemClass =
        "flex min-h-[42px] w-full min-w-0 items-center gap-1.5 rounded-lg border border-gray-200 px-2 py-2 text-[11px] leading-tight text-gray-800 transition-all duration-150 hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] active:border-[var(--accent)] active:bg-[var(--accent)]/20 active:text-[var(--accent)] focus-visible:border-[var(--accent)] focus-visible:bg-[var(--accent)]/10 focus-visible:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/25 dark:border-[#404040] dark:text-gray-200 dark:hover:border-[var(--accent)] dark:hover:text-[var(--accent)] dark:active:border-[var(--accent)] dark:active:text-[var(--accent)] md:min-h-0 md:gap-3 md:rounded-lg md:border md:border-transparent md:px-4 md:py-3 md:text-sm md:hover:border-[var(--accent)] md:hover:bg-[var(--accent)]/10 md:hover:text-[var(--accent)] md:active:border-[var(--accent)] md:active:bg-[var(--accent)]/20 md:active:text-[var(--accent)] dark:md:hover:border-[var(--accent)] dark:md:active:border-[var(--accent)] navbar-accent-action";

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
                                className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-full text-2xl text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#303030]"
                            >
                                ⋮
                            </button>

                            {menuOpen && (
                                <div
                                    role="menu"
                                    className={`absolute top-full mt-2 grid w-64 grid-cols-2 gap-1 overflow-hidden rounded-xl border border-gray-200 bg-white p-2 shadow-xl md:block md:w-64 md:gap-0 md:p-2 md:py-2 dark:border-[#303030] dark:bg-[#202020] ${
                                        isPersian ? "left-0" : "right-0"
                                    }`}
                                >
                                    <Link
                                        href={`/profile/${userId}`}
                                        role="menuitem"
                                        onClick={() => setMenuOpen(false)}
                                        className="col-span-2 flex items-center gap-2.5 border-b border-gray-200 px-3 py-2.5 hover:bg-gray-100 md:gap-3 md:px-4 md:py-3 dark:border-[#303030] dark:hover:bg-[#303030]"
                                    >
                                        {profileImage ? (
                                            <img
                                                src={profileImage}
                                                alt=""
                                                className="h-9 w-9 shrink-0 rounded-full object-cover md:h-11 md:w-11"
                                            />
                                        ) : (
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-base md:h-11 md:w-11 md:text-lg font-bold text-gray-700 dark:bg-[#404040] dark:text-gray-100">
                                                {username.charAt(0).toUpperCase()}
                                            </div>
                                        )}

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100 md:text-base">
                                                {username}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 md:text-sm">
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
                                        className={`${menuItemClass} justify-between`}
                                    >
                                        <span className="flex min-w-0 items-center gap-1 md:gap-3">
                                            <span aria-hidden="true">🔔</span>
                                            <span className="shrink-0 whitespace-nowrap text-[10px] md:text-sm">{t.notifications}</span>
                                        </span>

                                        {unreadCount > 0 && (
                                            <span className="inline-flex h-4 min-w-4 max-w-5 shrink-0 items-center justify-center overflow-hidden whitespace-nowrap rounded-full bg-[var(--accent)] px-0 text-[8px] font-bold leading-none text-white md:h-[18px] md:min-w-[18px] md:max-w-[30px] md:px-1 md:text-[10px]">
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
                                        className={`${menuItemClass} cursor-pointer`}
                                    >
                                        <span aria-hidden="true">
                                            {darkMode ? "☀️" : "🌙"}
                                        </span>
                                        {darkMode ? t.lightMode : t.darkMode}
                                    </button>

                                    <div className="my-1 col-span-2 border-t border-gray-200 dark:border-[#303030] md:my-2" />

                                    <div className="col-span-2 px-3 py-2.5 md:px-4 md:py-3">
                                        <p className="mb-2 text-xs font-medium text-gray-800 md:mb-3 md:text-sm dark:text-gray-200">
                                            🌐 {t.language}
                                        </p>

                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleLanguageChange("fa")}
                                                aria-pressed={language === "fa"}
                                                className={`cursor-pointer rounded-lg border px-2 py-1.5 text-xs transition md:py-2 md:text-sm ${
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
                                                className={`cursor-pointer rounded-lg border px-2 py-1.5 text-xs transition md:py-2 md:text-sm ${
                                                    language === "en"
                                                        ? "border-[var(--accent)] bg-[var(--accent)]/10 font-semibold text-[var(--accent)]"
                                                        : "border-gray-200 text-gray-700 hover:bg-gray-100 dark:border-[#404040] dark:text-gray-200 dark:hover:bg-[#303030]"
                                                }`}
                                            >
                                                🇬🇧 {t.english}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="my-1 col-span-2 border-t border-gray-200 dark:border-[#303030] md:my-2" />

                                    <button
                                        type="button"
                                        role="menuitem"
                                        onClick={handleLogout}
                                        className="col-span-2 cursor-pointer flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium text-red-700 md:gap-3 md:rounded-none md:px-4 md:py-3 md:text-sm hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
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