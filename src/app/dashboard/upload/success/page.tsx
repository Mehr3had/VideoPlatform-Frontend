"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useLanguage } from "@/context/LanguageContext";

function UploadSuccessContent() {
    const searchParams = useSearchParams();
    const { isPersian } = useLanguage();

    const videoId = searchParams.get("id");
    const videoTitle = searchParams.get("title");

    return (
        <main
            dir={isPersian ? "rtl" : "ltr"}
            className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10 dark:bg-[#0f0f0f]"
        >
            <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-lg dark:bg-[#181818] sm:p-10">
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
                    {isPersian
                        ? "ویدئو با موفقیت آپلود شد!"
                        : "Video uploaded successfully!"}
                </h1>

                <p className="mt-3 leading-7 text-gray-600 dark:text-gray-400">
                    {isPersian
                        ? "ویدئوی تو با موفقیت به پلتفرم اضافه شد و آماده مشاهده است."
                        : "Your video has been added to the platform and is ready to view."}
                </p>

                {videoTitle && (
                    <div className="mt-6 rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {isPersian ? "عنوان ویدئو" : "Video title"}
                        </p>

                        <p className="mt-2 break-words font-semibold text-gray-900 dark:text-gray-100">
                            {videoTitle}
                        </p>
                    </div>
                )}

                <div className="mt-8 flex flex-col gap-3">
                    {videoId && (
                        <Link
                            href={`/videos/${encodeURIComponent(videoId)}`}
                            className="accent-button rounded-lg px-5 py-3 text-center font-medium"
                        >
                            {isPersian ? "مشاهده ویدئو" : "Watch video"}
                        </Link>
                    )}

                    <Link
                        href="/dashboard"
                        className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-center font-medium text-gray-700 transition hover:border-[var(--accent)] hover:text-[var(--accent)] dark:border-[#404040] dark:bg-[#252525] dark:text-gray-200"
                    >
                        {isPersian ? "بازگشت به داشبورد" : "Back to dashboard"}
                    </Link>

                    <Link
                        href="/"
                        className="px-5 py-2 text-sm font-medium text-[var(--accent)] hover:opacity-80"
                    >
                        {isPersian ? "بازگشت به صفحه اصلی" : "Back to home"}
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default function UploadSuccessPage() {
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
            <UploadSuccessContent />
        </Suspense>
    );
}