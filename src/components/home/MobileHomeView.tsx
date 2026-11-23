"use client";

import { useEffect, useRef, useState } from "react";
import type { TouchEvent } from "react";
import Link from "next/link";
import VideoCard from "@/components/videos/VideoCard";
import LiveStreamCard from "@/components/live/LiveStreamCard";
import VideoFilters from "@/components/videos/VideoFilters";
import type useHomeVideos from "@/hooks/useHomeVideos";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

type MobileHomeViewProps = {
    home: ReturnType<typeof useHomeVideos>;
};

export default function MobileHomeView({ home }: MobileHomeViewProps) {
    const {
        videos,
        trendingVideos,
        activeLiveStreams,
        categories,
        isLoadingVideos,
        isErrorVideos,
        search,
        setSearch,
        category,
        handleSearch,
        handleCategoryChange,
    } = home;

    const { language, isPersian } = useLanguage();
    const t = translations[language].home;

    const numberFormatter = new Intl.NumberFormat(
        isPersian ? "fa-IR" : "en-US"
    );

    // Only the first six trending videos are used in the mobile carousel.
    const trendingItems = trendingVideos.slice(0, 6);

    const [activeTrendingIndex, setActiveTrendingIndex] = useState(0);

    const touchStartPosition = useRef<{
        x: number;
        y: number;
    } | null>(null);

    const swipeDetected = useRef(false);

    const activeIndex =
        trendingItems.length > 0
            ? activeTrendingIndex % trendingItems.length
            : 0;

    const activeTrendingVideo = trendingItems[activeIndex];

    // Automatically move to the next video every 10 seconds.
    useEffect(() => {
        if (trendingItems.length <= 1) {
            return;
        }

        const timer = window.setTimeout(() => {
            setActiveTrendingIndex(
                (current) => (current + 1) % trendingItems.length
            );
        }, 10_000);

        return () => window.clearTimeout(timer);
    }, [trendingItems.length, activeIndex]);

    const showNextTrending = () => {
        if (trendingItems.length <= 1) {
            return;
        }

        setActiveTrendingIndex(
            (current) => (current + 1) % trendingItems.length
        );
    };

    const showPreviousTrending = () => {
        if (trendingItems.length <= 1) {
            return;
        }

        setActiveTrendingIndex(
            (current) =>
                (current - 1 + trendingItems.length) % trendingItems.length
        );
    };

    const handleTrendingTouchStart = (
        event: TouchEvent<HTMLDivElement>
    ) => {
        const touch = event.touches[0];

        if (!touch) {
            return;
        }

        touchStartPosition.current = {
            x: touch.clientX,
            y: touch.clientY,
        };

        swipeDetected.current = false;
    };

    const handleTrendingTouchEnd = (
        event: TouchEvent<HTMLDivElement>
    ) => {
        const start = touchStartPosition.current;
        const touch = event.changedTouches[0];

        touchStartPosition.current = null;

        if (!start || !touch) {
            return;
        }

        const deltaX = start.x - touch.clientX;
        const deltaY = start.y - touch.clientY;

        // Ignore short gestures and mostly vertical scrolling.
        if (
            Math.abs(deltaX) < 45 ||
            Math.abs(deltaX) < Math.abs(deltaY) * 1.2
        ) {
            return;
        }

        swipeDetected.current = true;

        if (deltaX > 0) {
            showPreviousTrending();
        } else {
            showNextTrending();
        }
    };

    const handleTrendingSwipeClick = (
        event: React.MouseEvent<HTMLDivElement>
    ) => {
        if (swipeDetected.current) {
            event.preventDefault();
            event.stopPropagation();
            swipeDetected.current = false;
        }
    };

    return (
        <section className="px-3 py-4">
            <VideoFilters
                search={search}
                onSearchChange={setSearch}
                category={category}
                categories={categories}
                onCategoryChange={handleCategoryChange}
                onSearch={handleSearch}
            />


            {!search.trim() && trendingItems.length > 0 && (
                <section className="mb-7">
                    <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-gray-100">
                            {"\uD83D\uDD25"} {t.trendingVideos}
                        </h2>

                    <div
                        dir={isPersian ? "rtl" : "ltr"}
                        className="overflow-hidden rounded-2xl [touch-action:pan-y] select-none"
                        onTouchStart={handleTrendingTouchStart}
                        onTouchEnd={handleTrendingTouchEnd}
                        onTouchCancel={() => {
                            touchStartPosition.current = null;
                        }}
                        onClickCapture={handleTrendingSwipeClick}
                    >
                        <Link
                            key={activeTrendingVideo.id}
                            href={`/videos/${activeTrendingVideo.id}`}
                            aria-label={activeTrendingVideo.title}
                            className="group relative block aspect-video overflow-hidden rounded-2xl border border-gray-200 bg-[#181818] shadow-md dark:border-[#333]"
                        >
                            {activeTrendingVideo.thumbnail ? (
                                <img
                                    src={activeTrendingVideo.thumbnail}
                                    alt={activeTrendingVideo.title}
                                    draggable={false}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#27272a] to-[#09090b]">
                                    <span className="text-5xl text-white/50">
                                        {"\u25B6"}
                                    </span>
                                </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/5" />

                            <div className="absolute inset-x-0 bottom-0 p-4 text-start text-white">
                                <h3 className="line-clamp-2 text-base font-bold leading-7 drop-shadow-md">
                                    {activeTrendingVideo.title}
                                </h3>

                                <p className="mt-1 text-xs text-white/75">
                                    <bdi dir="ltr">
                                        {numberFormatter.format(
                                            activeTrendingVideo.views_count
                                        )}
                                    </bdi>
                                    {" "}
                                    {t.views}
                                </p>
                            </div>
                        </Link>
                    </div>

                    <div
                        className="mt-3 flex items-center justify-center gap-2"
                        role="group"
                        aria-label={
                            isPersian
                                ? "\u0627\u0646\u062A\u062E\u0627\u0628 \u0648\u06CC\u062F\u0626\u0648\u06CC \u067E\u0631\u0637\u0631\u0641\u062F\u0627\u0631"
                                : "Choose a trending video"
                        }
                    >
                        {trendingItems.map((video, index) => (
                            <button
                                key={video.id}
                                type="button"
                                onClick={() => setActiveTrendingIndex(index)}
                                aria-label={
                                    isPersian
                                        ? `\u0648\u06CC\u062F\u0626\u0648\u06CC \u067E\u0631\u0637\u0631\u0641\u062F\u0627\u0631 ${numberFormatter.format(index + 1)}`
                                        : `Trending video ${index + 1}`
                                }
                                aria-pressed={index === activeIndex}
                                className={`relative h-2 overflow-hidden rounded-full transition-all duration-300 ${
                                    index === activeIndex
                                        ? "w-6 bg-[var(--accent)]"
                                        : "w-2 bg-gray-300 hover:bg-gray-400 dark:bg-[#555] dark:hover:bg-[#777]"
                                }`}
                            >
                                {index === activeIndex && (
                                    <span
                                        className="absolute inset-0 rounded-full bg-white/65"
                                        style={{
                                            animation: "trending-dot-fill 10s linear forwards",
                                            transformOrigin: isPersian
                                                ? "right center"
                                                : "left center",
                                        }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {!search.trim() && activeLiveStreams.length > 0 && (
                <section className="mb-7">
                    <div className="mb-3 flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5 shrink-0">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
                        </span>

                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {t.liveNow}
                        </h2>
                    </div>

                    <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {activeLiveStreams.map((stream) => (
                            <div
                                key={stream.id}
                                className="w-[82%] max-w-[320px] shrink-0 snap-start"
                            >
                                <LiveStreamCard stream={stream} />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {t.latestVideos}
                </h2>

                <Link
                    href="/videos"
                    className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--accent)] transition-opacity hover:opacity-75"
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
            </div>

            {isLoadingVideos ? (
                <p
                    role="status"
                    className="py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                    {isPersian
                        ? "\u062F\u0631 \u062D\u0627\u0644 \u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC \u0648\u06CC\u062F\u0626\u0648\u0647\u0627..."
                        : "Loading videos..."}
                </p>
            ) : isErrorVideos ? (
                <p
                    role="alert"
                    className="py-8 text-center text-sm text-red-600 dark:text-red-400"
                >
                    {isPersian
                        ? "\u062F\u0631\u06CC\u0627\u0641\u062A \u0648\u06CC\u062F\u0626\u0648\u0647\u0627 \u0646\u0627\u0645\u0648\u0641\u0642 \u0628\u0648\u062F."
                        : "Failed to load videos. Please try again."}
                </p>
            ) : (
                <>
                    <div className="grid grid-cols-3 gap-2.5">
                        {videos.slice(0, 3).map((video) => (
                            <VideoCard
                                key={video.id}
                                video={video}
                                compactMobile
                            />
                        ))}
                    </div>

                    {videos.length === 0 && (
                        <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                            {t.noVideos}
                        </p>
                    )}
                </>
            )}
</section>
    );
}