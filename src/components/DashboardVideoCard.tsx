"use client";

import Link from "next/link";
import type { DashboardVideo } from "@/hooks/useDashboard";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

interface DashboardVideoCardProps {
    video: DashboardVideo;
    onDelete: (videoId: number) => void;
}

export default function DashboardVideoCard({
    video,
    onDelete,
}: DashboardVideoCardProps) {
    const { language, isPersian } = useLanguage();
    const t = translations[language].dashboard;

    const numberFormatter = new Intl.NumberFormat(
        isPersian ? "fa-IR" : "en-US"
    );

    return (
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-6">
            {video.thumbnail ? (
                <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="aspect-video w-full rounded-lg object-cover sm:h-28 sm:w-48 sm:shrink-0"
                />
            ) : (
                <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-gray-200 text-gray-500 sm:h-28 sm:w-48 sm:shrink-0 dark:bg-[#303030] dark:text-gray-400">
                    {t.noThumbnail}
                </div>
            )}

            <div className="min-w-0 flex-1">
                <Link
                    href={`/videos/${video.id}`}
                    className="break-words text-base font-semibold text-gray-900 hover:text-red-700 sm:text-lg dark:text-gray-100 dark:hover:text-red-400"
                >
                    {video.title}
                </Link>

                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {numberFormatter.format(video.views_count)} {t.views}
                </p>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>
                        👍 {numberFormatter.format(video.likes_count)}
                    </span>
                    <span>
                        👎 {numberFormatter.format(video.dislikes_count)}
                    </span>
                    <span>
                        💬 {numberFormatter.format(video.comments_count)}
                    </span>
                </div>

                {video.description && (
                    <p
                        dir="auto"
                        className="mt-2 line-clamp-2 break-words text-sm text-gray-500 dark:text-gray-400"
                    >
                        {video.description}
                    </p>
                )}
            </div>

            <div className="flex w-full gap-3 sm:w-auto sm:shrink-0">
                <Link
                    href={`/dashboard/edit/${video.id}`}
                    className="flex flex-1 items-center justify-center rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:flex-none sm:px-4 dark:border-[#404040] dark:text-gray-300 dark:hover:bg-[#252525]"
                >
                    {t.edit}
                </Link>

                <button
                    type="button"
                    onClick={() => onDelete(video.id)}
                    className="flex flex-1 items-center justify-center rounded-lg border border-red-700 px-3 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 sm:flex-none sm:px-4 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-950"
                >
                    {t.delete}
                </button>
            </div>
        </div>
    );
}