"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import VideoCard from "@/components/videos/VideoCard";
import { axiosClient } from "@/lib/axios";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

interface Video {
    id: number;
    title: string;
    thumbnail?: string | null;
    username: string;
    user_id?: number;
    profile_image?: string | null;
    created_at?: string;
    views_count: number;
    duration: number;
    category_name?: string | null;
}

interface PaginatedVideos {
    count: number;
    results: Video[];
}

const PAGE_SIZE = 9;

export default function VideosPage() {
    const [page, setPage] = useState(1);

    const { language, isPersian } = useLanguage();
    const t = translations[language].home;

    const numberFormatter = new Intl.NumberFormat(
        isPersian ? "fa-IR" : "en-US"
    );

    const videosQuery = useQuery({
        queryKey: ["allVideos", page],
        queryFn: async () => {
            const response = await axiosClient.get<PaginatedVideos>(
                "/videos/",
                {
                    params: {
                        page,
                        page_size: PAGE_SIZE,
                    },
                }
            );

            return {
                videos: response.data.results,
                totalCount: response.data.count,
                totalPages: Math.max(
                    1,
                    Math.ceil(response.data.count / PAGE_SIZE)
                ),
            };
        },
        placeholderData: keepPreviousData,
        staleTime: 30 * 1000,
    });

    const videos = videosQuery.data?.videos ?? [];
    const totalPages = videosQuery.data?.totalPages ?? 1;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-[#0f0f0f]">
            <Navbar />

            <main
                dir={isPersian ? "rtl" : "ltr"}
                className="mx-auto min-h-screen w-full max-w-7xl px-3 py-5 sm:px-8 sm:py-10"
            >
                <h1 className="mb-5 text-xl font-bold text-gray-900 dark:text-gray-100 sm:mb-8 sm:text-3xl">
                    {t.latestVideos}
                </h1>

                {videosQuery.isLoading ? (
                    <p
                        role="status"
                        className="py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                        {isPersian
                            ? "\u062F\u0631 \u062D\u0627\u0644 \u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC \u0648\u06CC\u062F\u0626\u0648\u0647\u0627..."
                            : "Loading videos..."}
                    </p>
                ) : videosQuery.isError ? (
                    <p
                        role="alert"
                        className="py-12 text-center text-sm text-red-600 dark:text-red-400"
                    >
                        {isPersian
                            ? "\u062F\u0631\u06CC\u0627\u0641\u062A \u0648\u06CC\u062F\u0626\u0648\u0647\u0627 \u0646\u0627\u0645\u0648\u0641\u0642 \u0628\u0648\u062F."
                            : "Failed to load videos. Please try again."}
                    </p>
                ) : (
                    <>
                        {videos.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2 sm:gap-5">
                                {videos.map((video) => (
                                    <VideoCard
                                        key={video.id}
                                        video={video}
                                        compactMobile
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                                {t.noVideos}
                            </p>
                        )}
                    </>
                )}

                {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                setPage((previous) => Math.max(1, previous - 1))
                            }
                            disabled={page === 1 || videosQuery.isFetching}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#404040] dark:bg-[#181818] dark:text-gray-300"
                        >
                            {isPersian ? "\u2192" : "\u2190"}
                            {" "}
                            {isPersian ? "\u0642\u0628\u0644\u06CC" : "Previous"}
                        </button>

                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            {numberFormatter.format(page)}
                            {" / "}
                            {numberFormatter.format(totalPages)}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                setPage((previous) =>
                                    Math.min(totalPages, previous + 1)
                                )
                            }
                            disabled={
                                page === totalPages || videosQuery.isFetching
                            }
                            className="accent-button rounded-lg px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {isPersian ? "\u0628\u0639\u062F\u06CC" : "Next"}
                            {" "}
                            {isPersian ? "\u2190" : "\u2192"}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}