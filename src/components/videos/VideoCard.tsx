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
        user_id?: number;
        profile_image?: string | null;
        created_at?: string;
        views_count: number;
        duration: number;
        category_name?: string | null;
    };
    compactMobile?: boolean;
}

function formatRelativeUploadTime(
    dateValue: string,
    isPersian: boolean
): string | null {
    const timestamp = new Date(dateValue).getTime();

    if (!Number.isFinite(timestamp)) {
        return null;
    }

    const elapsedSeconds = Math.max(
        0,
        (Date.now() - timestamp) / 1000
    );

    const formatter = new Intl.RelativeTimeFormat(
        isPersian ? "fa-IR" : "en-US",
        { numeric: "always" }
    );

    if (elapsedSeconds < 60) {
        return formatter.format(
            -Math.max(1, Math.floor(elapsedSeconds)),
            "second"
        );
    }

    if (elapsedSeconds < 3600) {
        return formatter.format(
            -Math.floor(elapsedSeconds / 60),
            "minute"
        );
    }

    if (elapsedSeconds < 86400) {
        return formatter.format(
            -Math.floor(elapsedSeconds / 3600),
            "hour"
        );
    }

    if (elapsedSeconds < 7 * 86400) {
        return formatter.format(
            -Math.floor(elapsedSeconds / 86400),
            "day"
        );
    }

    if (elapsedSeconds < 30 * 86400) {
        return formatter.format(
            -Math.floor(elapsedSeconds / (7 * 86400)),
            "week"
        );
    }

    if (elapsedSeconds < 365 * 86400) {
        return formatter.format(
            -Math.floor(elapsedSeconds / (30 * 86400)),
            "month"
        );
    }

    return formatter.format(
        -Math.floor(elapsedSeconds / (365 * 86400)),
        "year"
    );
}

export default function VideoCard({ video, compactMobile = false }: VideoCardProps) {
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

    const relativeUploadTime = video.created_at
        ? formatRelativeUploadTime(video.created_at, isPersian)
        : null;

    const uploaderContent = (
        <>
            {video.profile_image ? (
                <img
                    src={video.profile_image}
                    alt=""
                    className="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-transparent transition group-hover:ring-[var(--accent)] md:h-9 md:w-9"
                />
            ) : (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600 transition group-hover:bg-[var(--accent)]/10 group-hover:text-[var(--accent)] dark:bg-[#303030] dark:text-gray-300 md:h-9 md:w-9 md:text-sm">
                    {video.username.charAt(0).toUpperCase()}
                </span>
            )}

            <span className="truncate transition-colors group-hover:text-[var(--accent)]">
                <bdi dir="auto">{video.username}</bdi>
            </span>
        </>
    );

    return (
        <article
            dir={isPersian ? "rtl" : "ltr"}
            className="overflow-hidden rounded-xl border border-transparent bg-white text-start shadow-sm transition-all duration-200 hover:border-[var(--accent)] hover:shadow-md dark:bg-[#181818] dark:hover:bg-[#202020]"
        >
            {video.thumbnail && (
                <Link
                    href={`/videos/${video.id}`}
                    aria-label={video.title}
                    className="block"
                >
                    <div className="relative">
                        <img
                            src={video.thumbnail}
                            alt={video.title}
                            className={compactMobile ? "aspect-[4/3] h-auto w-full object-cover md:aspect-auto md:h-48" : "aspect-video h-auto w-full object-cover md:aspect-auto md:h-48"}
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
                </Link>
            )}

            <div className={compactMobile ? "p-2 md:p-5" : "p-2.5 md:p-5"}>
                <h3 className={compactMobile ? "line-clamp-2 text-[11px] font-semibold leading-4 text-gray-900 dark:text-gray-100 md:text-lg md:leading-normal" : "text-sm font-semibold text-gray-900 dark:text-gray-100 md:text-lg"}>
                    <Link
                        href={`/videos/${video.id}`}
                        className="transition-colors hover:text-[var(--accent)]"
                    >
                        {video.title}
                    </Link>
                </h3>

                {compactMobile && (
                <div className="mt-1.5 flex min-w-0 flex-col gap-2.5 text-[10px] md:hidden">
                    <div className="flex min-w-0 items-center gap-1">
                        {video.user_id ? (
                            <Link
                                href={`/profile/${video.user_id}`}
                                title={video.username}
                                aria-label={video.username}
                                className="group flex min-w-0 flex-1 items-center gap-1 rounded-full"
                            >
                                {video.profile_image ? (
                                    <img
                                        src={video.profile_image}
                                        alt=""
                                        className="h-5 w-5 shrink-0 rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[9px] font-semibold text-gray-600 dark:bg-[#303030] dark:text-gray-300">
                                        {video.username.charAt(0).toUpperCase()}
                                    </span>
                                )}

                                <span className="min-w-0 truncate text-[10px] text-gray-600 dark:text-gray-300">
                                    <bdi dir="auto">{video.username}</bdi>
                                </span>
                            </Link>
                        ) : (
                            <div className="flex min-w-0 flex-1 items-center gap-1">
                                {video.profile_image ? (
                                    <img
                                        src={video.profile_image}
                                        alt=""
                                        className="h-5 w-5 shrink-0 rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[9px] font-semibold text-gray-600 dark:bg-[#303030] dark:text-gray-300">
                                        {video.username.charAt(0).toUpperCase()}
                                    </span>
                                )}

                                <span className="min-w-0 truncate text-[10px] text-gray-600 dark:text-gray-300">
                                    <bdi dir="auto">{video.username}</bdi>
                                </span>
                            </div>
                        )}

                        <span
                            title={t.views}
                            className="flex shrink-0 items-center gap-0.5 text-[9px] text-gray-500 dark:text-gray-400"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                                className="h-3 w-3 shrink-0"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>

                            <bdi dir="ltr">{formattedViews}</bdi>
                        </span>
                    </div>

                    <div className="flex min-w-0 items-center justify-between gap-1 text-[9px] text-gray-500 dark:text-gray-400">
                        {video.category_name ? (
                            <span className="min-w-0 flex-1 truncate font-medium text-[var(--accent)]">
                                {video.category_name}
                            </span>
                        ) : (
                            <span className="min-w-0 flex-1" />
                        )}

                        {relativeUploadTime && (
                            <time
                                dateTime={video.created_at}
                                className="shrink-0"
                            >
                                <bdi dir="auto">{relativeUploadTime}</bdi>
                            </time>
                        )}
                    </div>
                </div>
            )}
<div className={`${compactMobile ? "hidden md:flex " : ""}mt-2 flex min-w-0 flex-col items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400 md:mt-3 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-x-3 md:gap-y-2 md:text-sm`}>
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                        {video.user_id ? (
                            <Link
                                href={`/profile/${video.user_id}`}
                                title={video.username}
                                aria-label={video.username}
                                className="group flex min-w-0 cursor-pointer items-center gap-2 rounded-full outline-none transition-colors hover:text-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                            >
                                {uploaderContent}
                            </Link>
                        ) : (
                            <div className="flex min-w-0 items-center gap-2">
                                {uploaderContent}
                            </div>
                        )}

                        <span aria-hidden="true">
                            {"\u2022"}
                        </span>

                        <span className="shrink-0">
                            <bdi dir="ltr">{formattedViews}</bdi>{" "}
                            {t.views}
                        </span>
                    </div>

                    {relativeUploadTime && (
                        <time
                            dateTime={video.created_at}
                            className="shrink-0 text-xs text-gray-500 dark:text-gray-400"
                        >
                            <bdi dir="auto">{relativeUploadTime}</bdi>
                        </time>
                    )}
                </div>

                {video.category_name && (
                    <p className={`${compactMobile ? "hidden md:block " : ""}mt-1 text-[11px] font-medium text-[var(--accent)] md:mt-2 md:text-xs`}>
                        {video.category_name}
                    </p>
                )}
            </div>
        </article>
    );
}