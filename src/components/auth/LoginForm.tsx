"use client";

import Link from "next/link";
import useLogin from "@/hooks/useLogin";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

export default function LoginForm() {
    const {
        username,
        setUsername,
        password,
        setPassword,
        error,
        isLoading,
        handleLogin,
    } = useLogin();

    const { language, isPersian } = useLanguage();
    const t = translations[language].login;

    const labelClass =
        "mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300";

    const inputClass =
        "w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none placeholder:text-gray-400 focus:border-red-700 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100 dark:placeholder:text-gray-500";

    return (
        <div
            dir={isPersian ? "rtl" : "ltr"}
            className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm dark:bg-[#181818]"
        >
            <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
                {t.title}
            </h1>

            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label
                        htmlFor="login-username"
                        className={labelClass}
                    >
                        {t.username}
                    </label>
                    <input
                        id="login-username"
                        type="text"
                        dir={isPersian && !username ? "rtl" : "ltr"}
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        autoComplete="username"
                        required
                        className={`${inputClass} ${
                            isPersian && !username ? "text-right" : "text-left"
                        }`}
                        placeholder={t.usernamePlaceholder}
                    />
                </div>

                <div>
                    <label
                        htmlFor="login-password"
                        className={labelClass}
                    >
                        {t.password}
                    </label>
                    <input
                        id="login-password"
                        type="password"
                        dir={isPersian && !password ? "rtl" : "ltr"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="current-password"
                        required
                        className={`${inputClass} ${
                            isPersian && !password ? "text-right" : "text-left"
                        }`}
                        placeholder={t.passwordPlaceholder}
                    />
                </div>

                {error && (
                    <div
                        role="alert"
                        dir="auto"
                        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                    >
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-lg bg-red-700 px-4 py-3 font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isLoading ? t.submitting : t.submit}
                </button>

                <div className="text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-base font-medium text-white transition hover:bg-blue-700"
                    >
                        {t.backHome}
                    </Link>
                </div>

                <div
                    className={`flex items-center justify-between gap-3 pt-2 ${
                        isPersian ? "flex-row" : "flex-row"
                    }`}
                >
                    <Link
                        href="/forgot-password"
                        className="text-sm font-medium text-red-700 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                        {t.forgotPassword}
                    </Link>

                    <Link
                        href="/forgot-username"
                        className="text-sm font-medium text-red-700 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                        {t.forgotUsername}
                    </Link>
                </div>
            </form>
        </div>
    );
}