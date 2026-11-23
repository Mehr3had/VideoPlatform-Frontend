"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import type { ActiveLiveStream } from "@/hooks/useHomeVideos";

interface LiveStreamCardProps {
    stream: ActiveLiveStream;
}

export default function LiveStreamCard({ stream }: LiveStreamCardProps) {
    const { isPersian } = useLanguage();

    return (
        <Link
            href={`/live/${stream.id}`}
            dir={isPersian ? "rtl" : "ltr"}
            aria-label={`${stream.title} - LIVE`}
            className="group overflow-hidden rounded-xl border border-transparent bg-white text-start shadow-sm transition-all duration-200 hover:border-red-500 hover:shadow-md dark:bg-[#181818] dark:hover:bg-[#202020]"
        >
            <div className="relative aspect-video overflow-hidden bg-gray-200 dark:bg-[#252525]">
                {stream.thumbnail ? (
                    <img
                        src={stream.thumbnail}
                        alt={stream.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#252525] to-[#111111]">
                        <span className="text-3xl font-bold tracking-widest text-white/30">
                            LIVE
                        </span>
                    </div>
                )}

                <span className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-1 text-xs font-bold tracking-wide text-white shadow-lg">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                    LIVE
                </span>
            </div>

            <div className="p-3 md:p-4">
                <h3 className="line-clamp-2 text-base font-semibold text-gray-900 dark:text-gray-100 md:text-lg">
                    {stream.title}
                </h3>

                <div className="mt-2 flex min-w-0 items-center gap-2 md:mt-3">
                    {stream.owner.profile_image ? (
                        <img
                            src={stream.owner.profile_image}
                            alt={stream.owner.username}
                            loading="lazy"
                            className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-gray-200 dark:ring-[#404040]"
                        />
                    ) : (
                        <div
                            aria-hidden="true"
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-600 dark:bg-[#303030] dark:text-gray-300"
                        >
                            {stream.owner.username.slice(0, 1).toUpperCase()}
                        </div>
                    )}

                    <p className="flex min-w-0 flex-wrap items-center gap-1 text-xs text-gray-500 dark:text-gray-400 md:text-sm">
                        <span>
                            {isPersian ? "در حال پخش از" : "Streaming from"}
                        </span>
                        <bdi dir="auto" className="font-medium text-gray-700 dark:text-gray-300">
                            {stream.owner.username}
                        </bdi>
                    </p>
                </div>
            </div>
        </Link>
    );
}