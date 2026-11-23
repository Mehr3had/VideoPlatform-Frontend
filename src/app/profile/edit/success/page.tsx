"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

function EditProfileSuccessContent() {
    const searchParams = useSearchParams();
    const { isPersian } = useLanguage();

    const profileId = searchParams.get("id");

    return (
        <main
            dir={isPersian ? "rtl" : "ltr"}
            className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-10"
        >
            <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-lg dark:bg-[#181818] sm:p-10">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                    <svg
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
                    {isPersian
                        ? "پروفایل با موفقیت ویرایش شد!"
                        : "Profile updated successfully!"}
                </h1>

                <p className="mt-3 leading-7 text-gray-600 dark:text-gray-400">
                    {isPersian
                        ? "تغییرات پروفایلت با موفقیت ذخیره شدن. حالا می‌تونی پروفایل خودت رو مشاهده کنی."
                        : "Your profile changes have been saved. You can now view your updated profile."}
                </p>

                <div className="mt-8 flex flex-col gap-3">
                    {profileId && (
                        <Link
                            href={`/profile/${encodeURIComponent(profileId)}`}
                            className="accent-button rounded-lg px-5 py-3 text-center font-medium"
                        >
                            {isPersian
                                ? "مشاهده پروفایل"
                                : "View profile"}
                        </Link>
                    )}

                    <Link
    href="/"
    aria-label={isPersian ? "Home" : "Back to home"}
    title={isPersian ? "Home" : "Back to home"}
    className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 transition hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] dark:border-[#404040] dark:bg-[#252525] dark:text-gray-200"
>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
    >
        {isPersian ? (
            <path d="M5 12h14m-7-7 7 7-7 7" />
        ) : (
            <path d="M19 12H5m7 7-7-7 7-7" />
        )}
    </svg>
</Link>
                </div>
            </div>
        </main>
    );
}

export default function EditProfileSuccessPage() {
    return (
        <Suspense
            fallback={
                <main className="flex min-h-screen items-center justify-center bg-[var(--background)]">
                    <p className="text-gray-500 dark:text-gray-400">
                        Loading...
                    </p>
                </main>
            }
        >
            <EditProfileSuccessContent />
        </Suspense>
    );
}