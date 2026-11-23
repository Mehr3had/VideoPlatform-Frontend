"use client";

import { useState } from "react";
import type { VideoComment } from "@/hooks/useVideoDetail";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";
import { PISHI_STICKERS } from "@/lib/stickers";

function renderInlineContent(text: string, keyPrefix: string) {
    const parts = text.split(/(:cat(?:[1-9]|1[0-9]|2[0-4]):)/g);

    return parts.map((part, index) => {
        const sticker = PISHI_STICKERS.find(
            (item) => item.code === part
        );

        if (sticker) {
            return (
                <img
                    key={`${keyPrefix}-${index}`}
                    src={sticker.src}
                    alt="Pishi sticker"
                    className="inline-block h-12 w-12 object-contain align-middle"
                />
            );
        }

        return <span key={`${keyPrefix}-${index}`}>{part}</span>;
    });
}

interface CommentContentProps {
    text: string;
    spoilerRanges: [number, number][];
    onRemoveSpoilerRange?: (index: number) => void;
}

export function CommentContent({
    text,
    spoilerRanges,
    onRemoveSpoilerRange,
}: CommentContentProps) {
    const { language } = useLanguage();
    const t = translations[language].videoDetail;
    const [revealedSpoilers, setRevealedSpoilers] = useState<number[]>([]);

    const ranges = spoilerRanges
        .filter(
            ([start, end]) =>
                Number.isInteger(start) &&
                Number.isInteger(end) &&
                start >= 0 &&
                end > start &&
                start < text.length
        )
        .map(
            ([start, end]): [number, number] => [
                start,
                Math.min(end, text.length),
            ]
        )
        .sort((a, b) => a[0] - b[0]);

    const content: React.ReactNode[] = [];
    let cursor = 0;

    ranges.forEach(([start, end], index) => {
        // Ignore overlapping or invalid ranges.
        if (start < cursor) return;

        if (start > cursor) {
            content.push(
                <span key={`text-${index}`}>
                    {renderInlineContent(
                        text.slice(cursor, start),
                        `text-${index}`
                    )}
                </span>
            );
        }

        const isRevealed = revealedSpoilers.includes(index);

        if (isRevealed) {
            content.push(
                <span key={`spoiler-${index}`}>
                    {renderInlineContent(
                        text.slice(start, end),
                        `spoiler-${index}`
                    )}
                </span>
            );
        } else {
            content.push(
                <span
                    key={`spoiler-${index}`}
                    className="mx-1 inline-flex items-center gap-1"
                >
                    <button
                        type="button"
                        onClick={() =>
                            setRevealedSpoilers((previous) =>
                                previous.includes(index)
                                    ? previous.filter((item) => item !== index)
                                    : [...previous, index]
                            )
                        }
                        aria-expanded={false}
                        className="inline-flex items-center rounded-md bg-[repeating-linear-gradient(135deg,#27272a_0px,#27272a_6px,#52525b_6px,#52525b_12px)] px-3 py-1 text-xs font-semibold text-white transition hover:opacity-80"
                    >
                        🙈 {t.showSpoiler}
                    </button>

                    {onRemoveSpoilerRange && (
                        <button
                            type="button"
                            onClick={() => onRemoveSpoilerRange(index)}
                            aria-label={t.removeSpoiler}
                            title={t.removeSpoiler}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-700 transition hover:bg-red-200 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950"
                        >
                            ×
                        </button>
                    )}
                </span>
            );
        }
        cursor = end;
    });

    if (cursor < text.length) {
        content.push(
            <span key="remaining-text">
                {renderInlineContent(text.slice(cursor), "remaining")}
            </span>
        );
    }

    return (
        <p className="whitespace-pre-wrap break-words text-sm text-gray-700 dark:text-gray-300">
            {content}
        </p>
    );
}

interface CommentItemProps {
    comment: VideoComment;
    comments: VideoComment[];
    currentUserId: number | null;
    depth?: number;
    getRelativeTime: (dateString: string) => string;
    editingCommentId: number | null;
    setEditingCommentId: (id: number | null) => void;
    editingCommentText: string;
    editingCommentIsQuestion: boolean;
    setEditingCommentIsQuestion: (value: boolean) => void;
    editingCommentSpoilerRanges: [number, number][];
    setEditingCommentSpoilerRanges: React.Dispatch<
        React.SetStateAction<[number, number][]>
    >;
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
    onEditComment: (
        commentId: number,
        text: string,
        isQuestion: boolean,
        spoilerRanges: [number, number][]
    ) => void;
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
    reactingCommentIds: number[];
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
    editingCommentIsQuestion,
    setEditingCommentIsQuestion,
    editingCommentSpoilerRanges,
    setEditingCommentSpoilerRanges,
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
    reactingCommentIds,
}: CommentItemProps) {
    const { language, isPersian } = useLanguage();
    const t = translations[language].videoDetail;
    const [showOptions, setShowOptions] = useState(false);
    const [showEditStickerPicker, setShowEditStickerPicker] = useState(false);
    const [showEditEmojiPicker, setShowEditEmojiPicker] = useState(false);
    const replies = comments.filter(
        (item) => item.parent_comment_id === comment.id
    );
    const handleEditSpoilerSelection = () => {
        const textarea = editingTextareaRef.current;

        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        if (start === end) {
            return;
        }

        const ranges: [number, number][] = [
            ...editingCommentSpoilerRanges,
            [start, end],
        ];

        ranges.sort((a, b) => a[0] - b[0]);

        const mergedRanges: [number, number][] = [];

        for (const [rangeStart, rangeEnd] of ranges) {
            const lastRange = mergedRanges[mergedRanges.length - 1];

            if (lastRange && rangeStart <= lastRange[1]) {
                lastRange[1] = Math.max(lastRange[1], rangeEnd);
            } else {
                mergedRanges.push([rangeStart, rangeEnd]);
            }
        }

        setEditingCommentSpoilerRanges(mergedRanges);

        textarea.focus({ preventScroll: true });
        textarea.setSelectionRange(start, end);
    };

    return (
        <div
            dir={isPersian ? "rtl" : "ltr"}
            className={
                depth > 0
                    ? (isPersian
                        ? "mr-3 border-r-2 border-gray-200 pr-2 dark:border-[#303030] sm:mr-5 sm:pr-3"
                        : "ml-3 border-l-2 border-gray-200 pl-2 dark:border-[#303030] sm:ml-5 sm:pl-3")
                    : ""
            }
        >
            <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-[#303030] dark:bg-[#181818] sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                    <a
                        href={`/profile/${comment.user_id}`}
                        className="shrink-0"
                    >
                        {comment.profile_image ? (
                            <img
                                src={comment.profile_image}
                                alt={comment.username}
                                className="h-9 w-9 rounded-full object-cover sm:h-10 sm:w-10"
                            />
                        ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-700 dark:bg-[#303030] dark:text-gray-200 sm:h-10 sm:w-10 sm:text-sm">
                                {(comment.username || "?")
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>
                        )}
                    </a>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2 sm:gap-3">
                            <div>
                                <a
                                    href={`/profile/${comment.user_id}`}
                                    className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 sm:text-sm"
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
                                        className="rounded-full px-1.5 py-0.5 text-base leading-none text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#303030] sm:px-2 sm:py-1 sm:text-lg"
                                    >
                                        ⋯
                                    </button>

                                    {showOptions && (
                                        <div className={`absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-[#303030] dark:bg-[#202020] sm:w-44 ${isPersian ? "max-sm:left-0 max-sm:right-auto" : ""}`}>
                                            {currentUserId === comment.user_id && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingCommentText(comment.text);
                                                            setEditingCommentIsQuestion(comment.is_question ?? false);
                                                            setEditingCommentSpoilerRanges(
                                                                comment.spoiler_ranges ? [...comment.spoiler_ranges] : []
                                                            );
                                                            setEditingCommentId(comment.id);
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
                                                    className="block w-full min-w-0 max-w-full whitespace-normal break-words [overflow-wrap:anywhere] rounded-md px-2 py-1.5 text-start text-xs leading-5 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#303030] sm:px-3 sm:py-2 sm:text-sm"
                                                >
                                                    🚩 {t.reportComment}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <span className="text-[11px] text-gray-500 dark:text-gray-400 sm:text-xs">
                            {comment.created_at
                                ? getRelativeTime(comment.created_at)
                                : ""}
                        </span>

                        {!comment.is_removed &&
                        editingCommentId === comment.id ? (
                            <div className="mt-3 space-y-2">
                                <div className="flex flex-wrap gap-2">
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowEditEmojiPicker(!showEditEmojiPicker);
                                                setShowEditStickerPicker(false);
                                            }}
                                            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-lg hover:bg-gray-100 dark:border-[#404040] dark:bg-[#202020] dark:hover:bg-[#303030]"
                                        >
                                            😀
                                        </button>

                                        {showEditEmojiPicker && (
                                            <div className="absolute start-0 top-full z-30 mt-2 grid w-[min(16rem,calc(100vw-2rem))] grid-cols-4 gap-2 rounded-xl border border-gray-200 bg-white p-3 shadow-lg dark:border-[#404040] dark:bg-[#202020]">
                                                {[
                                                    "😀", "😂", "😍", "❤️", "🔥", "👍",
                                                    "😎", "😭", "🎮", "👏", "💩",
                                                ].map((emoji) => (
                                                    <button
                                                        key={emoji}
                                                        type="button"
                                                        onClick={() => {
                                                            onInsertEmoji(
                                                                emoji,
                                                                editingTextareaRef.current,
                                                                editingCommentText,
                                                                setEditingCommentText
                                                            );
                                                           setShowEditEmojiPicker(false);
                                                        }}
                                                        className="flex h-11 w-11 items-center justify-center rounded-lg text-2xl transition hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-[#303030] dark:active:bg-[#404040]"
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditStickerPicker(!showEditStickerPicker);
                                            setShowEditEmojiPicker(false);
                                        }}
                                        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-lg hover:bg-gray-100 dark:border-[#404040] dark:bg-[#202020] dark:hover:bg-[#303030]"
                                    >
                                        😺
                                    </button>

                                    {showEditStickerPicker && (
                                        <div className="absolute start-0 top-full z-30 mt-2 w-[min(18rem,calc(100vw-2rem))] rounded-xl border border-gray-200 bg-white p-3 shadow-lg dark:border-[#404040] dark:bg-[#202020]">
                                            <p className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                پک پیشی 🐱
                                            </p>

                                            <div className="grid grid-cols-5 gap-2">
                                                {PISHI_STICKERS.map((sticker) => (
                                                    <button
                                                        key={sticker.code}
                                                        type="button"
                                                        onClick={() => {
                                                            onInsertEmoji(
                                                                sticker.code,
                                                                editingTextareaRef.current,
                                                                editingCommentText,
                                                                setEditingCommentText
                                                            );

                                                            setShowEditStickerPicker(false);
                                                        }}
                                                        className="flex items-center justify-center rounded-lg p-1 transition hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-[#303030] dark:active:bg-[#404040]"
                                                    >
                                                        <img
                                                            src={sticker.src}
                                                            alt={sticker.code}
                                                            className="h-10 w-10 object-contain sm:h-12 sm:w-12"
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Question and Spoiler Controls */}
                                <div className="flex flex-wrap items-center gap-2">
                                    {/* Question Button */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setEditingCommentIsQuestion(!editingCommentIsQuestion)
                                        }
                                        aria-pressed={editingCommentIsQuestion}
                                        aria-label={t.markAsQuestion}
                                        className={`flex h-9 w-9 items-center justify-center rounded-lg border text-lg font-bold transition ${
                                            editingCommentIsQuestion
                                                ? "text-white"
                                                : "border-gray-300 bg-white text-gray-600 hover:bg-gray-100 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-300"
                                        }`}
                                        style={
                                            editingCommentIsQuestion
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
                                        onClick={handleEditSpoilerSelection}
                                        aria-label={t.markSelectedAsSpoiler}
                                        title={t.selectTextFirst}
                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-base transition hover:bg-gray-100 dark:border-[#404040] dark:bg-[#202020] dark:hover:bg-[#303030]"
                                    >
                                        🙈
                                    </button>
                                </div>

                                {/* Edit Preview */}
                                {editingCommentText.trim() && (
                                    <div className="rounded-lg border border-dashed border-gray-300 p-3 dark:border-[#404040]">
                                        <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                            {t.preview}
                                        </p>

                                        {editingCommentIsQuestion && (
                                            <p
                                                className="mb-2 text-xs font-bold"
                                                style={{
                                                    color: "var(--question-comment-color, #dc2626)",
                                                }}
                                            >
                                                ? {t.question}
                                            </p>
                                        )}

                                        <CommentContent
                                            text={editingCommentText}
                                            spoilerRanges={editingCommentSpoilerRanges}
                                            onRemoveSpoilerRange={(rangeIndex) => {
                                                setEditingCommentSpoilerRanges((previous) =>
                                                    previous.filter((_, index) => index !== rangeIndex)
                                                );
                                            }}
                                        />
                                    </div>
                                )}

                                <textarea
                                    ref={editingTextareaRef}
                                    value={editingCommentText}
                                    onChange={(event) => {
                                        setEditingCommentText(event.target.value);
                                        setEditingCommentSpoilerRanges([]);
                                    }}
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
                                                editingCommentText,
                                                editingCommentIsQuestion,
                                                editingCommentSpoilerRanges
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
                            <div
                                dir={isPersian ? "rtl" : "ltr"}
                                className={`mt-2 ${
                                    isPersian ? "text-right" : "text-left"
                                } ${
                                    comment.is_question
                                        ? "rounded-lg bg-red-50/70 p-3 dark:bg-red-950/20"
                                        : ""
                                }`}
                                style={
                                    comment.is_question
                                        ? {
                                            borderInlineStart:
                                                "4px solid var(--question-comment-color, #dc2626)",
                                                paddingInlineStart: "12px",
                                        }
                                        : undefined
                                }
                            >
                                {comment.is_question && (
                                    <div
                                        className="mb-2 flex items-center gap-1.5 text-xs font-bold"
                                        style={{
                                            color: "var(--question-comment-color, #dc2626)",
                                        }}
                                    >
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-current">
                                            ?
                                        </span>
                                        {t.question}
                                    </div>
                                )}

                                <CommentContent
                                    text={comment.text}
                                    spoilerRanges={comment.spoiler_ranges ?? []}
                                />
                            </div>
                        )}

                        {!comment.is_removed && (
                            <div className="mt-2 flex flex-wrap items-center gap-1 sm:mt-3 sm:gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        onCommentReaction(comment.id, "like")
                                    }
                                    aria-pressed={comment.is_liked}
                                    aria-label={`${t.like} ${comment.likes_count}`}
                                    disabled={reactingCommentIds.includes(comment.id)}
                                    className={`rounded-lg px-1.5 py-0.5 text-xs transition disabled:cursor-not-allowed disabled:opacity-50 sm:px-2 sm:py-1 sm:text-sm ${
                                        comment.is_liked
                                            ? "bg-[var(--accent)]/10 font-semibold text-[var(--accent)]"
                                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#303030]"
                                    }`}
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
                                    disabled={reactingCommentIds.includes(comment.id)}
                                    className={`rounded-lg px-1.5 py-0.5 text-xs transition disabled:cursor-not-allowed disabled:opacity-50 sm:px-2 sm:py-1 sm:text-sm ${
                                        comment.is_disliked
                                            ? "bg-[var(--accent)]/10 font-semibold text-[var(--accent)]"
                                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#303030]"
                                    }`}
                                >
                                    👎 {comment.dislikes_count}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => onReplyClick(comment.id)}
                                    className="rounded-lg px-1.5 py-0.5 text-xs text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#303030] sm:px-2 sm:py-1 sm:text-sm"
                                >
                                    {t.reply}
                                </button>
                            </div>
                        )}

                        {!comment.is_removed &&
                            reportingCommentId === comment.id && (
                                <div className="mt-2 rounded-xl border border-gray-200 bg-white p-3 dark:border-[#303030] dark:bg-[#181818] sm:mt-3 sm:p-4">
                                    <label
                                        htmlFor={`report-reason-${comment.id}`}
                                        className="mb-1 block text-start text-xs font-medium text-gray-800 dark:text-gray-200 sm:text-sm"
                                    >
                                        {t.reason}
                                    </label>

                                    <select
                                        id={`report-reason-${comment.id}`}
                                        value={reportReason}
                                        onChange={(event) =>
                                            setReportReason(event.target.value)
                                        }
                                        className="mb-2 w-full rounded-lg border border-gray-300 bg-white p-1.5 text-start text-xs text-gray-900 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100 sm:mb-3 sm:p-2 sm:text-sm"
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
                                        className="mb-1 block text-start text-xs font-medium text-gray-800 dark:text-gray-200 sm:text-sm"
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
                                        className="mb-2 w-full rounded-lg border border-gray-300 bg-white p-2 text-start text-xs text-gray-900 outline-none focus:border-red-600 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100 sm:mb-3 sm:p-3 sm:text-sm"
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
                                            className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-[#404040] dark:text-gray-200 dark:hover:bg-[#303030] sm:px-3 sm:py-1.5 sm:text-sm"
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
                                            className="rounded-lg bg-red-700 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:py-1.5 sm:text-sm"
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
                            reactingCommentIds={reactingCommentIds}
                            currentUserId={currentUserId}
                            getRelativeTime={getRelativeTime}
                            depth={depth + 1}
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