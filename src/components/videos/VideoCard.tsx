"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";
import { useVideoPlayerStore } from "@/stores/useVideoPlayerStore";

interface VideoCardProps {
    video: {
        id: number;
        title: string;
        thumbnail?: string | null;
        username: string;
        views_count: number;
        duration: number;
        category_name?: string | null;
    };
}

export default function VideoCard({ video }: VideoCardProps) {
    const { language, isPersian } = useLanguage();
    const t = translations[language].home;

    const watchedSeconds = useVideoPlayerStore(
        (state) => state.progressByVideo[String(video.id)] ?? 0
    );

    const progressPercentage =
        video.duration > 0
            ? Math.min(
                  100,
                  Math.max(0, (watchedSeconds / video.duration) * 100)
              )
            : 0;

    const formattedViews = new Intl.NumberFormat(
        isPersian ? "fa-IR" : "en-US"
    ).format(video.views_count);

    return (
        <Link
            href={`/videos/${video.id}`}
            dir={isPersian ? "rtl" : "ltr"}
            className="overflow-hidden rounded-xl border border-transparent bg-white text-start shadow-sm transition-all duration-200 hover:border-[var(--accent)] hover:shadow-md dark:bg-[#181818] dark:hover:bg-[#202020]"
        >
            {video.thumbnail && (
                <div className="relative">
                    <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="h-48 w-full object-cover"
                    />

                    {progressPercentage > 0 && (
                        <div
                            className="absolute bottom-0 left-0 h-1 w-full bg-black/40"
                            role="progressbar"
                            aria-label="Video watch progress"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={Math.round(progressPercentage)}
                        >
                            <div
                                className="h-full bg-[var(--accent)] transition-[width] duration-200"
                                style={{
                                    width: `${progressPercentage}%`,
                                }}
                            />
                        </div>
                    )}
                </div>
            )}

            <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {video.title}
                </h3>

                <div className="mt-2 flex flex-wrap items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <bdi dir="auto">{video.username}</bdi>
                    <span aria-hidden="true">•</span>
                    <bdi dir="ltr">{formattedViews}</bdi>
                    <span>{t.views}</span>
                </div>

                {video.category_name && (
                    <p className="mt-2 text-xs font-medium text-[var(--accent)]">
                        {video.category_name}
                    </p>
                )}
            </div>
        </Link>
    );
}