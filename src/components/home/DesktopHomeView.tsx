"use client";

import { useState } from "react";
import Link from "next/link";

import VideoCard from "@/components/videos/VideoCard";
import LiveStreamCard from "@/components/live/LiveStreamCard";
import VideoFilters from "@/components/videos/VideoFilters";
import type useHomeVideos from "@/hooks/useHomeVideos";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

type DesktopHomeViewProps = {
    home: ReturnType<typeof useHomeVideos>;
};

export default function DesktopHomeView({ home }: DesktopHomeViewProps) {
    const {
        videos,
        trendingVideos,
        activeLiveStreams,
        categories,
        isLoadingVideos,
        isErrorVideos,
        isLoadingTrending,
        isLoadingCategories,
        search,
        setSearch,
        category,
        page,
        setPage,
        totalPages,
        handleSearch,
        handleCategoryChange,
    } = home;

    const { language, isPersian } = useLanguage();
    const t = translations[language].home;

    const hasActiveVideoFilters = Boolean(search.trim() || category);
    const displayedLatestVideos = hasActiveVideoFilters
        ? videos
        : videos.slice(0, 3);

    const [trendingPage, setTrendingPage] = useState<0 | 1>(0);

    const trendingVideosForPage = trendingVideos
        .slice(0, 6)
        .slice(trendingPage * 3, trendingPage * 3 + 3);

    return (
        <div
            dir={isPersian ? "rtl" : "ltr"}
            className="min-h-screen bg-gray-100 dark:bg-[#0f0f0f]"
        >

            <section className="px-4 py-8 sm:px-8 sm:py-12">
                <VideoFilters
                    search={search}
                    onSearchChange={setSearch}
                    category={category}
                    categories={categories}
                    onCategoryChange={handleCategoryChange}
                    onSearch={handleSearch}
                />

                {!search.trim() && trendingVideos.length > 0 && (
                    <section className="mb-12">
                        <div className="mb-6 flex items-center justify-between gap-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {"\uD83D\uDD25"} {t.trendingVideos}
                            </h2>

                            {trendingVideos.length > 3 && (
                                <div dir={isPersian ? "rtl" : "ltr"} className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setTrendingPage(0)}
                                        disabled={trendingPage === 0}
                                        aria-label={
                                            isPersian
                                                ? "\u0648\u06CC\u062F\u0626\u0648\u0647\u0627\u06CC \u0642\u0628\u0644"
                                                : "Previous trending videos"
                                        }
                                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-lg font-semibold text-gray-700 transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-30 dark:border-[#404040] dark:bg-[#181818] dark:text-gray-300 dark:hover:bg-[#252525]"
                                    >
                                        {isPersian ? "\u2192" : "\u2190"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setTrendingPage(1)}
                                        disabled={
                                            trendingPage === 1 ||
                                            trendingVideos.length <= 3
                                        }
                                        aria-label={
                                            isPersian
                                                ? "\u0648\u06CC\u062F\u0626\u0648\u0647\u0627\u06CC \u0628\u0639\u062F\u06CC"
                                                : "Next trending videos"
                                        }
                                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-lg font-semibold text-gray-700 transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-30 dark:border-[#404040] dark:bg-[#181818] dark:text-gray-300 dark:hover:bg-[#252525]"
                                    >
                                        {isPersian ? "\u2190" : "\u2192"}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            {trendingVideosForPage.map((video) => (
                                <VideoCard key={video.id} video={video} />
                            ))}
                        </div>
                    </section>
                )}
                {!search.trim() && activeLiveStreams.length > 0 && (
                    <section className="mb-12">
                        <div className="mb-6 flex items-center gap-3">
                            <span className="relative flex h-3 w-3">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-600" />
                            </span>

                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {t.liveNow}
                            </h2>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {activeLiveStreams.map((stream) => (
                                <LiveStreamCard
                                    key={stream.id}
                                    stream={stream}
                                />
                            ))}
                        </div>
                    </section>
                )}

                <div className="mb-8 flex items-center justify-between gap-4">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {t.latestVideos}
                    </h2>

                    {!hasActiveVideoFilters && videos.length > 3 && (
                        <Link
                            href="/videos"
                            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-[var(--accent)] bg-[var(--accent)]/10 px-4 py-2.5 text-sm font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)]/15 hover:shadow-sm"
                        >
                            <span>
                                {isPersian
                                    ? "\u0648\u06CC\u062F\u0626\u0648\u0647\u0627\u06CC \u0628\u06CC\u0634\u062A\u0631"
                                    : "More videos"}
                            </span>
                            <span aria-hidden="true">
                                {isPersian ? "\u2190" : "\u2192"}
                            </span>
                        </Link>
                    )}
                </div>

                {isLoadingVideos ? (
                    <p
                        role="status"
                        className="mt-10 text-center text-gray-500 dark:text-gray-400"
                    >
                        {isPersian ? "در حال بارگذاری ویدئوها..." : "Loading videos..."}
                    </p>
                ) : isErrorVideos ? (
                    <p role="alert" className="mt-10 text-center text-red-600 dark:text-red-400">
                        {isPersian
                            ? "دریافت ویدئوها ناموفق بود. لطفاً دوباره تلاش کن."
                            : "Failed to load videos. Please try again."}
                    </p>
                ) : (
                    <>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {displayedLatestVideos.map((video) => (
                                <VideoCard key={video.id} video={video} />
                            ))}
                        </div>

                        {videos.length === 0 && (
                            <p className="mt-10 text-center text-gray-500 dark:text-gray-400">
                                {t.noVideos}
                            </p>
                        )}
                    </>
                )}


                {hasActiveVideoFilters && totalPages > 1 && (
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                        <button
                            onClick={() => setPage((prev) => prev - 1)}
                            disabled={page === 1}
                            className="cursor-pointer rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#404040] dark:bg-[#181818] dark:text-gray-300 dark:hover:bg-[#252525]"
                        >
                            {isPersian ? "→" : "←"} {t.previous}
                        </button>

                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t.page} {page} {t.of} {totalPages}
                        </span>

                        <button
                            onClick={() => setPage((prev) => prev + 1)}
                            disabled={page === totalPages}
                            className="cursor-pointer accent-button rounded-lg px-5 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {t.next} {isPersian ? "←" : "→"}
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}