"use client";

import Navbar from "@/components/Navbar";
import VideoCard from "@/components/videos/VideoCard";
import VideoFilters from "@/components/videos/VideoFilters";
import useHomeVideos from "@/hooks/useHomeVideos";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

export default function Home() {
    const {
        videos,
        trendingVideos,
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
    } = useHomeVideos();

    const { language, isPersian } = useLanguage();
    const t = translations[language].home;

    return (
        <main
            dir={isPersian ? "rtl" : "ltr"}
            className="min-h-screen bg-gray-100 dark:bg-[#0f0f0f]"
        >
            <Navbar />

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
                        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
                            🔥 {t.trendingVideos}
                        </h2>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {trendingVideos.slice(0, 3).map((video) => (
                                <VideoCard key={video.id} video={video} />
                            ))}
                        </div>
                    </section>
                )}

                <h2 className="mb-8 text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {t.latestVideos}
                </h2>

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
                            {videos.map((video) => (
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

                {totalPages > 1 && (
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                        <button
                            onClick={() => setPage((prev) => prev - 1)}
                            disabled={page === 1}
                            className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#404040] dark:bg-[#181818] dark:text-gray-300 dark:hover:bg-[#252525]"
                        >
                            {isPersian ? "→" : "←"} {t.previous}
                        </button>

                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t.page} {page} {t.of} {totalPages}
                        </span>

                        <button
                            onClick={() => setPage((prev) => prev + 1)}
                            disabled={page === totalPages}
                            className="accent-button rounded-lg px-5 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {t.next} {isPersian ? "←" : "→"}
                        </button>
                    </div>
                )}
            </section>
        </main>
    );
}