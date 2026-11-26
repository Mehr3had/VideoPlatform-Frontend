"use client";

import { useState, useRef } from "react";
import { useVideoDetail } from "@/hooks/useVideoDetail";
import CommentItem, {
    CommentContent,
} from "@/components/comments/CommentItem";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";
import VideoPlayer from "@/components/videos/VideoPlayer";
import { PISHI_STICKERS } from "@/lib/stickers";
import ConfirmDeleteComment from "@/components/comments/ConfirmDeleteComment";
import CommentErrorDialog from "@/components/comments/CommentErrorDialog";
import ShareVideoSuccessDialog from "@/components/videos/ShareVideoSuccessDialog";

export default function VideoDetailPage() {
    const { language, isPersian } = useLanguage();
    const t = translations[language].videoDetail;

    const {
        videoId,
        video,
        channel,
        currentUserId,
        likesCount,
        dislikesCount,
        userReaction,
        handleReaction,
        comments,
        commentText,
        setCommentText,
        commentError,
        clearCommentError,
        isQuestion,
        setIsQuestion,
        spoilerRanges,
        setSpoilerRanges,
        submittingComment,
        reactingCommentIds,
        replyingTo,
        setReplyingTo,
        handleCommentSubmit,
        loading,
        error,
        handleSubscribe,
        subscribing,
        handleCommentReaction,
        handleEditComment,
        handleDeleteComment,
        submittingReport,
        handleReportComment,
        submittingVideoReport,
        handleReportVideo,
    } = useVideoDetail();

    const [shareDialog, setShareDialog] = useState<{
        url: string;
        status: "success" | "error";
    } | null>(null);

    const copyVideoLink = async (url: string) => {
        let copied = false;

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(url);
                copied = true;
            }
        } catch {
            // Try the fallback below.
        }

        if (!copied) {
            const textArea = document.createElement("textarea");
            textArea.value = url;
            textArea.setAttribute("readonly", "");
            textArea.style.position = "fixed";
            textArea.style.opacity = "0";
            document.body.appendChild(textArea);

            try {
                textArea.select();
                copied = document.execCommand("copy");
            } catch {
                copied = false;
            } finally {
                textArea.remove();
            }
        }

        setShareDialog({
            url,
            status: copied ? "success" : "error",
        });
    };

    const handleShareVideo = () => {
        void copyVideoLink(window.location.href);
    };

    const commentFormRef = useRef<HTMLFormElement>(null);
    const commentTextareaRef = useRef<HTMLTextAreaElement>(null);
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editingCommentText, setEditingCommentText] = useState("");
    const [editingCommentIsQuestion, setEditingCommentIsQuestion] =
        useState(false);
    const [editingCommentSpoilerRanges, setEditingCommentSpoilerRanges] =
        useState<[number, number][]>([]);
    const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
    const [isDeletingComment, setIsDeletingComment] = useState(false);
    const editingTextareaRef = useRef<HTMLTextAreaElement>(null);
    const [reportingCommentId, setReportingCommentId] = useState<number | null>(null);
    const [reportReason, setReportReason] = useState("spam");
    const [reportDetails, setReportDetails] = useState("");
    const [showVideoReport, setShowVideoReport] = useState(false);
    const [videoReportReason, setVideoReportReason] = useState("spam");
    const [videoReportDetails, setVideoReportDetails] = useState("");
    const [videoReportSuccess, setVideoReportSuccess] = useState("");
    const [showStickerPicker, setShowStickerPicker] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleConfirmCommentDelete = async () => {
        if (commentToDelete === null || isDeletingComment) return;

        try {
            setIsDeletingComment(true);

            const deleted = await handleDeleteComment(
                commentToDelete,
                editingCommentId,
                setEditingCommentId,
                setEditingCommentText
            );

            if (deleted) {
                setCommentToDelete(null);
            }
        } finally {
            setIsDeletingComment(false);
        }
    };


    const handleVideoReportSubmit = async () => {
        if (submittingVideoReport) return;

        const submitted = await handleReportVideo(
            videoReportReason,
            videoReportDetails
        );

        if (submitted) {
            setShowVideoReport(false);
            setVideoReportReason("spam");
            setVideoReportDetails("");
            setVideoReportSuccess(t.videoReportSuccess);
        }
    };
    if (loading) {
        return (
            <main
                dir={isPersian ? "rtl" : "ltr"}
                className="min-h-screen bg-gray-100 dark:bg-[#0f0f0f]"
            >
                <Navbar />
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 text-gray-700 dark:text-gray-300">
                    {t.loading}
                </div>
            </main>
        );
    }

    if (error || !video) {
        return (
            <main
                dir={isPersian ? "rtl" : "ltr"}
                className="min-h-screen bg-gray-100 dark:bg-[#0f0f0f]"
            >
                <Navbar />
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 text-gray-700 dark:text-gray-300">
                    {error === "loadFailed"
                        ? t.loadFailed
                        : error ?? t.videoNotFound}
                </div>
            </main>
        );
    }

    const handleReplyClick = (commentId: number) => {
        setReplyingTo(commentId);

        requestAnimationFrame(() => {
            commentFormRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });

            commentTextareaRef.current?.focus({
                preventScroll: true,
            });
        });
    };

    const insertEmoji = (
        emoji: string,
        textarea: HTMLTextAreaElement | null,
        value: string,
        setValue: (value: string) => void
    ) => {
        if (!textarea) {
            setValue(value + emoji);
            return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        const newValue =
            value.slice(0, start) +
            emoji +
            value.slice(end);

        if (newValue.length > 1000) return;

        setValue(newValue);

        requestAnimationFrame(() => {
            textarea.focus();

            const cursorPosition = start + emoji.length;

            textarea.setSelectionRange(
                cursorPosition,
                cursorPosition
            );
        });
    };

    const handleSpoilerSelection = () => {
        const textarea = commentTextareaRef.current;

        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        // The user must select some text first.
        if (start === end) return;

        const ranges: [number, number][] = [
            ...spoilerRanges,
            [start, end],
        ];

        // Sort ranges by their starting position.
        ranges.sort((a, b) => a[0] - b[0]);

        // Merge overlapping or adjacent ranges.
        const mergedRanges: [number, number][] = [];

        for (const [rangeStart, rangeEnd] of ranges) {
            const lastRange = mergedRanges[mergedRanges.length - 1];

            if (lastRange && rangeStart <= lastRange[1]) {
                lastRange[1] = Math.max(lastRange[1], rangeEnd);
            } else {
                mergedRanges.push([rangeStart, rangeEnd]);
            }
        }

        setSpoilerRanges(mergedRanges);

        // Keep the textarea focused and preserve the selection.
        textarea.focus({ preventScroll: true });
        textarea.setSelectionRange(start, end);
    };

    return (
        <main
            dir={isPersian ? "rtl" : "ltr"}
            className="min-h-screen bg-gray-100 dark:bg-[#0f0f0f]"
        >
            <Navbar />

            <section className="mx-auto w-full max-w-5xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
                <VideoPlayer
                    videoId={video.id}
                    src={video.video_file}
                    hlsSrc={video.hls_url}
                    poster={video.thumbnail}
                    title={video.title}
                    subtitles={video.subtitles}
                    qualities={video.qualities}
                />

                <h1 className="mt-4 text-start text-xl font-bold leading-snug text-gray-900 dark:text-gray-100 sm:mt-6 sm:text-2xl lg:text-3xl">
                    {video.title}
                </h1>

                <div className="mt-5 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-[#303030] dark:bg-[#181818] sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <a
                            href={`/profile/${video.user_id}`}
                            className="shrink-0"
                        >
                            {channel?.profile_image ? (
                                <img
                                    src={channel.profile_image}
                                    alt={channel.username || video.username}
                                    className="h-14 w-14 rounded-full object-cover"
                                />
                            ) : (
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 text-xl font-bold text-gray-600 dark:bg-[#303030] dark:text-gray-300">
                                    {(channel?.username || video.username || "?")
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>
                            )}
                        </a>

                        <div className="min-w-0">
                            <a
                                href={`/profile/${video.user_id}`}
                                className="font-semibold text-gray-900 hover:text-red-700 dark:text-gray-100 dark:hover:text-red-400"
                            >
                                {channel?.username || video.username}
                            </a>

                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {channel?.subscribers_count ?? 0}{" "}
                                {t.subscribers}
                                {" • "}
                                {video.views_count} {t.views}
                            </p>
                        </div>
                    </div>

                    {channel && !channel.is_owner && (
                        <button
                            onClick={handleSubscribe}
                            disabled={subscribing}
                            className={`shrink-0 rounded-full px-6 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                channel.is_subscribed
                                    ? "border border-gray-300 bg-white text-gray-800 hover:bg-gray-100 dark:border-[#404040] dark:bg-[#252525] dark:text-gray-200 dark:hover:bg-[#303030]"
                                    : "bg-red-700 text-white hover:bg-red-800"
                            }`}
                        >
                            {subscribing
                                ? t.updating
                                : channel.is_subscribed
                                  ? t.unsubscribe
                                  : t.subscribe}
                        </button>
                    )}
                </div>

                {video.description && (
                    <p
                        dir="auto"
                        className="mt-6 whitespace-pre-wrap text-start text-gray-700 dark:text-gray-300"
                    >
                        {video.description}
                    </p>
                )}

                <div className="mt-6 flex flex-wrap gap-2 sm:gap-3">
                    <button
                        onClick={() => handleReaction("like")}
                        aria-label={`${t.like} ${likesCount}`} className={`group relative rounded-lg px-5 py-2 font-medium transition ${
                            userReaction === "like"
                                ? "bg-[var(--accent)] text-white"
                                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-300 dark:hover:bg-[#303030]"
                        }`}
                        aria-pressed={userReaction === "like"}
                    >
                        👍 <span className="hidden sm:inline">{t.like}</span> {likesCount}
                    <span role="tooltip" className="pointer-events-none invisible absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-active:visible group-active:opacity-100 group-focus-visible:visible group-focus-visible:opacity-100 sm:hidden">{t.like}</span>
                    </button>

                    <button
                        onClick={() => handleReaction("dislike")}
                        aria-label={`${t.dislike} ${dislikesCount}`} className={`group relative rounded-lg px-5 py-2 font-medium transition ${
                            userReaction === "dislike"
                                ? "bg-[var(--accent)] text-white"
                                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-300 dark:hover:bg-[#303030]"
                        }`}
                        aria-pressed={userReaction === "dislike"}
                    >
                        👎 <span className="hidden sm:inline">{t.dislike}</span> {dislikesCount}
                    <span role="tooltip" className="pointer-events-none invisible absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-active:visible group-active:opacity-100 group-focus-visible:visible group-focus-visible:opacity-100 sm:hidden">{t.dislike}</span>
                    </button>

                    <button
                        onClick={() => handleShareVideo()}
                        aria-label={t.share} className={`group relative rounded-lg border border-gray-300 bg-white py-2 font-medium text-gray-700 whitespace-nowrap transition hover:bg-gray-50 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-300 dark:hover:bg-[#303030] ${
                            isPersian
                                ? "px-2.5 text-xs sm:px-5 sm:text-base"
                                : "px-5"
                        }`}
                    >
                        🔗 <span className="hidden sm:inline">{t.share}</span>
                    <span role="tooltip" className="pointer-events-none invisible absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-active:visible group-active:opacity-100 group-focus-visible:visible group-focus-visible:opacity-100 sm:hidden">{t.share}</span>
                    </button>

                    {video && currentUserId !== video.user_id && (
                        <button
                            type="button"
                            onClick={() => {
                                setVideoReportSuccess("");
                                setShowVideoReport((current) => !current);
                            }}
                            aria-expanded={showVideoReport}
                            aria-label={t.reportVideo} className={`group relative rounded-lg border border-red-300 bg-white py-2 font-medium text-red-700 whitespace-nowrap transition hover:bg-red-50 dark:border-red-900 dark:bg-[#202020] dark:text-red-300 dark:hover:bg-red-950/30 ${
                                isPersian
                                    ? "px-2.5 text-xs sm:px-5 sm:text-base"
                                    : "px-5"
                            }`}
                        >
                            🚩 <span className="hidden sm:inline">{t.reportVideo}</span>
                        <span role="tooltip" className="pointer-events-none invisible absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-active:visible group-active:opacity-100 group-focus-visible:visible group-focus-visible:opacity-100 sm:hidden">{t.reportVideo}</span>
                        </button>
                    )}
                </div>

                {showVideoReport && (
                    <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-[#303030] dark:bg-[#181818]">
                        <h3 className="mb-4 text-start font-semibold text-gray-900 dark:text-gray-100">
                            {t.reportVideo}
                        </h3>

                        <label
                            htmlFor="video-report-reason"
                            className="mb-1 block text-start text-sm font-medium text-gray-800 dark:text-gray-200"
                        >
                            {t.reason}
                        </label>

                        <select
                            id="video-report-reason"
                            value={videoReportReason}
                            onChange={(event) =>
                                setVideoReportReason(event.target.value)
                            }
                            className="mb-3 w-full rounded-lg border border-gray-300 bg-white p-2 text-start text-sm text-gray-900 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100"
                        >
                            <option value="spam">{t.spam}</option>
                            <option value="harassment">{t.harassment}</option>
                            <option value="hate_speech">{t.hateSpeech}</option>
                            <option value="inappropriate">{t.inappropriate}</option>
                            <option value="misinformation">{t.misinformation}</option>
                            <option value="other">{t.other}</option>
                        </select>

                        <label
                            htmlFor="video-report-details"
                            className="mb-1 block text-start text-sm font-medium text-gray-800 dark:text-gray-200"
                        >
                            {t.additionalDetails}
                        </label>

                        <textarea
                            id="video-report-details"
                            value={videoReportDetails}
                            onChange={(event) =>
                                setVideoReportDetails(
                                    event.target.value.slice(0, 500)
                                )
                            }
                            dir="auto"
                            maxLength={500}
                            rows={3}
                            className="mb-3 w-full rounded-lg border border-gray-300 bg-white p-3 text-start text-sm text-gray-900 outline-none focus:border-[var(--accent)] dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100"
                        />

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                disabled={submittingVideoReport}
                                onClick={() => setShowVideoReport(false)}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-[#404040] dark:text-gray-200 dark:hover:bg-[#303030]"
                            >
                                {t.cancel}
                            </button>

                            <button
                                type="button"
                                disabled={submittingVideoReport}
                                onClick={() => void handleVideoReportSubmit()}
                                className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {submittingVideoReport
                                    ? t.submitting
                                    : t.submitReport}
                            </button>
                        </div>
                    </div>
                )}

                {videoReportSuccess && (
                    <p
                        role="status"
                        className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-300"
                    >
                        {videoReportSuccess}
                    </p>
                )}
            </section>

            <section className="mx-auto mt-6 w-full max-w-5xl px-3 pb-8 sm:mt-10 sm:px-6 sm:pb-10 lg:px-8">
                <h2 className="mb-4 text-start text-xl font-bold text-gray-900 dark:text-gray-100 sm:mb-5 sm:text-2xl">
                    {t.comments}
                </h2>

                <form
                    ref={commentFormRef}
                    onSubmit={handleCommentSubmit}
                    className="mb-8 min-w-0 rounded-xl border border-gray-200 bg-white p-3 sm:p-4 dark:border-[#303030] dark:bg-[#181818]"
                >
                    {replyingTo !== null && (
                        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-red-50 px-3 py-2 dark:bg-red-950/30">
                            <div className="text-start text-sm text-red-700 dark:text-red-300">
                                {t.replyingTo}{" "}
                                <span className="font-semibold">
                                    {comments.find(
                                        (comment) => comment.id === replyingTo
                                    )?.username ?? t.comment}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => setReplyingTo(null)}
                                className="rounded-md px-2 py-1 text-xs font-semibold text-gray-600 transition hover:bg-red-100 dark:text-gray-300 dark:hover:bg-red-900/40"
                            >
                                {t.cancel}
                            </button>
                        </div>
                    )}

                    <label
                        htmlFor="comment"
                        className="mb-3 block text-start text-sm font-semibold text-gray-900 dark:text-gray-100"
                    >
                        {replyingTo !== null ? t.writeReply : t.leaveComment}
                    </label>

                    <textarea
                        ref={commentTextareaRef}
                        id="comment"
                        dir="auto"
                        value={commentText}
                        onChange={(event) =>
                            setCommentText(event.target.value.slice(0, 1000))
                        }
                        placeholder={t.commentPlaceholder}
                        maxLength={1000}
                        className="w-full resize-y rounded-lg border border-gray-300 bg-gray-50 p-3 text-start text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-700 focus:ring-1 focus:ring-red-700 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100 dark:placeholder:text-gray-500"
                        rows={3}
                    />

                    <div className="mt-2 flex items-center gap-2">
                        {/* Emoji Picker */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowEmojiPicker(!showEmojiPicker);
                                    setShowStickerPicker(false);
                                }}
                                aria-label={t.insertEmoji}
                                aria-expanded={showEmojiPicker}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-base transition hover:bg-gray-100 dark:border-[#404040] dark:bg-[#202020] dark:hover:bg-[#303030]"
                            >
                                😀
                            </button>

                            {showEmojiPicker && (
                                <div className="absolute start-0 top-full z-30 mb-2 grid max-h-[40vh] w-[min(14rem,calc(100vw-2rem))] grid-cols-4 gap-1.5 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-lg dark:border-[#404040] dark:bg-[#202020] sm:w-60 sm:gap-2 sm:p-3">
                                    {[
                                        "😀", "😂", "😍", "❤️", "🔥", "👍",
                                        "😎", "😭", "🎮", "👏", "💩",
                                    ].map((emoji) => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => {
                                                insertEmoji(
                                                    emoji,
                                                    commentTextareaRef.current,
                                                    commentText,
                                                    setCommentText
                                                );
                                                setShowEmojiPicker(false);
                                            }}
                                            aria-label={`${t.insertEmoji} ${emoji}`}
                                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-xl transition active:scale-95 hover:bg-gray-100 dark:border-[#404040] dark:bg-[#202020] dark:hover:bg-[#303030] sm:h-11 sm:w-11 sm:text-2xl"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sticker Picker */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowStickerPicker(!showStickerPicker);
                                    setShowEmojiPicker(false);
                                }}
                                aria-label="Open Pishi stickers"
                                aria-expanded={showStickerPicker}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-base transition hover:bg-gray-100 dark:border-[#404040] dark:bg-[#202020] dark:hover:bg-[#303030]"
                            >
                                😺
                            </button>

                            {showStickerPicker && (
                                <div className="absolute start-0 top-full z-30 mt-2 max-h-[40vh] w-[min(16rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-lg dark:border-[#404040] dark:bg-[#202020] sm:w-72 sm:p-3">
                                    <p className="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-300 sm:mb-3 sm:text-sm">
                                        پک پیشی 🐱
                                    </p>

                                    <div className="grid grid-cols-5 gap-1 sm:gap-2">
                                        {PISHI_STICKERS.map((sticker) => (
                                            <button
                                                key={sticker.code}
                                                type="button"
                                                onClick={() => {
                                                    insertEmoji(
                                                        sticker.code,
                                                        commentTextareaRef.current,
                                                        commentText,
                                                        setCommentText
                                                    );
                                                    setShowStickerPicker(false);
                                                }}
                                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white p-1 transition active:scale-95 hover:bg-gray-100 dark:border-[#404040] dark:bg-[#202020] dark:hover:bg-[#303030] sm:h-12 sm:w-12"
                                            >
                                                <img
                                                    src={sticker.src}
                                                    alt={sticker.code}
                                                    className="h-full w-full object-contain"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Question Button */}
                        <button
                            type="button"
                            onClick={() => setIsQuestion(!isQuestion)}
                            aria-label={t.markAsQuestion}
                            aria-pressed={isQuestion}
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-lg font-bold transition ${
                                isQuestion
                                    ? "text-white"
                                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-100 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-300 dark:hover:bg-[#303030]"
                            }`}
                            style={
                                isQuestion
                                    ? {
                                        backgroundColor: "var(--accent)",
                                        borderColor: "var(--accent)",
                                    }
                                    : undefined
                            }
                        >
                            ?
                        </button>

                        {/* Spoiler Button */}
                        <button
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={handleSpoilerSelection}
                            aria-label={t.markSelectedAsSpoiler}
                            title={t.selectTextFirst}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-base transition hover:bg-gray-100 dark:border-[#404040] dark:bg-[#202020] dark:hover:bg-[#303030]"
                        >
                            🙈
                        </button>
                    </div>

                    {commentText.trim() && (
                        <div className="mt-4 rounded-lg border border-dashed border-gray-300 p-3 dark:border-[#404040]">
                            <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                {t.preview}
                            </p>

                            {isQuestion && (
                                <div
                                    className="mb-2 text-xs font-bold"
                                    style={{
                                        color: "var(--question-comment-color, #dc2626)",
                                    }}
                                >
                                    ? {t.question}
                                </div>
                            )}

                            <CommentContent
                                text={commentText}
                                spoilerRanges={spoilerRanges}
                                onRemoveSpoilerRange={(rangeIndex) => {
                                    setSpoilerRanges((previous) =>
                                        previous.filter((_, index) => index !== rangeIndex)
                                    );
                                }}
                            />
                        </div>
                    )}

                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <span
                            className={`text-xs ${
                                commentText.length >= 950
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-gray-500 dark:text-gray-400"
                            }`}
                        >
                            {commentText.length}/1000 {t.characters}
                        </span>

                        <button
                            type="submit"
                            disabled={
                                !commentText.trim() || submittingComment
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-red-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {submittingComment ? (
                                <>
                                    <svg
                                        className="h-4 w-4 animate-spin"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                        />
                                    </svg>
                                    {t.posting}
                                </>
                            ) : replyingTo !== null ? (
                                t.postReply
                            ) : (
                                t.addComment
                            )}
                        </button>
                    </div>
                </form>

                <div className="space-y-4">
                    {comments
                        .filter(
                            (comment) => comment.parent_comment_id === null
                        )
                        .map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                comments={comments}
                                reactingCommentIds={reactingCommentIds}
                                currentUserId={currentUserId}
                                getRelativeTime={(dateString) =>
                                    getRelativeTime(dateString, language)
                                }
                                depth={0}
                                editingCommentId={editingCommentId}
                                setEditingCommentId={setEditingCommentId}
                                editingCommentText={editingCommentText}
                                setEditingCommentText={setEditingCommentText}
                                editingCommentIsQuestion={editingCommentIsQuestion}
                                setEditingCommentIsQuestion={setEditingCommentIsQuestion}
                                editingCommentSpoilerRanges={editingCommentSpoilerRanges}
                                setEditingCommentSpoilerRanges={setEditingCommentSpoilerRanges}
                                editingTextareaRef={editingTextareaRef}
                                reportingCommentId={reportingCommentId}
                                setReportingCommentId={setReportingCommentId}
                                reportReason={reportReason}
                                setReportReason={setReportReason}
                                reportDetails={reportDetails}
                                setReportDetails={setReportDetails}
                                submittingReport={submittingReport}
                                onDeleteComment={(commentId) =>
                                    setCommentToDelete(commentId)
                                }
                                onEditComment={(commentId, text, isQuestion, spoilerRanges) =>
                                    handleEditComment(
                                        commentId,
                                        text,
                                        isQuestion,
                                        spoilerRanges,
                                        setEditingCommentId,
                                        setEditingCommentText
                                    )
                                }
                                onReportComment={(commentId, reason, details) =>
                                    handleReportComment(
                                        commentId,
                                        reason,
                                        details,
                                        setReportingCommentId,
                                        setReportReason,
                                        setReportDetails,
                                        setEditingCommentId
                                    )
                                }
                                onCommentReaction={handleCommentReaction}
                                onReplyClick={handleReplyClick}
                                onInsertEmoji={insertEmoji}
                            />
                        ))}
                </div>
            </section>
            <ConfirmDeleteComment
                isOpen={commentToDelete !== null && commentError === null}
                isLoading={isDeletingComment}
                onConfirm={handleConfirmCommentDelete}
                onCancel={() => setCommentToDelete(null)}
            />
            <ShareVideoSuccessDialog
                isOpen={shareDialog !== null}
                url={shareDialog?.url ?? ""}
                status={shareDialog?.status ?? "success"}
                onClose={() => setShareDialog(null)}
                onCopyAgain={() => {
                    if (shareDialog) {
                        void copyVideoLink(shareDialog.url);
                    }
                }}
            />
            <CommentErrorDialog
                isOpen={commentError !== null}
                message={commentError ?? ""}
                onClose={clearCommentError}
            />
        </main>
    );
}

function getRelativeTime(
    dateString: string,
    language: "fa" | "en"
): string {
    const date = new Date(dateString);
    const now = new Date();

    const seconds = Math.floor(
        (now.getTime() - date.getTime()) / 1000
    );

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const isPersian = language === "fa";
    const t = translations[language].videoDetail;

    if (seconds < 10) return t.justNow;

    if (seconds < 60) {
        return isPersian
            ? `${seconds} ${t.secondsAgo}`
            : `${seconds} ${t.secondsAgo}`;
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        const label =
            minutes === 1 ? t.minuteAgo : t.minutesAgo;

        return isPersian
            ? `${minutes} ${label}`
            : `${minutes} ${label}`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        const label = hours === 1 ? t.hourAgo : t.hoursAgo;

        return isPersian
            ? `${hours} ${label}`
            : `${hours} ${label}`;
    }

    const days = Math.floor(hours / 24);
    if (days < 30) {
        const label = days === 1 ? t.dayAgo : t.daysAgo;

        return isPersian
            ? `${days} ${label}`
            : `${days} ${label}`;
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
        const label = months === 1 ? t.monthAgo : t.monthsAgo;

        return isPersian
            ? `${months} ${label}`
            : `${months} ${label}`;
    }

    const years = Math.floor(days / 365);
    const label = years === 1 ? t.yearAgo : t.yearsAgo;

    return isPersian
        ? `${years} ${label}`
        : `${years} ${label}`;
}