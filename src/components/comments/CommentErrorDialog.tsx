"use client";

import { useEffect, useId } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface CommentErrorDialogProps {
    isOpen: boolean;
    message: string;
    onClose: () => void;
}

export default function CommentErrorDialog({
    isOpen,
    message,
    onClose,
}: CommentErrorDialogProps) {
    const { isPersian } = useLanguage();
    const titleId = useId();
    const descriptionId = useId();

    useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            dir={isPersian ? "rtl" : "ltr"}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <section
                role="alertdialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
                className="w-full max-w-md rounded-2xl border border-[var(--accent)]/20 bg-white p-6 shadow-2xl dark:border-[#303030] dark:bg-[#181818] sm:p-8"
            >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)] ring-1 ring-inset ring-[var(--accent)]/20">
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
                            d="M12 9v4m0 4h.01"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10.3 3.9 1.8 18.6A2 2 0 0 0 3.5 21h17a2 2 0 0 0 1.7-2.4L13.7 3.9a2 2 0 0 0-3.4 0Z"
                        />
                    </svg>
                </div>

                <h2
                    id={titleId}
                    className="mt-5 text-center text-xl font-bold text-gray-900 dark:text-gray-100"
                >
                    {isPersian
                        ? "مشکلی پیش اومد!"
                        : "Something went wrong!"}
                </h2>

                <p
                    id={descriptionId}
                    className="mt-3 break-words text-center text-sm leading-7 text-gray-600 dark:text-gray-400"
                >
                    {message}
                </p>

                <div className="mt-8">
                    <button
                        type="button"
                        onClick={onClose}
                        autoFocus
                        className="w-full rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
                    >
                        {isPersian ? "متوجه شدم" : "Got it"}
                    </button>
                </div>
            </section>
        </div>
    );
}