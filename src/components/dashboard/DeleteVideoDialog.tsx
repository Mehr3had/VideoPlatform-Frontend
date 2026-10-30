"use client";

import { useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface DeleteVideoDialogProps {
    videoTitle: string;
    loading: boolean;
    error: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function DeleteVideoDialog({
    videoTitle,
    loading,
    error,
    onConfirm,
    onCancel,
}: DeleteVideoDialogProps) {
    const { isPersian } = useLanguage();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !loading) {
                onCancel();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [loading, onCancel]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !loading) {
                    onCancel();
                }
            }}
        >
            <section
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="delete-video-title"
                aria-describedby="delete-video-description"
                dir={isPersian ? "rtl" : "ltr"}
                className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-[#404040] dark:bg-[#181818] sm:p-8"
            >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        className="h-7 w-7"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14M10 10v6m4-6v6"
                        />
                    </svg>
                </div>

                <h2
                    id="delete-video-title"
                    className="mt-5 text-center text-xl font-bold text-gray-900 dark:text-gray-100"
                >
                    {isPersian ? "حذف ویدئو" : "Delete video"}
                </h2>

                <p
                    id="delete-video-description"
                    className="mt-3 text-center leading-7 text-gray-600 dark:text-gray-400"
                >
                    {isPersian
                        ? "آیا مطمئنی که می‌خوای این ویدئو رو حذف کنی؟ این عملیات قابل بازگشت نیست."
                        : "Are you sure you want to delete this video? This action cannot be undone."}
                </p>

                <div className="mt-4 break-words rounded-lg border border-[var(--accent)]/20 bg-[var(--accent)]/5 px-4 py-3 text-center font-medium text-gray-900 dark:text-gray-100">
                    {videoTitle}
                </div>

                {error && (
                    <p
                        role="alert"
                        className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                    >
                        {error}
                    </p>
                )}

                <div className="mt-6 flex gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#404040] dark:bg-[#252525] dark:text-gray-200"
                    >
                        {isPersian ? "لغو" : "Cancel"}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 rounded-lg bg-red-600 px-4 py-3 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading
                            ? isPersian
                                ? "در حال حذف..."
                                : "Deleting..."
                            : isPersian
                                ? "بله، حذف کن"
                                : "Yes, delete"}
                    </button>
                </div>
            </section>
        </div>
    );
}