"use client";

import type { FormEvent } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

interface PasswordFormProps {
    currentPassword: string;
    setCurrentPassword: (value: string) => void;
    newPassword: string;
    setNewPassword: (value: string) => void;
    passwordConfirm: string;
    setPasswordConfirm: (value: string) => void;
    loading: boolean;
    message: string;
    isError: boolean;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function PasswordForm({
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    passwordConfirm,
    setPasswordConfirm,
    loading,
    message,
    isError,
    onSubmit,
}: PasswordFormProps) {
    const { language } = useLanguage();
    const t = translations[language].settings;

    const inputClass =
        "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-red-700 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100";

    return (
        <section className="rounded-xl bg-white p-6 shadow-sm dark:bg-[#181818] sm:p-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t.passwordTitle}
            </h2>

            <form onSubmit={onSubmit} className="mt-6 space-y-5">
                <div>
                    <label
                        htmlFor="current-password"
                        className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        {t.currentPassword}
                    </label>
                    <input
                        id="current-password"
                        type="password"
                        required
                        autoComplete="current-password"
                        value={currentPassword}
                        onChange={(event) =>
                            setCurrentPassword(event.target.value)
                        }
                        className={inputClass}
                    />
                </div>

                <div>
                    <label
                        htmlFor="new-password"
                        className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        {t.newPassword}
                    </label>
                    <input
                        id="new-password"
                        type="password"
                        required
                        minLength={8}
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(event) =>
                            setNewPassword(event.target.value)
                        }
                        className={inputClass}
                    />
                </div>

                <div>
                    <label
                        htmlFor="confirm-password"
                        className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        {t.confirmPassword}
                    </label>
                    <input
                        id="confirm-password"
                        type="password"
                        required
                        minLength={8}
                        autoComplete="new-password"
                        value={passwordConfirm}
                        onChange={(event) =>
                            setPasswordConfirm(event.target.value)
                        }
                        className={inputClass}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-red-700 px-5 py-3 font-medium text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? t.saving : t.updatePassword}
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