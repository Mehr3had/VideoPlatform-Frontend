"use client";

import type { FormEvent } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

interface UsernameFormProps {
    username: string;
    setUsername: (value: string) => void;
    loading: boolean;
    message: string;
    isError: boolean;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function UsernameForm({
    username,
    setUsername,
    loading,
    message,
    isError,
    onSubmit,
}: UsernameFormProps) {
    const { language } = useLanguage();
    const t = translations[language].settings;

    return (
        <section className="rounded-xl bg-white p-6 shadow-sm dark:bg-[#181818] sm:p-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t.usernameTitle}
            </h2>

            <form onSubmit={onSubmit} className="mt-6 space-y-5">
                <div>
                    <label
                        htmlFor="new-username"
                        className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        {t.newUsername}
                    </label>

                    <input
                        id="new-username"
                        required
                        minLength={1}
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        placeholder={t.usernamePlaceholder}
                        autoComplete="username"
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-red-700 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100 dark:placeholder:text-gray-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-red-700 px-5 py-3 font-medium text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? t.saving : t.updateUsername}
                </button>

                {message && (
                    <p
                        role={isError ? "alert" : "status"}
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