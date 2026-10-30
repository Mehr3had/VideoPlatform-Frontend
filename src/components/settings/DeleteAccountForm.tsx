"use client";

import { useState, type FormEvent } from "react";
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
    const { language, isPersian } = useLanguage();
    const t = translations[language].settings;

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmationText, setConfirmationText] = useState("");

    const closeDialog = () => {
        if (loading) return;

        setConfirmOpen(false);
        setConfirmationText("");
        setPassword("");
    };

    return (
        <section className="rounded-xl border border-red-200 bg-white p-6 shadow-sm dark:border-red-900/50 dark:bg-[#181818] sm:p-8">
            <h2 className="text-xl font-semibold text-red-700 dark:text-red-400">
                {t.deleteTitle}
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
                {t.deleteDescription}
            </p>

            <button
                type="button"
                onClick={() => {
                    setConfirmOpen(true);
                }}
                className="mt-6 rounded-lg bg-red-700 px-5 py-3 font-medium text-white transition hover:bg-red-800"
            >
                {t.deleteAccount}
            </button>

            {message && !confirmOpen && (
                <p
                    role="alert"
                    className={`mt-4 text-sm ${
                        isError
                            ? "text-red-600 dark:text-red-400"
                            : "text-green-700 dark:text-green-400"
                    }`}
                >
                    {message}
                </p>
            )}

            {confirmOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-6"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !loading
                        ) {
                            closeDialog();
                        }
                    }}
                >
                    <section
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="delete-account-title"
                        aria-describedby="delete-account-description"
                        dir={isPersian ? "rtl" : "ltr"}
                        className="my-auto w-full max-w-md rounded-2xl border border-[var(--accent)]/20 bg-white p-6 shadow-2xl dark:bg-[#181818] sm:p-8"
                    >
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                className="h-8 w-8"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v4m0 4h.01M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z"
                                />
                            </svg>
                        </div>

                        <h3
                            id="delete-account-title"
                            className="mt-5 text-center text-xl font-bold text-[var(--accent)]"
                        >
                            {isPersian
                                ? "حذف دائمی حساب کاربری"
                                : "Permanently delete your account"}
                        </h3>

                        <p
                            id="delete-account-description"
                            className="mt-3 text-center text-sm leading-7 text-gray-600 dark:text-gray-400"
                        >
                            {isPersian
                                ? "این عملیات ممکن است اطلاعات حساب، ویدئوها و محتوای مرتبط را حذف کند و قابل بازگشت نیست. اگر مطمئن نیستی، لغو را انتخاب کن."
                                : "This action may delete your account, videos, and associated content. It cannot be undone. If you are unsure, choose Cancel."}
                        </p>

                        <form onSubmit={onSubmit} className="mt-6 space-y-5">
                            <div>
                                <label
                                    htmlFor="delete-account-confirmation"
                                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    {isPersian
                                        ? "برای تأیید، عبارت DELETE را وارد کن."
                                        : 'Type "DELETE" to confirm.'}
                                </label>

                                <input
                                    id="delete-account-confirmation"
                                    type="text"
                                    autoComplete="off"
                                    spellCheck={false}
                                    required
                                    value={confirmationText}
                                    onChange={(event) =>
                                        setConfirmationText(
                                            event.target.value
                                        )
                                    }
                                    placeholder="DELETE"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-red-600 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100"
                                />
                            </div>

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
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    placeholder={t.deletePasswordPlaceholder}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-red-600 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100"
                                />
                            </div>

                            {message && (
                                <p
                                    role="alert"
                                    className={`rounded-lg p-3 text-sm ${
                                        isError
                                            ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                                            : "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300"
                                    }`}
                                >
                                    {message}
                                </p>
                            )}

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={closeDialog}
                                    disabled={loading}
                                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#404040] dark:bg-[#252525] dark:text-gray-200"
                                >
                                    {isPersian ? "لغو" : "Cancel"}
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        loading ||
                                        confirmationText !== "DELETE" ||
                                        !password
                                    }
                                    className="flex-1 rounded-lg bg-red-700 px-4 py-3 font-medium text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {loading
                                        ? t.deletingAccount
                                        : isPersian
                                            ? "حذف دائمی"
                                            : "Delete permanently"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </section>
    );
}