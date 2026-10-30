"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { API, BACKEND_URL, apiFetch } from "@/lib/api";
import type { Video, Channel } from "@/types/video";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

export interface VideoComment {
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

export function useVideoDetail() {
    const params = useParams<{ id: string }>();
    const videoId = params.id;
    const { language } = useLanguage();
    const t = translations[language].videoDetail;
    const [subscribing, setSubscribing] = useState(false);
    const [video, setVideo] = useState<Video | null>(null);
    const [channel, setChannel] = useState<Channel | null>(null);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [likesCount, setLikesCount] = useState(0);
    const [dislikesCount, setDislikesCount] = useState(0);
    const [userReaction, setUserReaction] = useState<
        "like" | "dislike" | null
    >(null);
    const [comments, setComments] = useState<VideoComment[]>([]);
    const [commentText, setCommentText] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submittingReport, setSubmittingReport] = useState(false);
    const [reactingCommentIds, setReactingCommentIds] = useState<number[]>([]);
    const reactingCommentIdsRef = useRef(new Set<number>());

    useEffect(() => {
        let cancelled = false;

        async function getVideo() {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`${API}/videos/${videoId}/`);

                if (!response.ok) {
                    throw new Error("loadFailed");
                }

                const data: Video = await response.json();

                if (cancelled) return;

                setVideo(data);
                setLikesCount(data.likes_count);
                setDislikesCount(data.dislikes_count);
                setUserReaction(null);

                const token = localStorage.getItem("accessToken");

                if (token) {
                    try {
                        const reactionResponse = await apiFetch(
                            `${BACKEND_URL}/videos/${videoId}/react/`
                        );

                        if (reactionResponse.ok) {
                            const reactionData = await reactionResponse.json();

                            if (!cancelled) {
                                setUserReaction(reactionData.reaction);
                                setLikesCount(reactionData.likes_count);
                                setDislikesCount(reactionData.dislikes_count);
                            }
                        }
                    } catch (error) {
                        console.error("Failed to get video reaction:", error);
                    }
                }

                if (token) {
                    try {
                        const userResponse = await apiFetch(
                            `${BACKEND_URL}/videos/api/me/`
                        );

                        if (userResponse.ok) {
                            const userData = await userResponse.json();

                            if (!cancelled) {
                                setCurrentUserId(userData.id);
                            }
                        } else if (!cancelled) {
                            setCurrentUserId(null);
                        }
                    } catch (error) {
                        console.error("Failed to get current user:", error);

                        if (!cancelled) {
                            setCurrentUserId(null);
                        }
                    }
                } else {
                    setCurrentUserId(null);
                }

                const channelResponse = await apiFetch(
                    `${API}/users/${data.user_id}/`
                );

                if (channelResponse.ok) {
                    const channelData: Channel =
                        await channelResponse.json();

                    if (!cancelled) {
                        setChannel(channelData);
                    }
                }

                await apiFetch(`${API}/videos/${videoId}/view/`, {
                    method: "POST",
                });

                const commentsResponse = token
                    ? await apiFetch(`${BACKEND_URL}/videos/${videoId}/comments/`)
                    : await fetch(`${BACKEND_URL}/videos/${videoId}/comments/`);

                if (commentsResponse.ok) {
                    const commentsData: VideoComment[] =
                        await commentsResponse.json();

                    if (!cancelled) {
                        setComments(commentsData);
                    }
                }
            } catch (error) {
                console.error("Video detail error:", error);

                if (!cancelled) {
                    setError("loadFailed");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        getVideo();

        return () => {
            cancelled = true;
        };
    }, [videoId]);

    const handleReaction = async (reaction: "like" | "dislike") => {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            alert(t.loginRequired);
            return;
        }

        try {
            const response = await apiFetch(
                `${BACKEND_URL}/videos/${videoId}/react/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ reaction }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || t.generalError);
                return;
            }

            setLikesCount(data.likes_count);
            setDislikesCount(data.dislikes_count);
            setUserReaction(data.reaction);
        } catch (error) {
            console.error("Reaction error:", error);
            alert(t.generalError);
        }
    };

    const handleSubscribe = async () => {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            alert(t.loginRequired);
            return;
        }

        if (!channel || subscribing || !video) return;

        try {
            setSubscribing(true);

            const response = await apiFetch(
                `${API}/users/${video.user_id}/subscribe/`,
                {
                    method: "POST",
                }
            );

            const data = await response.json();

            console.log("Subscribe response:", data);

            if (!response.ok) {
                alert(data.error || t.subscriptionFailed);
                return;
            }

            setChannel((current) => {
                if (!current) return current;

                return {
                    ...current,
                    is_subscribed: data.subscribed,
                    subscribers_count: data.subscribers_count,
                };
            });
        } catch (error) {
            console.error("Subscribe error:", error);
            alert(t.generalError);
        } finally {
            setSubscribing(false);
        }
    };

    const handleCommentReaction = async (
        commentId: number,
        reaction: "like" | "dislike"
    ) => {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            alert(t.loginRequired);
            return;
        }

        const previousComment = comments.find(
            (comment) => comment.id === commentId
        );

        if (!previousComment) return;

        if (reactingCommentIdsRef.current.has(commentId)) return;

        reactingCommentIdsRef.current.add(commentId);

        setReactingCommentIds((previous) => [
            ...previous,
            commentId,
        ]);

        // Save the current state for rollback.
        const previousState = {
            likes_count: previousComment.likes_count,
            dislikes_count: previousComment.dislikes_count,
            is_liked: previousComment.is_liked,
            is_disliked: previousComment.is_disliked,
        };

        // Update the UI immediately.
        setComments((previousComments) =>
            previousComments.map((comment) => {
                if (comment.id !== commentId) return comment;

                if (reaction === "like") {
                    const isRemovingLike = comment.is_liked;

                    return {
                        ...comment,
                        likes_count: Math.max(
                            0,
                            comment.likes_count + (isRemovingLike ? -1 : 1)
                        ),
                        dislikes_count: Math.max(
                            0,
                            comment.dislikes_count -
                                (comment.is_disliked ? 1 : 0)
                        ),
                        is_liked: !isRemovingLike,
                        is_disliked: false,
                    };
                }

                const isRemovingDislike = comment.is_disliked;

                return {
                    ...comment,
                    likes_count: Math.max(
                        0,
                        comment.likes_count -
                            (comment.is_liked ? 1 : 0)
                    ),
                    dislikes_count: Math.max(
                        0,
                        comment.dislikes_count +
                            (isRemovingDislike ? -1 : 1)
                    ),
                    is_liked: false,
                    is_disliked: !isRemovingDislike,
                };
            })
        );

        const endpoint = reaction === "like" ? "like" : "dislike";

        try {
            const response = await apiFetch(
                `${BACKEND_URL}/videos/api/comments/${commentId}/${endpoint}/`,
                {
                    method: "POST",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || t.generalError);
            }

            // Replace the optimistic state with the server response.
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

            // Roll back if the request fails.
            setComments((previousComments) =>
                previousComments.map((comment) =>
                    comment.id === commentId
                        ? { ...comment, ...previousState }
                        : comment
                )
            );

            alert(
                error instanceof Error ? error.message : t.generalError
            );
        } finally {
            reactingCommentIdsRef.current.delete(commentId);

            setReactingCommentIds((previous) =>
                previous.filter((id) => id !== commentId)
            );
        }
    };

    const handleCommentSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        const token = localStorage.getItem("accessToken");

        if (!token) {
            alert(t.loginRequired);
            return;
        }

        const text = commentText.trim();

        if (!text || submittingComment) {
            return;
        }

        if (text.length > 1000) {
            alert(t.commentTooLong);
            return;
        }

        try {
            setSubmittingComment(true);

            const response = await apiFetch(
                `${BACKEND_URL}/videos/${videoId}/comments/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
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

            if (!response.ok) {
                alert(data.error || t.generalError);
                return;
            }

            setComments((previousComments) => [
                data.comment,
                ...previousComments,
            ]);

            setCommentText("");
            setReplyingTo(null);
        } catch (error) {
            console.error("Comment error:", error);
            alert(t.generalError);
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleEditComment = async (
        commentId: number,
        editingCommentText: string,
        setEditingCommentId: (id: number | null) => void,
        setEditingCommentText: (text: string) => void
    ) => {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            alert(t.loginRequired);
            return;
        }

        const text = editingCommentText.trim();

        if (!text || text.length > 1000) {
            alert(t.invalidCommentLength);
            return;
        }

        try {
            const response = await apiFetch(
                `${BACKEND_URL}/videos/api/comments/${commentId}/edit/`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ text }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || t.generalError);
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
            alert(t.generalError);
        }
    };

    const handleDeleteComment = async (
        commentId: number,
        editingCommentId: number | null,
        setEditingCommentId: (id: number | null) => void,
        setEditingCommentText: (text: string) => void
    ) => {
        const confirmed = window.confirm(t.deleteConfirmation);

        if (!confirmed) return;

        const token = localStorage.getItem("accessToken");

        if (!token) {
            alert(t.loginRequired);
            return;
        }

        try {
            const response = await apiFetch(
                `${BACKEND_URL}/videos/api/comments/${commentId}/delete/`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                alert(data.error || t.generalError);
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
            alert(t.generalError);
        }
    };

    const handleReportComment = async (
        commentId: number,
        reportReason: string,
        reportDetails: string,
        setReportingCommentId: (id: number | null) => void,
        setReportReason: (reason: string) => void,
        setReportDetails: (details: string) => void,
        setEditingCommentId: (id: number | null) => void
    ) => {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            alert(t.loginRequired);
            return;
        }

        if (reportDetails.length > 500) {
            alert(t.detailsTooLong);
            return;
        }

        try {
            setSubmittingReport(true);

            const response = await apiFetch(
                `${BACKEND_URL}/videos/api/comments/${commentId}/report/`,
                {
                    method: "POST",
                    headers: {
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
                    alert(t.alreadyReported);
                } else {
                    alert(data.error || t.reportFailed);
                }
                return;
            }

            alert(t.reportSuccess);

            setReportingCommentId(null);
            setReportReason("spam");
            setReportDetails("");
            setEditingCommentId(null);
        } catch (error) {
            console.error("Report comment error:", error);
            alert(t.generalError);
        } finally {
            setSubmittingReport(false);
        }
    };

    return {
        videoId,
        video,
        channel,
        currentUserId,
        likesCount,
        dislikesCount,
        userReaction,
        setUserReaction,
        comments,
        commentText,
        setCommentText,
        submittingComment,
        replyingTo,
        setReplyingTo,
        handleCommentSubmit,
        loading,
        error,
        setLikesCount,
        setDislikesCount,
        setComments,
        setChannel,
        handleReaction,
        handleSubscribe,
        subscribing,
        handleCommentReaction,
        handleEditComment,
        handleDeleteComment,
        submittingReport,
        handleReportComment,
        reactingCommentIds,
    };
}