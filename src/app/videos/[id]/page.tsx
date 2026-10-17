"use client";

import { useEffect, useState, useRef, type ReactNode, } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { API, BACKEND_URL } from "@/lib/api";

interface Comment {
    id: number;
    user_id: number;
    username: string;
    profile_image: string | null;
    text: string;
    is_removed: boolean;
    parent_comment_id: number | null;
    created_at: string;
    likes_count: number;
    dislikes_count: number;
    is_liked: boolean;
    is_disliked: boolean;
}

export default function VideoDetailPage() {

  const params = useParams();
  const videoId = params.id;
  const [video, setVideo] = useState<any>(null);
  const [channel, setChannel] = useState<any>(null);
  const [subscribing, setSubscribing] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const commentFormRef = useRef<HTMLFormElement>(null);
  const commentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const editingTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [reportingCommentId, setReportingCommentId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState("spam");
  const [reportDetails, setReportDetails] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);


    useEffect(() => {

        const getVideo = async () => {
            const response = await fetch(
                `${API}/videos/${videoId}/`
            );

            const data = await response.json();

            if (response.ok) {
                setVideo(data);

                const token = localStorage.getItem("accessToken");

                if (token) {
                    try {
                        const userResponse = await fetch(
                            `${BACKEND_URL}/videos/api/me/`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );

                        if (userResponse.ok) {
                            const userData = await userResponse.json();
                            setCurrentUserId(userData.id);
                        } else {
                            setCurrentUserId(null);
                        }
                    } catch (error) {
                        console.error("Failed to get current user:", error);
                        setCurrentUserId(null);
                    }
                } else {
                    setCurrentUserId(null);
                }

                // Get channel profile with the current user's token
                const channelResponse = await fetch(
                    `${API}/users/${data.user_id}/`,
                    {
                        headers: token
                            ? {
                                Authorization: `Bearer ${token}`,
                              }
                            : {},
                    }
                );

                if (channelResponse.ok) {
                    const channelData = await channelResponse.json();

                    console.log("Video owner ID:", data.user_id);
                    console.log("Channel data:", channelData);

                    setChannel(channelData);
                }

                setLikesCount(data.likes_count);
                setDislikesCount(data.dislikes_count);

                // Register video view
                await fetch(
                    `${API}/videos/${videoId}/view/`,
                    {
                        method: "POST",

                        headers: token
                        ?{
                            Authorization: `Bearer ${token}`,
                        }
                        : {},
                    }
                );

                // Get comments
                const commentsResponse = await fetch(
                    `${BACKEND_URL}/videos/${videoId}/comments/`
                );

                const commentsData = await commentsResponse.json();

                if (commentsResponse.ok) {
                    setComments(commentsData);
                }
            }
        };

        getVideo();

    }, [videoId]);

    if (!video) {
        return (
            <main className="flex min-h-screen items-center justify-center">
                <p>Loading...</p>
            </main>
        );
    }

    const handleReaction = async (reaction: string) => {

        const token = localStorage.getItem("accessToken");

        if (!token) {
            alert("Please login first.");
            return;
        }

        const response = await fetch(
            `${BACKEND_URL}/videos/${videoId}/react/`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },

                body: JSON.stringify({
                    reaction: reaction,
                }),
            }
        );

        const data = await response.json();

        if(response.ok) {

            setLikesCount(data.likes_count);
            setDislikesCount(data.dislikes_count);

            console.log(data);
        }

        else {
            console.log("Reaction failed:", data);
        }
    }

    const handleSubscribe = async () => {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            alert("Please login first.");
            return;
        }

        if (!channel || subscribing) return;

        try {
            setSubscribing(true);

            const response = await fetch(
                `${API}/users/${video.user_id}/subscribe/`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            console.log("Subscribe response:", data);

            if (!response.ok) {
                alert(data.error || "Could not update subscription.");
                return;
            }
            setChannel((current: any) => {
                if (!current) return current;

                return {
                    ...current,
                    is_subscribed: data.subscribed,
                    subscribers_count: data.subscribers_count,
                };
            });
        } catch (error) {
            console.error("Subscribe error:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setSubscribing(false);
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const token = localStorage.getItem("accessToken");

        if(!token) {
            alert("Please login first.");
            return;
        }

        const text = commentText.trim();

        if (!text || submittingComment) {
            return;
        }

        if (text.length > 1000) {
            alert("Comment must be 1000 characters or less.");
            return;
        }

        try {
            setSubmittingComment(true);

            const response = await fetch(
                `${BACKEND_URL}/videos/${videoId}/comments/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        text,
                        ...(replyingTo !== null && {
                            parent_comment_id: replyingTo,
                        }),
                     }),
                }
            );

            const data = await response.json();

            if(!response.ok) {

                alert(data.error || "Comment failed.");
                return;
            }

            setComments((previouscomments) => [
                data.comment,
                ...previouscomments,
            ]);

            setCommentText("");
            setReplyingTo(null);
        } catch (error) {

            console.error("Comment error:", error);
            alert("Something went wrong. Please try again.");
        } finally {

            setSubmittingComment(false);
        }
    };

    const handleCommentReaction = async (
        commentId: number,
        reaction: "like" | "dislike"
    ) => {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            alert("Please login first.");
            return;
        }

        const endpoint =
            reaction === "like" ? "like" : "dislike";

        try {
            const response = await fetch(
                `${BACKEND_URL}/videos/api/comments/${commentId}/${endpoint}/`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || "Failed to update reaction.");
                return;
            }

            setComments((previousComments) =>
                previousComments.map((comment) =>
                    comment.id === commentId
                        ? {
                            ...comment,
                            likes_count: data.likes_count,
                            dislikes_count: data.dislikes_count,
                            is_liked: data.liked,
                            is_disliked: data.disliked,
                        }
                        : comment
                )
            );
        } catch (error) {
            console.error("Comment reaction error:", error);
            alert("Something went wrong. Please try again.");
        }
    };

    const handleEditComment = async (commentId: number) => {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            alert("Please login first.");
            return;
        }

        const text = editingCommentText.trim();

        if (!text || text.length > 1000) {
            alert("Comment must contain between 1 and 1000 characters.");
            return;
        }

        try {
            const response = await fetch(
                `${BACKEND_URL}/videos/api/comments/${commentId}/edit/`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ text }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || "Failed to edit comment.");
                return;
            }

            setComments((previousComments) =>
                previousComments.map((comment) =>
                    comment.id === commentId
                        ? { ...comment, text: data.comment.text }
                        : comment
                )
            );

            setEditingCommentId(null);
            setEditingCommentText("");
        } catch (error) {
            console.error("Edit comment error:", error);
            alert("Something went wrong. Please try again.");
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this comment?"
        );

        if (!confirmed) return;

        const token = localStorage.getItem("accessToken");

        if (!token) {
            alert("Please login first.");
            return;
        }

        try {
            const response = await fetch(
                `${BACKEND_URL}/videos/api/comments/${commentId}/delete/`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || "Failed to delete comment.");
                return;
            }

            // Also remove replies belonging to the deleted comment.
            const deletedIds = new Set<number>([commentId]);

            let changed = true;

            while (changed) {
                changed = false;

                for (const comment of comments) {
                    if (
                        comment.parent_comment_id !== null &&
                        deletedIds.has(comment.parent_comment_id) &&
                        !deletedIds.has(comment.id)
                    ) {
                        deletedIds.add(comment.id);
                        changed = true;
                    }
                }
            }

            setComments((previousComments) =>
                previousComments.filter(
                    (comment) => !deletedIds.has(comment.id)
                )
            );

            if (deletedIds.has(editingCommentId ?? -1)) {
                setEditingCommentId(null);
                setEditingCommentText("");
            }
        } catch (error) {
            console.error("Delete comment error:", error);
            alert("Something went wrong. Please try again.");
        }
    };

    const handleReportComment = async (commentId: number) => {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            alert("Please login first.");
            return;
        }

        if (reportDetails.length > 500) {
            alert("Details must be 500 characters or less.");
            return;
        }

        try {
            setSubmittingReport(true);

            const response = await fetch(
                `${BACKEND_URL}/videos/api/comments/${commentId}/report/`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        reason: reportReason,
                        details: reportDetails.trim(),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 409) {
                    alert("You have already reported this comment.");
                } else {
                    alert(data.error || "Failed to submit report.");
                }
                return;
            }

            alert("Thank you. Your report has been submitted.");

            setReportingCommentId(null);
            setReportReason("spam");
            setReportDetails("");
            setEditingCommentId(null);
        } catch (error) {
            console.error("Report comment error:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setSubmittingReport(false);
        }
    };

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

    const renderComment = (
        comment: Comment,
        depth = 0
    ): ReactNode => {
        const replies = comments.filter(
            (item) => item.parent_comment_id === comment.id
        );

        return (
            <div
                key={comment.id}
                className={
                    depth > 0
                        ? "ml-5 border-l-2 border-gray-200 pl-3 dark:border-[#303030]"
                        : ""
                }
            >
                <div className="rounded-xl border border-gray-200 bg-white p-4 transition hover:border-gray-300 dark:border-[#303030] dark:bg-[#181818] dark:hover:border-[#454545]">
                    <div className="flex items-start gap-3">
                        <a
                            href={`/profile/${comment.user_id}`}
                            className="shrink-0"
                            aria-label={`View ${comment.username}'s profile`}
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
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                    <a
                                        href={`/profile/${comment.user_id}`}
                                        className="text-sm font-semibold text-gray-900 hover:text-red-700 dark:text-gray-100 dark:hover:text-red-400"
                                    >
                                        {comment.username}
                                    </a>

                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {comment.created_at
                                            ? getRelativeTime(comment.created_at)
                                            : ""}
                                    </span>
                                </div>

                                {currentUserId !== null && !comment.is_removed && (
                                    <div className="relative shrink-0">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setEditingCommentId(
                                                    editingCommentId === comment.id
                                                        ? null
                                                        : comment.id
                                                )
                                            }
                                            aria-label="Comment options"
                                            className="rounded-full px-2 py-1 text-lg leading-none text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#303030]"
                                        >
                                            ⋯
                                        </button>

                                        {editingCommentId === comment.id && (
                                            <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-[#303030] dark:bg-[#202020]">

                                                {currentUserId === comment.user_id && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditingCommentText(comment.text);
                                                                setEditingCommentId(comment.id);
                                                            }}
                                                            className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#303030]"
                                                        >
                                                            Edit Comment
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteComment(comment.id)}
                                                            className="w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                                        >
                                                            Delete Comment
                                                        </button>
                                                    </>
                                                )}

                                                {currentUserId !== comment.user_id && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setReportingCommentId(comment.id);
                                                            setReportReason("spam");
                                                            setReportDetails("");
                                                            setEditingCommentId(null);
                                                        }}
                                                        className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#303030]"
                                                    >
                                                        🚩 Report comment
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {!comment.is_removed &&
                            editingCommentId === comment.id &&
                            editingCommentText !== "" ? (
                                <div className="mt-3 space-y-2">

                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                        {["😀", "😂", "😍", "❤️", "🔥", "👍", "😎", "😭", "🎮", "👏", "💩"].map(
                                            (emoji) => (
                                                <button
                                                    key={emoji}
                                                    type="button"
                                                    onClick={() =>
                                                        insertEmoji(
                                                            emoji,
                                                            editingTextareaRef.current,
                                                            editingCommentText,
                                                            setEditingCommentText
                                                        )
                                                    }
                                                    aria-label={`Insert ${emoji} emoji`}
                                                    className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-lg transition hover:scale-110 hover:bg-gray-100 dark:border-[#404040] dark:bg-[#202020] dark:hover:bg-[#303030]"
                                                >
                                                    {emoji}
                                                </button>
                                            )
                                        )}
                                    </div>

                                    <textarea
                                        ref={editingTextareaRef}
                                        value={editingCommentText}
                                        onChange={(event) =>
                                            setEditingCommentText(event.target.value)
                                        }
                                        maxLength={1000}
                                        rows={3}
                                        className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100"
                                    />

                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {editingCommentText.length}/1000
                                        </span>

                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingCommentId(null);
                                                    setEditingCommentText("");
                                                }}
                                                className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#303030]"
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleEditComment(comment.id)}
                                                disabled={
                                                    !editingCommentText.trim() ||
                                                    editingCommentText.length > 1000
                                                }
                                                className="rounded-lg bg-red-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : comment.is_removed ? (
                                <p className="mt-2 text-sm italic text-gray-500 dark:text-gray-400">
                                    This comment was removed for violating community guidelines.
                                </p>
                            ) : (
                                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700 dark:text-gray-300">
                                    {comment.text}
                                </p>
                            )}

                            {!comment.is_removed && (
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleCommentReaction(comment.id, "like")
                                        }
                                        aria-label="Like comment"
                                        aria-pressed={comment.is_liked}
                                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition ${
                                            comment.is_liked
                                                ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                                                : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#303030]"
                                            }`}
                                    >
                                        <span>👍</span>
                                        <span>{comment.likes_count}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleCommentReaction(comment.id, "dislike")
                                        }
                                        aria-label="Dislike comment"
                                        aria-pressed={comment.is_disliked}
                                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition ${
                                            comment.is_disliked
                                                ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                                                : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#303030]"
                                        }`}
                                    >
                                        <span>👎</span>
                                        <span>{comment.dislikes_count}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleReplyClick(comment.id)}
                                        className="rounded-full px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-red-700 dark:text-gray-300 dark:hover:bg-[#303030] dark:hover:text-red-400"
                                    >
                                        Reply
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {!comment.is_removed && reportingCommentId === comment.id && (
                    <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-[#303030] dark:bg-[#181818]">
                        <h3 className="mb-3 font-semibold text-gray-900 dark:text-gray-100">
                            Report comment
                        </h3>

                        <label
                            htmlFor={`report-reason-${comment.id}`}
                            className="mb-1 block text-sm text-gray-700 dark:text-gray-300"
                        >
                            Reason
                        </label>

                        <select
                            id={`report-reason-${comment.id}`}
                            value={reportReason}
                            onChange={(event) => setReportReason(event.target.value)}
                            className="mb-3 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100"
                        >
                            <option value="spam">Spam</option>
                            <option value="harassment">Harassment or bullying</option>
                            <option value="hate_speech">Hate speech</option>
                            <option value="inappropriate">Inappropriate content</option>
                            <option value="misinformation">Misleading information</option>
                            <option value="other">Other</option>
                        </select>

                        <label
                            htmlFor={`report-details-${comment.id}`}
                            className="mb-1 block text-sm text-gray-700 dark:text-gray-300"
                        >
                            Additional details (optional)
                        </label>

                        <textarea
                            id={`report-details-${comment.id}`}
                            value={reportDetails}
                            onChange={(event) =>
                                setReportDetails(event.target.value.slice(0, 500))
                            }
                            maxLength={500}
                            rows={3}
                            placeholder="Tell us more..."
                            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 outline-none focus:border-red-600 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100"
                        />

                        <div className="mt-3 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setReportingCommentId(null)}
                                disabled={submittingReport}
                                className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#303030]"
                            >
                                Cancel
                           </button>

                            <button
                                type="button"
                                onClick={() => handleReportComment(comment.id)}
                                disabled={submittingReport}
                                className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-50"
                            >
                                {submittingReport ? "Submitting..." : "Submit report"}
                            </button>
                        </div>
                    </div>
                )}

                {replies.length > 0 && (
                    <div className="mt-3 space-y-3">
                        {replies.map((reply) => renderComment(reply, depth + 1))}
                    </div>
                )}
            </div>
        );
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
        <main className="min-h-screen bg-gray-100 dark:bg-[#0f0f0f]">

            <Navbar />

            <section className="mx-auto max-w-5xl px-8 py-10">

                <video
                    controls
                    poster={video.thumbnail}
                    className="w-full rounded-xl"
                >
                    <source src={video.video_file} />
                </video>

                <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {video.title}
                </h1>

                <div className="mt-5 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-[#303030] dark:bg-[#181818] sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-4">

                        <a href={`/profile/${video.user_id}`} className="shrink-0">
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
                                {channel?.subscribers_count ?? 0} subscribers
                                {" • "}
                                {video.views_count} views
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
                                ? "Updating..."
                                : channel.is_subscribed
                                    ? "Unsubscribe"
                                    : "Subscribe"}
                        </button>
                    )}

                </div>

                <p className="mt-6 text-gray-700 dark:text-gray-300">
                    {video.description}
                </p>

                <div className="mt-6 flex gap-3">

                    <button
                        onClick={() => handleReaction("like")}
                        className="rounded-lg bg-red-700 px-5 py-2 font-medium text-white hover:bg-red-800"
                    >
                        👍 Like {likesCount}
                    </button>

                    <button
                        onClick={() => handleReaction("dislike")}
                        className="rounded-lg border border-gray-300 bg-white px-5 py-2 font-medium text-gray-700 transition hover:bg-gray-50 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-300 dark:hover:bg-[#303030]"
                    >
                        👎 Dislike {dislikesCount}
                    </button>

                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(
                                window.location.href
                            );

                            alert("Link copied!");
                        }}
                        className="rounded-lg border border-gray-300 bg-white px-5 py-2 font-medium text-gray-700 transition hover:bg-gray-50 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-300 dark:hover:bg-[#303030]"
                    >
                        🔗 Share
                    </button>

                </div>

            </section>

            <section className="mx-auto mt-10 max-w-5xl px-8 pb-10">

                <h2 className="mb-5 text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Comments
                </h2>

                <form
                    ref={commentFormRef}
                    onSubmit={handleCommentSubmit}
                    className="mb-8 rounded-xl border border-gray-200 bg-white p-4 dark:border-[#303030] dark:bg-[#181818]"
                >
                    {replyingTo !== null && (
                        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-red-50 px-3 py-2 dark:bg-red-950/30">
                            <div className="text-sm text-red-700 dark:text-red-300">
                                Replying to{" "}
                                <span className="font-semibold">
                                    {comments.find((comment) => comment.id === replyingTo)?.username
                                        ?? "comment"}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => setReplyingTo(null)}
                                className="rounded-md px-2 py-1 text-xs font-semibold text-gray-600 transition hover:bg-red-100 dark:text-gray-300 dark:hover:bg-red-900/40"
                            >
                                Cancel
                            </button>
                        </div>
                    )}

                    <label
                        htmlFor="comment"
                        className="mb-3 block text-sm font-semibold text-gray-900 dark:text-gray-100"
                    >
                        {replyingTo !== null ? "Write a reply" : "Leave a comment"}
                    </label>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                        {["😀", "😂", "😍", "❤️", "🔥", "👍", "😎", "😭", "🎮", "👏", "💩"].map(
                            (emoji) => (
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
                                    aria-label={`Insert ${emoji} emoji`}
                                    className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-lg transition hover:scale-110 hover:bg-gray-100 dark:border-[#404040] dark:bg-[#202020] dark:hover:bg-[#303030]"
                                >
                                    {emoji}
                                </button>
                            )
                        )}
                    </div>

                    <textarea
                        ref={commentTextareaRef}
                        id="comment"
                        value={commentText}
                        onChange={(e) =>
                            setCommentText(e.target.value.slice(0, 1000))
                        }
                        placeholder="Share your thoughts..."
                        maxLength={1000}
                        className="w-full resize-y rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-700 focus:ring-1 focus:ring-red-700 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100 dark:placeholder:text-gray-500"
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
                            {commentText.length}/1000 characters
                        </span>

                        <button
                            type="submit"
                            disabled={!commentText.trim() || submittingComment}
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
                                    Posting...
                                </>
                            ) : (
                                replyingTo !== null ? "Post Reply" : "Add Comment"
                            )}
                        </button>
                    </div>
                </form>

                <div className="space-y-4">

                    {comments
                        .filter((comment) => comment.parent_comment_id === null)
                        .map((comment) => renderComment(comment))}
                </div>
            </section>
        </main>
    );
}

function getRelativeTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();

    const seconds = Math.floor(
        (now.getTime() - date.getTime()) / 1000
    );

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    if (seconds < 10) return "Just now";
    if (seconds < 60) return `${seconds} seconds ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    }

    const days = Math.floor(hours / 24);
    if (days < 30) {
        return `${days} day${days !== 1 ? "s" : ""} ago`;
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
        return `${months} month${months !== 1 ? "s" : ""} ago`;
    }

    const years = Math.floor(days / 365);
    return `${years} year${years !== 1 ? "s" : ""} ago`;
}