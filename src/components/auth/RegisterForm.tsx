"use client";

import Link from "next/link";
import useRegister from "@/hooks/useRegister";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

export default function RegisterForm() {
    const {
        username,
        setUsername,
        email,
        setEmail,
        password,
        setPassword,
        passwordConfirm,
        setPasswordConfirm,
        error,
        loading,
        handleRegister,
    } = useRegister();

    const { language, isPersian } = useLanguage();
    const t = translations[language].register;

    const inputClass =
        "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-[var(--accent)] dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100 dark:placeholder:text-gray-500";

    const labelClass =
        "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";

    return (
        <div
            dir={isPersian ? "rtl" : "ltr"}
            className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm dark:bg-[#181818]"
        >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {t.title}
            </h1>

            <p className="mt-2 text-gray-500 dark:text-gray-400">
                {t.subtitle}
            </p>

            {error && (
                <div
                    role="alert"
                    dir="auto"
                    className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                >
                    {error}
                </div>
            )}

            <form onSubmit={handleRegister} className="mt-6 space-y-5">
                <div>
                    <label className={labelClass} htmlFor="register-username">
                        {t.username}
                    </label>
                    <input
                        id="register-username"
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
                    <label className={labelClass} htmlFor="register-email">
                        {t.email}
                    </label>
                    <input
                        id="register-email"
                        type="email"
                        dir={isPersian && !email ? "rtl" : "ltr"}
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="email"
                        required
                        className={`${inputClass} ${
                            isPersian && !email ? "text-right" : "text-left"
                        }`}
                        placeholder={t.emailPlaceholder}
                    />
                </div>

                <div>
                    <label className={labelClass} htmlFor="register-password">
                        {t.password}
                    </label>
                    <input
                        id="register-password"
                        type="password"
                        dir={isPersian && !password ? "rtl" : "ltr"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="new-password"
                        required
                        className={`${inputClass} ${
                            isPersian && !password ? "text-right" : "text-left"
                        }`}
                        placeholder={t.passwordPlaceholder}
                    />
                </div>

                <div>
                    <label
                        className={labelClass}
                        htmlFor="register-password-confirm"
                    >
                        {t.confirmPassword}
                    </label>
                    <input
                        id="register-password-confirm"
                        type="password"
                        dir={isPersian && !passwordConfirm ? "rtl" : "ltr"}
                        value={passwordConfirm}
                        onChange={(event) => setPasswordConfirm(event.target.value)}
                        autoComplete="new-password"
                        required
                        className={`${inputClass} ${
                            isPersian && !passwordConfirm ? "text-right" : "text-left"
                        }`}
                        placeholder={t.confirmPasswordPlaceholder}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="accent-button w-full rounded-lg px-5 py-3 font-medium disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? t.submitting : t.submit}
                </button>
            </form>

            <div className="mt-4 text-center">
                <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-gray-100 px-5 py-3 text-base font-medium text-gray-700 transition hover:bg-gray-200 dark:border-[#404040] dark:bg-[#252525] dark:text-gray-200 dark:hover:bg-[#303030]"
                >
                    {t.backHome}
                </Link>
            </div>

            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                {t.alreadyHaveAccount}{" "}
                <Link
                    href="/login"
                    className="font-medium text-[var(--accent)] hover:opacity-80"
                >
                    {t.login}
                </Link>
            </p>
        </div>
    );
}