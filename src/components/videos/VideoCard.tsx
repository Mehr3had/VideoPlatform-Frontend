"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

interface VideoCardProps {
    video: {
        id: number;
        title: string;
        thumbnail?: string | null;
        username: string;
        views_count: number;
        category_name?: string | null;
    };
}

export default function VideoCard({ video }: VideoCardProps) {
    const { language, isPersian } = useLanguage();
    const t = translations[language].home;

    const formattedViews = new Intl.NumberFormat(
        isPersian ? "fa-IR" : "en-US"
    ).format(video.views_count);

    return (
        <Link
            href={`/videos/${video.id}`}
            dir={isPersian ? "rtl" : "ltr"}
            className="overflow-hidden rounded-xl bg-white text-start shadow-sm transition hover:shadow-md dark:bg-[#181818] dark:hover:bg-[#202020]"
        >
            {video.thumbnail && (
                <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="h-48 w-full object-cover"
                />
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
                    <p className="mt-2 text-xs font-medium text-red-700 dark:text-red-400">
                        {video.category_name}
                    </p>
                )}
            </div>
        </Link>
    );
}