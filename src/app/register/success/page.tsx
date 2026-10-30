"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

export default function RegistrationSuccessPage() {
    const { language, isPersian } = useLanguage();
    const t = translations[language].register;

    return (
        <main
            dir={isPersian ? "rtl" : "ltr"}
            className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-10"
        >
            <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg dark:bg-[#181818] sm:p-10">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        className="h-10 w-10"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m5 12 4 4L19 6"
                        />
                    </svg>
                </div>

                <h1 className="mt-6 text-2xl font-bold text-[var(--accent)]">
                    {t.registrationSuccess}
                </h1>

                <p className="mt-3 leading-7 text-gray-600 dark:text-gray-400">
                    {isPersian
                        ? "حساب کاربری شما با موفقیت ساخته شد. حالا می‌تونی وارد حساب کاربریت بشی و از امکانات سایت استفاده کنی."
                        : "Your account has been created successfully. You can now sign in and start exploring the platform."}
                </p>

                <div className="mt-8 flex flex-col gap-3">
                    <Link
                        href="/login"
                        className="accent-button rounded-lg px-5 py-3 text-center font-medium"
                    >
                        {t.login}
                    </Link>

                    <Link
                        href="/"
                        className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-center font-medium text-gray-700 transition hover:border-[var(--accent)] hover:text-[var(--accent)] dark:border-[#404040] dark:bg-[#252525] dark:text-gray-200"
                    >
                        {t.backHome}
                    </Link>
                </div>
            </div>
        </main>
    );
}