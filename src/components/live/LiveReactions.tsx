"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { isAxiosError } from "axios";
import { axiosClient } from "@/lib/axios";
import { ensureAccessToken } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

interface LiveReactionsProps {
    liveId: number;
    isLive: boolean;
    canReport: boolean;
}

interface ReactionData {
    likes_count: number;
    dislikes_count: number;
    user_reaction: "like" | "dislike" | null;
}

type ReportReason =
    | "spam"
    | "harassment"
    | "hate_speech"
    | "inappropriate"
    | "misinformation"
    | "other";

export default function LiveReactions({
    liveId,
    isLive,
    canReport,
}: LiveReactionsProps) {
    const { isPersian } = useLanguage();
    const isFa = isPersian;

    const [reactions, setReactions] = useState<ReactionData>({
        likes_count: 0,
        dislikes_count: 0,
        user_reaction: null,
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [reportOpen, setReportOpen] = useState(false);
    const [reportReason, setReportReason] =
        useState<ReportReason>("spam");
    const [reportDetails, setReportDetails] = useState("");
    const [reportSubmitting, setReportSubmitting] = useState(false);
    const [reportError, setReportError] = useState("");
    const [reportSuccess, setReportSuccess] = useState(false);
    const [hasReported, setHasReported] = useState(false);

    const [shareMessage, setShareMessage] = useState("");

    const reactionUrl = `/live/${liveId}/react/`;

    const reportReasons: {
        value: ReportReason;
        label: string;
    }[] = [
        { value: "spam", label: isFa ? "هرزنامه" : "Spam" },
        {
            value: "harassment",
            label: isFa ? "آزار و اذیت یا قلدری" : "Harassment or bullying",
        },
        {
            value: "hate_speech",
            label: isFa ? "نفرت‌پراکنی" : "Hate speech",
        },
        {
            value: "inappropriate",
            label: isFa ? "محتوای نامناسب" : "Inappropriate content",
        },
        {
            value: "misinformation",
            label: isFa ? "اطلاعات گمراه‌کننده" : "Misinformation",
        },
        { value: "other", label: isFa ? "سایر موارد" : "Other" },
    ];

    const loadReactions = useCallback(async () => {
        try {
            await ensureAccessToken();

            const response = await axiosClient.get<ReactionData>(
                reactionUrl
            );

            setReactions(response.data);
            setError("");
        } catch (requestError: unknown) {
            if (isAxiosError(requestError)) {
                setError(
                    isFa
                        ? "دریافت واکنش‌ها ناموفق بود."
                        : "Could not load reactions."
                );
            }

            console.error("Live reactions error:", requestError);
        } finally {
            setLoading(false);
        }
    }, [reactionUrl, isFa]);

    useEffect(() => {
        let cancelled = false;
        let requestInFlight = false;
        let intervalId: number | undefined;

        const load = async () => {
            if (cancelled || requestInFlight) return;

            requestInFlight = true;

            try {
                if (!cancelled) {
                    await loadReactions();
                }
            } finally {
                requestInFlight = false;
            }
        };

        void load();

        if (isLive) {
            intervalId = window.setInterval(() => {
                void load();
            }, 5000);
        }

        return () => {
            cancelled = true;

            if (intervalId !== undefined) {
                window.clearInterval(intervalId);
            }
        };
    }, [isLive, loadReactions]);

    const handleReaction = async (
        reaction: "like" | "dislike"
    ) => {
        if (!isLive || submitting) return;

        setSubmitting(true);
        setError("");

        try {
            const token = await ensureAccessToken();

            if (!token) {
                setError(
                    isFa
                        ? "برای ثبت واکنش ابتدا وارد حساب کاربری شو."
                        : "Please sign in to react."
                );
                return;
            }

            const response = reactions.user_reaction === reaction
                ? await axiosClient.delete<ReactionData>(reactionUrl)
                : await axiosClient.post<ReactionData>(
                    reactionUrl,
                    { reaction }
                );

            setReactions(response.data);
        } catch (requestError: unknown) {
            if (
                isAxiosError(requestError) &&
                requestError.response?.status === 401
            ) {
                setError(
                    isFa
                        ? "برای لایک یا دیسلایک باید وارد حساب کاربری شوی."
                        : "Please sign in to like or dislike."
                );
            } else if (
                isAxiosError(requestError) &&
                requestError.response?.status === 409
            ) {
                setError(
                    isFa
                        ? "این پخش زنده به پایان رسیده است."
                        : "This live stream has ended."
                );
            } else {
                setError(
                    isFa
                        ? "ثبت واکنش ناموفق بود."
                        : "Could not save your reaction."
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    const copyLiveLink = async () => {
        const url = window.location.href;

        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(url);
            setShareMessage(
                isFa ? "پیوند پخش زنده کپی شد." : "Live link copied."
            );
        } else {
            window.prompt(
                isFa ? "پیوند پخش زنده:" : "Live stream link:",
                url
            );
        }
    };

    const handleShare = async () => {
        setShareMessage("");

        const shareData = {
            title: document.title,
            text: isFa
                ? "این پخش زنده رو ببین!"
                : "Watch this live stream!",
            url: window.location.href,
        };

        try {
            if (typeof navigator.share === "function") {
                await navigator.share(shareData);
                return;
            }

            await copyLiveLink();
        } catch (shareError) {
            if (
                shareError instanceof DOMException &&
                shareError.name === "AbortError"
            ) {
                return;
            }

            try {
                await copyLiveLink();
            } catch (copyError) {
                console.error("Live share error:", copyError);
                setShareMessage(
                    isFa
                        ? "اشتراک‌گذاری ناموفق بود."
                        : "Sharing failed."
                );
            }
        }
    };

    const handleReportSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!canReport || reportSubmitting || hasReported) return;

        if (reportDetails.length > 500) {
            setReportError(
                isFa
                    ? "توضیحات نباید بیشتر از ۵۰۰ کاراکتر باشد."
                    : "Details must be 500 characters or less."
            );
            return;
        }

        setReportSubmitting(true);
        setReportError("");

        try {
            const token = await ensureAccessToken();

            if (!token) {
                setReportError(
                    isFa
                        ? "لطفاً ابتدا وارد حساب کاربری شو."
                        : "Please log in first."
                );
                return;
            }

            await axiosClient.post(
                `/live/${liveId}/report/`,
                {
                    reason: reportReason,
                    details: reportDetails.trim(),
                }
            );

            setHasReported(true);
            setReportSuccess(true);
            setReportOpen(false);
            setReportDetails("");
            setReportError("");
        } catch (requestError: unknown) {
            if (
                isAxiosError(requestError) &&
                requestError.response?.status === 409
            ) {
                setReportError(
                    isFa
                        ? "قبلاً این پخش زنده را گزارش کرده‌ای."
                        : "You have already reported this live stream."
                );
            } else if (
                isAxiosError(requestError) &&
                requestError.response?.status === 401
            ) {
                setReportError(
                    isFa
                        ? "لطفاً ابتدا وارد حساب کاربری شو."
                        : "Please log in first."
                );
            } else {
                const responseData = isAxiosError(requestError)
                    ? requestError.response?.data as
                        | { error?: string }
                        | undefined
                    : undefined;

                setReportError(
                    responseData?.error ||
                    (isFa
                        ? "ارسال گزارش ناموفق بود."
                        : "Could not submit the report.")
                );
            }

            console.error("Live report error:", requestError);
        } finally {
            setReportSubmitting(false);
        }
    };

    return (
        <div className="mt-4">
            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={() => void handleReaction("like")}
                    disabled={!isLive || submitting || loading}
                    aria-pressed={reactions.user_reaction === "like"}
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        reactions.user_reaction === "like"
                            ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-[#383838] dark:bg-[#181818] dark:text-gray-200 dark:hover:bg-[#282828]"
                    }`}
                >
                    <span className="text-lg" aria-hidden="true">👍</span>
                    <span>
                        {reactions.likes_count.toLocaleString(
                            isFa ? "fa-IR" : "en-US"
                        )}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => void handleReaction("dislike")}
                    disabled={!isLive || submitting || loading}
                    aria-pressed={reactions.user_reaction === "dislike"}
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        reactions.user_reaction === "dislike"
                            ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-[#383838] dark:bg-[#181818] dark:text-gray-200 dark:hover:bg-[#282828]"
                    }`}
                >
                    <span className="text-lg" aria-hidden="true">👎</span>
                    <span>
                        {reactions.dislikes_count.toLocaleString(
                            isFa ? "fa-IR" : "en-US"
                        )}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => void handleShare()}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-[#383838] dark:bg-[#181818] dark:text-gray-200 dark:hover:bg-[#282828]"
                >
                    <span aria-hidden="true">🔗</span>
                    {isFa ? "اشتراک‌گذاری" : "Share"}
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setReportError("");
                        setReportSuccess(false);
                        setReportOpen(true);
                    }}
                    disabled={!canReport || reportSubmitting || hasReported}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#383838] dark:bg-[#181818] dark:text-gray-200 dark:hover:border-red-900 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                >
                    <span aria-hidden="true">🚩</span>
                    {hasReported
                        ? isFa ? "گزارش ثبت شد" : "Reported"
                        : isFa ? "گزارش پخش زنده" : "Report live"}
                </button>

                {!isLive && (
                    <span className="text-xs text-gray-400">
                        {isFa
                            ? "واکنش‌ها پس از پایان پخش غیرفعال هستند."
                            : "Reactions are disabled after the stream ends."}
                    </span>
                )}
            </div>

            {error && (
                <p role="alert" className="mt-2 text-xs text-red-500">
                    {error}
                </p>
            )}

            {shareMessage && (
                <p role="status" className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {shareMessage}
                </p>
            )}

            {reportSuccess && (
                <p role="status" className="mt-2 text-xs text-green-600 dark:text-green-400">
                    {isFa
                        ? "گزارش با موفقیت ثبت شد. ممنون از اطلاع‌رسانی."
                        : "Your report was submitted successfully. Thank you."}
                </p>
            )}

            {reportOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
                    role="presentation"
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="live-report-title"
                        dir={isFa ? "rtl" : "ltr"}
                        className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-[#383838] dark:bg-[#181818] sm:p-6"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <h2
                                id="live-report-title"
                                className="text-lg font-bold text-gray-900 dark:text-gray-100"
                            >
                                {isFa
                                    ? "گزارش پخش زنده"
                                    : "Report live stream"}
                            </h2>

                            <button
                                type="button"
                                onClick={() => setReportOpen(false)}
                                aria-label={isFa ? "بستن" : "Close"}
                                className="rounded-lg px-3 py-1 text-xl text-gray-500 transition hover:bg-gray-100 dark:hover:bg-[#303030]"
                            >
                                ×
                            </button>
                        </div>

                        <form
                            onSubmit={handleReportSubmit}
                            className="mt-5 space-y-4"
                        >
                            <div>
                                <label
                                    htmlFor="live-report-reason"
                                    className="mb-2 block text-sm font-medium"
                                >
                                    {isFa ? "دلیل گزارش" : "Report reason"}
                                </label>

                                <select
                                    id="live-report-reason"
                                    value={reportReason}
                                    onChange={(event) =>
                                        setReportReason(
                                            event.target.value as ReportReason
                                        )
                                    }
                                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none focus:border-[var(--accent)] dark:border-[#444444] dark:bg-[#202020] dark:text-gray-100"
                                >
                                    {reportReasons.map((reason) => (
                                        <option
                                            key={reason.value}
                                            value={reason.value}
                                        >
                                            {reason.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="live-report-details"
                                    className="mb-2 block text-sm font-medium"
                                >
                                    {isFa
                                        ? "توضیحات بیشتر (اختیاری)"
                                        : "Additional details (optional)"}
                                </label>

                                <textarea
                                    id="live-report-details"
                                    value={reportDetails}
                                    onChange={(event) =>
                                        setReportDetails(event.target.value)
                                    }
                                    maxLength={500}
                                    rows={4}
                                    placeholder={
                                        isFa
                                            ? "جزئیات بیشتری درباره دلیل گزارش بنویس..."
                                            : "Tell us more about the issue..."
                                    }
                                    className="w-full resize-y rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[var(--accent)] dark:border-[#444444] dark:bg-[#202020] dark:text-gray-100"
                                />

                                <p className="mt-1 text-end text-xs text-gray-400">
                                    {reportDetails.length}/500
                                </p>
                            </div>

                            {reportError && (
                                <p
                                    role="alert"
                                    className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400"
                                >
                                    {reportError}
                                </p>
                            )}

                            <div className="flex flex-wrap justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setReportOpen(false)}
                                    disabled={reportSubmitting}
                                    className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium transition hover:bg-gray-100 disabled:opacity-50 dark:border-[#444444] dark:hover:bg-[#252525]"
                                >
                                    {isFa ? "انصراف" : "Cancel"}
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        reportSubmitting ||
                                        reportDetails.length > 500
                                    }
                                    className="rounded-xl bg-red-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {reportSubmitting
                                        ? isFa ? "در حال ارسال..." : "Submitting..."
                                        : isFa ? "ارسال گزارش" : "Submit report"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}