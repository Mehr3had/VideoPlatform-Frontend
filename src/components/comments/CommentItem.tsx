"use client";

import { useState } from "react";
import type { VideoComment } from "@/hooks/useVideoDetail";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

interface CommentItemProps {
    comment: VideoComment;
    comments: VideoComment[];
    currentUserId: number | null;
    depth?: number;
    getRelativeTime: (dateString: string) => string;
    editingCommentId: number | null;
    setEditingCommentId: (id: number | null) => void;
    editingCommentText: string;
    setEditingCommentText: (text: string) => void;
    editingTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
    reportingCommentId: number | null;
    setReportingCommentId: (id: number | null) => void;
    reportReason: string;
    setReportReason: (reason: string) => void;
    reportDetails: string;
    setReportDetails: (details: string) => void;
    submittingReport: boolean;
    onDeleteComment: (commentId: number) => void;
    onEditComment: (commentId: number, text: string) => void;
    onReportComment: (
        commentId: number,
        reason: string,
        details: string
    ) => void;
    onCommentReaction: (
        commentId: number,
        reaction: "like" | "dislike"
    ) => void;
    onReplyClick: (commentId: number) => void;
    onInsertEmoji: (
        emoji: string,
        textarea: HTMLTextAreaElement | null,
        value: string,
        setValue: (value: string) => void
    ) => void;
}

export default function CommentItem({
    comment,
    comments,
    currentUserId,
    getRelativeTime,
    depth = 0,
    editingCommentId,
    setEditingCommentId,
    editingCommentText,
    setEditingCommentText,
    editingTextareaRef,
    reportingCommentId,
    setReportingCommentId,
    reportReason,
    setReportReason,
    reportDetails,
    setReportDetails,
    submittingReport,
    onDeleteComment,
    onEditComment,
    onReportComment,
    onCommentReaction,
    onReplyClick,
    onInsertEmoji,
}: CommentItemProps) {
    const { language, isPersian } = useLanguage();
    const t = translations[language].videoDetail;

    const [showOptions, setShowOptions] = useState(false);

    const replies = comments.filter(
        (item) => item.parent_comment_id === comment.id
    );

    return (
        <div
            dir={isPersian ? "rtl" : "ltr"}
            className={
                depth > 0
                    ? "ml-5 border-l-2 border-gray-200 pl-3 dark:border-[#303030]"
                    : ""
            }
        >
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-[#303030] dark:bg-[#181818]">
                <div className="flex items-start gap-3">
                    <a
                        href={`/profile/${comment.user_id}`}
                        className="shrink-0"
                    >
                        {comment.profile_image ? (
                            <img
                                src={comment.profile_image}
                                alt={comment.username}
                                className="h-10 w-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-700 dark:bg-[#303030] dark:text-gray-200">
                                {(comment.username || "?")
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>
                        )}
                    </a>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <a
                                    href={`/profile/${comment.user_id}`}
                                    className="text-sm font-semibold text-gray-900 dark:text-gray-100"
                                >
                                    {comment.username}
                                </a>
                            </div>

                            {currentUserId !== null && !comment.is_removed && (
                                <div className="relative shrink-0">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowOptions(!showOptions)
                                        }
                                        aria-label={t.commentOptions}
                                        aria-expanded={showOptions}
                                        className="rounded-full px-2 py-1 text-lg leading-none text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#303030]"
                                    >
                                        ⋯
                                    </button>

                                    {showOptions && (
                                        <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-[#303030] dark:bg-[#202020]">
                                            {currentUserId === comment.user_id && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingCommentText(
                                                                comment.text
                                                            );
                                                            setEditingCommentId(
                                                                comment.id
                                                            );
                                                            setShowOptions(false);
                                                        }}
                                                        className="w-full rounded-md px-3 py-2 text-start text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#303030]"
                                                    >
                                                        {t.editComment}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            onDeleteComment(
                                                                comment.id
                                                            );
                                                            setShowOptions(false);
                                                        }}
                                                        className="w-full rounded-md px-3 py-2 text-start text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                                    >
                                                        {t.deleteComment}
                                                    </button>
                                                </>
                                            )}

                                            {currentUserId !== comment.user_id && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setReportingCommentId(
                                                            comment.id
                                                        );
                                                        setReportReason("spam");
                                                        setReportDetails("");
                                                        setEditingCommentId(null);
                                                        setShowOptions(false);
                                                    }}
                                                    className="w-full rounded-md px-3 py-2 text-start text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#303030]"
                                                >
                                                    🚩 {t.reportComment}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {comment.created_at
                                ? getRelativeTime(comment.created_at)
                                : ""}
                        </span>

                        {!comment.is_removed &&
                        editingCommentId === comment.id ? (
                            <div className="mt-3 space-y-2">
                                <div className="flex flex-wrap gap-2">
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
                                            aria-label={`${t.insertEmoji} ${emoji}`}
                                            onClick={() =>
                                                onInsertEmoji(
                                                    emoji,
                                                    editingTextareaRef.current,
                                                    editingCommentText,
                                                    setEditingCommentText
                                                )
                                            }
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>

                                <textarea
                                    ref={editingTextareaRef}
                                    value={editingCommentText}
                                    onChange={(event) =>
                                        setEditingCommentText(
                                            event.target.value
                                        )
                                    }
                                    maxLength={1000}
                                    rows={3}
                                    dir="auto"
                                    className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-start text-sm text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100"
                                />

                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingCommentId(null);
                                            setEditingCommentText("");
                                        }}
                                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 dark:border-[#404040] dark:text-gray-200 dark:hover:bg-[#303030]"
                                    >
                                        {t.cancel}
                                    </button>

                                    <button
                                        type="button"
                                        disabled={
                                            !editingCommentText.trim() ||
                                            editingCommentText.length > 1000
                                        }
                                        onClick={() =>
                                            onEditComment(
                                                comment.id,
                                                editingCommentText
                                            )
                                        }
                                        className="rounded-lg bg-red-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {t.save}
                                    </button>
                                </div>
                            </div>
                        ) : comment.is_removed ? (
                            <p className="mt-2 text-start text-sm italic text-gray-500">
                                {t.removedComment}
                            </p>
                        ) : (
                            <p
                                dir={isPersian ? "rtl" : "ltr"}
                                className={`mt-2 whitespace-pre-wrap break-words text-start text-sm text-gray-700 dark:text-gray-300 ${
                                    isPersian ? "text-right" : "text-left"
                                }`}
                            >
                                {comment.text}
                            </p>
                        )}

                        {!comment.is_removed && (
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        onCommentReaction(comment.id, "like")
                                    }
                                    aria-pressed={comment.is_liked}
                                    aria-label={`${t.like} ${comment.likes_count}`}
                                    className="rounded-lg px-2 py-1 text-sm text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#303030]"
                                >
                                    👍 {comment.likes_count}
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        onCommentReaction(comment.id, "dislike")
                                    }
                                    aria-pressed={comment.is_disliked}
                                    aria-label={`${t.dislike} ${comment.dislikes_count}`}
                                    className="rounded-lg px-2 py-1 text-sm text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#303030]"
                                >
                                    👎 {comment.dislikes_count}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => onReplyClick(comment.id)}
                                    className="rounded-lg px-2 py-1 text-sm text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#303030]"
                                >
                                    {t.reply}
                                </button>
                            </div>
                        )}

                        {!comment.is_removed &&
                            reportingCommentId === comment.id && (
                                <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-[#303030] dark:bg-[#181818]">
                                    <label
                                        htmlFor={`report-reason-${comment.id}`}
                                        className="mb-1 block text-start text-sm font-medium text-gray-800 dark:text-gray-200"
                                    >
                                        {t.reason}
                                    </label>

                                    <select
                                        id={`report-reason-${comment.id}`}
                                        value={reportReason}
                                        onChange={(event) =>
                                            setReportReason(event.target.value)
                                        }
                                        className="mb-3 w-full rounded-lg border border-gray-300 bg-white p-2 text-start text-sm text-gray-900 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100"
                                    >
                                        <option value="spam">{t.spam}</option>
                                        <option value="harassment">
                                            {t.harassment}
                                        </option>
                                        <option value="hate_speech">
                                            {t.hateSpeech}
                                        </option>
                                        <option value="inappropriate">
                                            {t.inappropriate}
                                        </option>
                                        <option value="misinformation">
                                            {t.misinformation}
                                        </option>
                                        <option value="other">{t.other}</option>
                                    </select>

                                    <label
                                        htmlFor={`report-details-${comment.id}`}
                                        className="mb-1 block text-start text-sm font-medium text-gray-800 dark:text-gray-200"
                                    >
                                        {t.additionalDetails}
                                    </label>

                                    <textarea
                                        id={`report-details-${comment.id}`}
                                        value={reportDetails}
                                        onChange={(event) =>
                                            setReportDetails(
                                                event.target.value.slice(0, 500)
                                            )
                                        }
                                        dir="auto"
                                        className="mb-3 w-full rounded-lg border border-gray-300 bg-white p-3 text-start text-sm text-gray-900 outline-none focus:border-red-600 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100"
                                        maxLength={500}
                                        rows={3}
                                    />

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            disabled={submittingReport}
                                            onClick={() =>
                                                setReportingCommentId(null)
                                            }
                                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-[#404040] dark:text-gray-200 dark:hover:bg-[#303030]"
                                        >
                                            {t.cancel}
                                        </button>

                                        <button
                                            type="button"
                                            disabled={submittingReport}
                                            onClick={() =>
                                                onReportComment(
                                                    comment.id,
                                                    reportReason,
                                                    reportDetails
                                                )
                                            }
                                            className="rounded-lg bg-red-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {submittingReport
                                                ? t.submitting
                                                : t.submitReport}
                                        </button>
                                    </div>
                                </div>
                            )}
                    </div>
                </div>
            </div>

            {replies.length > 0 && (
                <div className="mt-3 space-y-3">
                    {replies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            comments={comments}
                            currentUserId={currentUserId}
                            getRelativeTime={getRelativeTime}
                            depth={depth + 1}
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
                            onDeleteComment={onDeleteComment}
                            onEditComment={onEditComment}
                            onReportComment={onReportComment}
                            onCommentReaction={onCommentReaction}
                            onReplyClick={onReplyClick}
                            onInsertEmoji={onInsertEmoji}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}