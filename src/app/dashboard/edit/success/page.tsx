"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";

function EditVideoSuccessContent() {
    const searchParams = useSearchParams();
    const { isPersian } = useLanguage();
    const videoId = searchParams.get("id");
    const videoTitle = searchParams.get("title");

    return (
        <main
            dir={isPersian ? "rtl" : "ltr"}
            className="min-h-screen bg-gray-100 text-gray-900 dark:bg-[#0f0f0f] dark:text-white"
        >
            <Navbar />

            <section className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center sm:py-24">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent)]/10">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-[var(--accent)]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M20 6 9 17l-5-5" />
                    </svg>
                </div>

                <h1 className="mt-6 text-2xl font-bold sm:text-3xl">
                    {isPersian
                        ? "ویدئو با موفقیت ویرایش شد!"
                        : "Video Updated Successfully!"}
                </h1>

                <p className="mt-3 max-w-lg text-sm leading-7 text-gray-600 dark:text-gray-400 sm:text-base">
                    {isPersian
                        ? "تغییراتی که اعمال کردی با موفقیت ذخیره شدن."
                        : "Your changes have been saved successfully."}
                </p>

                {videoTitle && (
                    <div className="mt-8 w-full rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-5">
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            {isPersian ? "عنوان ویدئو" : "Video Title"}
                        </p>

                        <p className="break-words font-semibold">
                            {videoTitle}
                        </p>
                    </div>
                )}

                <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:min-w-64">
                    {videoId && (
                        <Link
                            href={`/videos/${encodeURIComponent(videoId)}`}
                            className="accent-button rounded-lg px-6 py-3 text-center font-medium transition hover:opacity-90"
                        >
                            {isPersian
                                ? "تماشای ویدئو"
                                : "Watch Video"}
                        </Link>
                    )}

                    <Link
                        href="/dashboard"
                        className="rounded-lg border border-gray-300 px-6 py-3 text-center font-medium transition hover:border-[var(--accent)] hover:text-[var(--accent)] dark:border-[#404040]"
                    >
                        {isPersian
                            ? "بازگشت به داشبورد"
                            : "Back to Dashboard"}
                    </Link>

                    <Link
                        href="/"
                        className="py-2 text-sm text-gray-500 transition hover:text-[var(--accent)] dark:text-gray-400"
                    >
                        {isPersian ? "صفحه اصلی" : "Home"}
                    </Link>
                </div>
            </section>
        </main>
    );
}

export default function EditVideoSuccessPage() {
    return (
        <Suspense
            fallback={
                <main className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-[#0f0f0f]">
                    <p className="text-gray-500 dark:text-gray-400">
                        Loading...
                    </p>
                </main>
            }
        >
            <EditVideoSuccessContent />
        </Suspense>
    );
}