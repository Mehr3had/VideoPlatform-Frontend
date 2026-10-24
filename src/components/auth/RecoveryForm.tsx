"use client";

import Link from "next/link";
import useAccountRecovery from "@/hooks/useAccountRecovery";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

interface RecoveryFormProps {
    title: string;
    description: string;
    endpoint: string;
    buttonText: string;
    loadingText: string;
    successMessage: string;
    footerText: string;
    extraLink?: {
        text: string;
        href: string;
        label: string;
    };
    type: "password" | "username";
}

export default function RecoveryForm({
    type,
    endpoint,
    extraLink,
}: RecoveryFormProps) {
    const {
        email,
        setEmail,
        message,
        success,
        loading,
        handleSubmit,
    } = useAccountRecovery({
        endpoint,
        successMessage: "",
    });

    const { language, isPersian } = useLanguage();
    const passwordTranslations = translations[language].forgotPassword;
    const usernameTranslations = translations[language].forgotUsername;

    const t = type === "password"
        ? {
            ...passwordTranslations,
            emailLabel: passwordTranslations.emailLabel,
            emailPlaceholder: passwordTranslations.emailPlaceholder,
            login: passwordTranslations.login,
        }
        : {
            ...usernameTranslations,
            emailLabel: translations[language].forgotPassword.emailLabel,
            emailPlaceholder: translations[language].forgotPassword.emailPlaceholder,
            login: translations[language].forgotPassword.login,
        };

    const extraLinkText = isPersian
        ? translations.fa.forgotUsername.extraLinkText
        : translations.en.forgotUsername.extraLinkText;

    const extraLinkLabel = isPersian
        ? translations.fa.forgotUsername.extraLinkLabel
        : translations.en.forgotUsername.extraLinkLabel;

    return (
        <div
            dir={isPersian ? "rtl" : "ltr"}
            className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm dark:bg-[#181818]"
        >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {t.title}
            </h1>

            <p className="mt-2 text-gray-500 dark:text-gray-400">
                {t.description}
            </p>

            {message && (
                <div
                    role={success ? "status" : "alert"}
                    aria-live="polite"
                    dir="auto"
                    className={`mt-6 rounded-lg border p-3 text-sm ${
                        success
                            ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
                            : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                    }`}
                >
                    {success ? t.successMessage : message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                    <label
                        htmlFor="recovery-email"
                        className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        {t.emailLabel}
                    </label>

                    <input
                        id="recovery-email"
                        type="email"
                        dir={isPersian && !email ? "rtl" : "ltr"}
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                        placeholder={t.emailPlaceholder}
                        className={`w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-700 focus:ring-2 focus:ring-red-100 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-red-950 ${
                            isPersian && !email ? "text-right" : "text-left"
                        }`}
                    />

                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-red-700 px-5 py-3 font-medium text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? t.loadingText : t.buttonText}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                {t.footerText}{" "}
                <Link
                    href="/login"
                    className="font-medium text-red-700 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                    {t.login}
                </Link>
            </p>

            {extraLink && (
                <p className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
                    {extraLink.text}{" "}
                    <Link
                        href={extraLink.href}
                        className="font-medium text-red-700 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                        {extraLink.label}
                    </Link>
                </p>
            )}
        </div>
    );
}