"use client";

import { useEffect, useId } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

interface ShareVideoSuccessDialogProps {
    isOpen: boolean;
    url: string;
    status: "success" | "error";
    onClose: () => void;
    onCopyAgain: () => void;
}

export default function ShareVideoSuccessDialog({
    isOpen,
    url,
    status,
    onClose,
    onCopyAgain,
}: ShareVideoSuccessDialogProps) {
    const { language, isPersian } = useLanguage();
    const t = translations[language].videoDetail;

    const titleId = useId();
    const descriptionId = useId();
    const isSuccess = status === "success";

    useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const description = isSuccess
        ? isPersian
            ? "لینک ویدئو با موفقیت کپی شد و آماده اشتراک‌گذاری است."
            : "The video link has been copied successfully and is ready to share."
        : isPersian
            ? "کپی لینک انجام نشد. می‌تونی دوباره تلاش کنی."
            : "The link could not be copied. You can try again.";

    return (
        <div
            dir={isPersian ? "rtl" : "ltr"}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <section
                role={isSuccess ? "dialog" : "alertdialog"}
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
                className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-[#303030] dark:bg-[#181818] sm:p-8"
            >
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        autoFocus
                        aria-label={isPersian ? "بستن پنجره" : "Close dialog"}
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-[#303030] dark:hover:text-white"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            className="h-5 w-5"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 6l12 12M18 6 6 18"
                            />
                        </svg>
                    </button>
                </div>

                <div
                    className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ring-1 ring-inset ${
                        isSuccess
                            ? "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400"
                            : "bg-red-500/10 text-red-600 ring-red-500/20 dark:text-red-400"
                    }`}
                >
                    {isSuccess ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            className="h-9 w-9"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m5 12 4 4L19 6"
                            />
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.8}
                            className="h-9 w-9"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 8v4m0 4h.01"
                            />
                            <circle cx="12" cy="12" r="9" />
                        </svg>
                    )}
                </div>

                <h2
                    id={titleId}
                    className="mt-5 text-center text-xl font-bold text-gray-900 dark:text-gray-100"
                >
                    {isSuccess
                        ? t.linkCopied
                        : isPersian
                            ? "کپی لینک انجام نشد"
                            : "Unable to copy link"}
                </h2>

                <p
                    id={descriptionId}
                    className="mt-3 text-center text-sm leading-7 text-gray-600 dark:text-gray-400"
                >
                    {description}
                </p>

                <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-[#383838] dark:bg-[#202020]">
                    <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                        {isPersian ? "لینک ویدئو" : "Video link"}
                    </p>

                    <p
                        dir="ltr"
                        className="break-all text-left text-sm leading-6 text-gray-800 dark:text-gray-200"
                    >
                        {url}
                    </p>
                </div>

                <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                        type="button"
                        onClick={onCopyAgain}
                        className="rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
                    >
                        {isSuccess
                            ? isPersian
                                ? "کپی دوباره لینک"
                                : "Copy link again"
                            : isPersian
                                ? "تلاش دوباره"
                                : "Try again"}
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-[#404040] dark:text-gray-200 dark:hover:bg-[#252525]"
                    >
                        {isPersian ? "بستن پنجره" : "Close"}
                    </button>
                </div>
            </section>
        </div>
    );
}