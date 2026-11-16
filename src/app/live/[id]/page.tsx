"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { isAxiosError } from "axios";
import { ensureAccessToken } from "@/lib/api";
import Navbar from "@/components/Navbar";
import LivePlayer from "@/components/live/LivePlayer";
import { useLanguage } from "@/context/LanguageContext";
import { axiosClient } from "@/lib/axios";
import LiveChat from "@/components/live/LiveChat";
import LiveReactions from "@/components/live/LiveReactions";
import LiveChannelInfo from "@/components/live/LiveChannelInfo";

interface LiveStreamDetails {
    id: number;
    title: string;
    description: string;
    thumbnail: string | null;
    status: "draft" | "live" | "ended" | "failed";
    owner: {
        id: number;
        username: string;
    };
    started_at: string | null;
    ended_at: string | null;
    archive_status: "pending" | "processing" | "completed" | "failed";
    archive_video: {
        id: number;
        title: string;
    } | null;
    hls_url: string | null;
}

type PageError = "notFound" | "loadFailed" | null;

export default function LiveWatchPage() {
    const params = useParams<{ id: string }>();
    const liveId = params.id;
    const { language, isPersian } = useLanguage();
    const isFa = language === "fa";
    const [stream, setStream] =
        useState<LiveStreamDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<PageError>(null);

    useEffect(() => {
        let cancelled = false;
        let requestInFlight = false;
        let intervalId: number | undefined;

        const loadStream = async (initialLoad = false) => {
            if (cancelled || requestInFlight) return;

            requestInFlight = true;

            if (initialLoad) {
                setLoading(true);
                setError(null);
            }

            try {
                // Restore authentication when opening the page.
                await ensureAccessToken();

                if (cancelled) return;

                const response =
                    await axiosClient.get<LiveStreamDetails>(
                        `/live/${encodeURIComponent(liveId)}/`
                    );

                if (cancelled) return;

                const updatedStream = response.data;

                setStream(updatedStream);
                setError(null);

                // Stop polling when the stream has reached a final state.
                const archiveFinished =
                    updatedStream.status === "ended" &&
                    (
                        updatedStream.archive_status === "completed" ||
                        updatedStream.archive_status === "failed"
                    );

                if (
                    updatedStream.status === "failed" ||
                    archiveFinished
                ) {
                    if (intervalId !== undefined) {
                        window.clearInterval(intervalId);
                        intervalId = undefined;
                    }
                }

            } catch (requestError: unknown) {
                if (!cancelled && initialLoad) {
                    if (
                        isAxiosError(requestError) &&
                        requestError.response?.status === 404
                    ) {
                        setError("notFound");

                        if (intervalId !== undefined) {
                            window.clearInterval(intervalId);
                            intervalId = undefined;
                        }
                    } else {
                        setError("loadFailed");
                    }
                }
            } finally {
                requestInFlight = false;

                if (!cancelled && initialLoad) {
                    setLoading(false);
                }
            }
        };

        if (liveId && /^[1-9]\d*$/.test(liveId)) {
            // Check the stream status every 5 seconds.
            intervalId = window.setInterval(() => {
                void loadStream(false);
            }, 5000);

            void loadStream(true);
        } else {
            setError("notFound");
            setLoading(false);
        }

        return () => {
            cancelled = true;

            if (intervalId !== undefined) {
                window.clearInterval(intervalId);
            }
        };
    }, [liveId]);

    const pageClass =
        "min-h-screen bg-gray-100 text-gray-900 dark:bg-[#0f0f0f] dark:text-gray-100";

    const sectionClass =
        "mx-auto w-full max-w-5xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10";

    if (loading) {
        return (
            <main dir={isPersian ? "rtl" : "ltr"} className={pageClass}>
                <Navbar />
                <div className={sectionClass}>
                    <p className="py-10 text-center text-gray-600 dark:text-gray-300">
                        {isFa
                            ? "در حال دریافت اطلاعات پخش زنده..."
                            : "Loading live stream..."}
                    </p>
                </div>
            </main>
        );
    }

    if (error || !stream) {
        return (
            <main dir={isPersian ? "rtl" : "ltr"} className={pageClass}>
                <Navbar />
                <section className={sectionClass}>
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center dark:border-[#303030] dark:bg-[#181818]">
                        <h1 className="text-xl font-bold">
                            {error === "notFound"
                                ? isFa
                                    ? "پخش زنده پیدا نشد"
                                    : "Live stream not found"
                                : isFa
                                    ? "دریافت اطلاعات ناموفق بود"
                                    : "Unable to load live stream"}
                        </h1>

                        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                            {error === "notFound"
                                ? isFa
                                    ? "این پخش زنده وجود ندارد یا در دسترس عموم نیست."
                                    : "This stream does not exist or is not publicly available."
                                : isFa
                                    ? "لطفاً دوباره صفحه را بارگذاری کن."
                                    : "Please try refreshing the page."}
                        </p>

                        <Link
                            href="/dashboard"
                            className="accent-button mt-6 inline-flex cursor-pointer items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition hover:brightness-110"
                        >
                            {isFa ? "بازگشت به داشبورد" : "Back to dashboard"}
                        </Link>
                    </div>
                </section>
            </main>
        );
    }

    const isLive = stream.status === "live";
    const isEnded = stream.status === "ended";

    return (
        <main dir={isPersian ? "rtl" : "ltr"} className={pageClass}>
            <Navbar />

            <section className={sectionClass}>
                {/* Back button and live status */}
                <div className="mb-5 flex items-center justify-between">
                    <Link
                        href="/dashboard"
                        className="accent-button inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-sm transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0f0f0f]"
                    >
                        <span aria-hidden="true">
                            {isFa ? "→" : "←"}
                        </span>
                        {isFa ? "بازگشت به داشبورد" : "Back to dashboard"}
                    </Link>

                    {isLive && (
                        <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                            {isFa ? "پخش زنده" : "LIVE"}
                        </span>
                    )}
                </div>

                {/* Main player and chat layout */}
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">

                    {/* Player and stream information */}
                    <div className="min-w-0">
                        {isLive && stream.hls_url ? (
                            <LivePlayer
                                src={stream.hls_url}
                                errorText={
                                    isFa
                                        ? "دریافت تصویر زنده با مشکل مواجه شد. اتصال پخش را بررسی کن."
                                        : "The live video could not be loaded. Please check the stream connection."
                                }
                            />
                        ) : (
                            <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl bg-gray-900 px-5 text-center text-white">

                                {stream.thumbnail && (
                                    <img
                                        src={stream.thumbnail}
                                        alt=""
                                        aria-hidden="true"
                                        className="absolute inset-0 h-full w-full object-cover"
                                    />
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/30" />
                                <div className="relative z-10 max-w-md rounded-2xl px-5 py-4">
                                    <span className="mb-4 block text-4xl">
                                        {isEnded
                                            ? "⏹️"
                                            : stream.status === "failed"
                                                ? "⚠️"
                                                : "📡"}
                                    </span>

                                    <h2 className="text-lg font-bold leading-relaxed sm:text-xl">
                                        {isEnded
                                            ? isFa
                                                ? "این پخش زنده به پایان رسیده است"
                                                : "This live stream has ended"
                                            : stream.status === "failed"
                                                ? isFa
                                                    ? "پخش زنده با خطا متوقف شده است"
                                                    : "The live stream failed"
                                                : isFa
                                                    ? "منتظر شروع پخش زنده هستیم..."
                                                    : "Waiting for the live stream to start..."}
                                    </h2>

                                    {isEnded && stream.archive_video && (
                                        <Link
                                            href={`/videos/${stream.archive_video.id}`}
                                            className="accent-button mt-5 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition hover:brightness-110"
                                        >
                                            {isFa ? "تماشای نسخه ضبط‌شده" : "Watch recording"}
                                        </Link>
                                    )}

                                    {isEnded && !stream.archive_video && (
                                        <p className="mt-3 text-sm text-gray-200">
                                            {stream.archive_status === "processing"
                                                ? isFa
                                                    ? "در حال آماده‌سازی نسخه ضبط‌شده..."
                                                    : "The recording is being prepared..."
                                                : stream.archive_status === "failed"
                                                    ? isFa
                                                        ? "ساخت نسخه ضبط‌شده با مشکل مواجه شده است."
                                                        : "The recording could not be created."
                                                    : isFa
                                                        ? "نسخه ضبط‌شده هنوز آماده نیست."
                                                        : "The recording is not ready yet."}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Stream details */}
                        <div className="mt-5">
                            <h1 className="text-xl font-bold leading-snug sm:text-2xl">
                                {stream.title}
                            </h1>

                            <div className="mt-5 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-[#303030] dark:bg-[#181818] sm:flex-row sm:items-center sm:justify-between">
                                <LiveChannelInfo
                                    ownerId={stream.owner.id}
                                    fallbackUsername={stream.owner.username}
                                />

                                {stream.started_at && (
                                    <p className="shrink-0 text-sm text-gray-500 dark:text-gray-400">
                                        {isFa ? "شروع پخش:" : "Started:"}
                                        {" "}
                                        {new Date(stream.started_at).toLocaleString(
                                            isFa ? "fa-IR" : "en-US"
                                        )}
                                    </p>
                                )}
                            </div>

                            <LiveReactions
                                liveId={stream.id}
                                isLive={isLive}
                                canReport={isLive || isEnded}
                            />

                           {stream.description && (
                                <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 dark:border-[#303030] dark:bg-[#181818] sm:p-5">
                                    <h2 className="mb-2 text-sm font-bold">
                                        {isFa ? "درباره این پخش" : "About this stream"}
                                    </h2>

                                    <p className="whitespace-pre-wrap text-sm leading-7 text-gray-600 dark:text-gray-300">
                                        {stream.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Live chat */}
                    <LiveChat
                        liveId={stream.id}
                        isLive={isLive}
                        canReport={isLive || isEnded}
                    />
                </div>
            </section>
        </main>
    );
}
