"use client";

import { useState, useRef } from "react";
import { useVideoDetail } from "@/hooks/useVideoDetail";
import CommentItem from "@/components/comments/CommentItem";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";
import VideoPlayer from "@/components/videos/VideoPlayer";

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
    } = useVideoDetail();

    const commentFormRef = useRef<HTMLFormElement>(null);
    const commentTextareaRef = useRef<HTMLTextAreaElement>(null);
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editingCommentText, setEditingCommentText] = useState("");
    const editingTextareaRef = useRef<HTMLTextAreaElement>(null);
    const [reportingCommentId, setReportingCommentId] = useState<number | null>(null);
    const [reportReason, setReportReason] = useState("spam");
    const [reportDetails, setReportDetails] = useState("");

    if (loading) {
        return (
            <main
                dir={isPersian ? "rtl" : "ltr"}
                className="min-h-screen bg-gray-100 dark:bg-[#0f0f0f]"
            >
                <Navbar />
                <div className="mx-auto max-w-5xl px-8 py-10 text-gray-700 dark:text-gray-300">
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
                <div className="mx-auto max-w-5xl px-8 py-10 text-gray-700 dark:text-gray-300">
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

    return (
        <main
            dir={isPersian ? "rtl" : "ltr"}
            className="min-h-screen bg-gray-100 dark:bg-[#0f0f0f]"
        >
            <Navbar />

            <section className="mx-auto max-w-5xl px-8 py-10">
                <VideoPlayer
                    videoId={video.id}
                    src={video.video_file}
                    poster={video.thumbnail}
                    subtitles={video.subtitles}
                    qualities={video.qualities}
                />

                <h1 className="mt-6 text-start text-3xl font-bold text-gray-900 dark:text-gray-100">
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

                <div className="mt-6 flex flex-wrap gap-3">
                    <button
                        onClick={() => handleReaction("like")}
                        className={`rounded-lg px-5 py-2 font-medium transition ${
                            userReaction === "like"
                                ? "bg-[var(--accent)] text-white"
                                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-300 dark:hover:bg-[#303030]"
                        }`}
                        aria-pressed={userReaction === "like"}
                    >
                        👍 {t.like} {likesCount}
                    </button>

                    <button
                        onClick={() => handleReaction("dislike")}
                        className={`rounded-lg px-5 py-2 font-medium transition ${
                            userReaction === "dislike"
                                ? "bg-[var(--accent)] text-white"
                                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-300 dark:hover:bg-[#303030]"
                        }`}
                        aria-pressed={userReaction === "dislike"}
                    >
                        👎 {t.dislike} {dislikesCount}
                    </button>

                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(
                                window.location.href
                            );
                            alert(t.linkCopied);
                        }}
                        className="rounded-lg border border-gray-300 bg-white px-5 py-2 font-medium text-gray-700 transition hover:bg-gray-50 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-300 dark:hover:bg-[#303030]"
                    >
                        🔗 {t.share}
                    </button>
                </div>
            </section>

            <section className="mx-auto mt-10 max-w-5xl px-8 pb-10">
                <h2 className="mb-5 text-start text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {t.comments}
                </h2>

                <form
                    ref={commentFormRef}
                    onSubmit={handleCommentSubmit}
                    className="mb-8 rounded-xl border border-gray-200 bg-white p-4 dark:border-[#303030] dark:bg-[#181818]"
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

                    <div className="mb-2 flex flex-wrap items-center gap-2">
                        {[
                            "😀",
                            "😂",
                            "😍",
                            "❤️",
                            "🔥",
                            "👍",
                            "😎",
                            "😭",
                            "🎮",
                            "👏",
                            "💩",
                        ].map((emoji) => (
                            <button
                                key={emoji}
                                type="button"
                                onClick={() =>
                                    insertEmoji(
                                        emoji,
                                        commentTextareaRef.current,
                                        commentText,
                                        setCommentText
                                    )
                                }
                                aria-label={`${t.insertEmoji} ${emoji}`}
                                className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-lg transition hover:scale-110 hover:bg-gray-100 dark:border-[#404040] dark:bg-[#202020] dark:hover:bg-[#303030]"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>

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
                                editingTextareaRef={editingTextareaRef}
                                reportingCommentId={reportingCommentId}
                                setReportingCommentId={setReportingCommentId}
                                reportReason={reportReason}
                                setReportReason={setReportReason}
                                reportDetails={reportDetails}
                                setReportDetails={setReportDetails}
                                submittingReport={submittingReport}
                                onDeleteComment={(commentId) =>
                                    handleDeleteComment(
                                        commentId,
                                        editingCommentId,
                                        setEditingCommentId,
                                        setEditingCommentText
                                    )
                                }
                                onEditComment={(commentId, text) =>
                                    handleEditComment(
                                        commentId,
                                        text,
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