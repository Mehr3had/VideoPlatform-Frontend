"use client";

import type { FormEvent } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

interface DeleteAccountFormProps {
    password: string;
    setPassword: (value: string) => void;
    loading: boolean;
    message: string;
    isError: boolean;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function DeleteAccountForm({
    password,
    setPassword,
    loading,
    message,
    isError,
    onSubmit,
}: DeleteAccountFormProps) {
    const { language } = useLanguage();
    const t = translations[language].settings;

    return (
        <section className="rounded-xl border border-red-200 bg-white p-6 shadow-sm dark:border-red-900/50 dark:bg-[#181818] sm:p-8">
            <h2 className="text-xl font-semibold text-red-700 dark:text-red-400">
                {t.deleteTitle}
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
                {t.deleteDescription}
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-5">
                <div>
                    <label
                        htmlFor="delete-account-password"
                        className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        {t.confirmPasswordDelete}
                    </label>

                    <input
                        id="delete-account-password"
                        type="password"
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        placeholder={t.deletePasswordPlaceholder}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-red-700 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100 dark:placeholder:text-gray-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-red-700 px-5 py-3 font-medium text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? t.deletingAccount : t.deleteAccount}
                </button>

                {message && (
                    <p
                        role="alert"
                        className={`text-sm ${
                            isError
                                ? "text-red-600 dark:text-red-400"
                                : "text-green-700 dark:text-green-400"
                        }`}
                    >
                        {message}
                    </p>
                )}
            </form>
        </section>
    );
}