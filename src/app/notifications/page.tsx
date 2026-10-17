"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { API } from "@/lib/api";

interface Notification {
    id: number;
    sender: string | null;
    type: string;
    message: string;
    video_id: number | null;
    video_title: string | null;
    comment_id: number | null;
    is_read: boolean;
    created_at: string;
    interaction_count: number;
}

const notificationIcons: Record<string, string> = {
    subscription: "👤",
    video_like: "👍",
    comment: "💬",
    comment_reply: "↩️",
    comment_like: "❤️",
    activity_digest: "📬",
    milestone: "🎉",
    new_video: "🎬",
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const loadNotifications = useCallback(async () => {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            setError("Please log in to view your notifications.");
            setLoading(false);
            return;
        }

        try {
            setError("");

            const response = await fetch(`${API}/notifications/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
            });

            if (response.status === 401) {
                setError("Your session has expired. Please log in again.");
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to load notifications.");
            }

            const data: Notification[] = await response.json();
            setNotifications(data);
        } catch (err) {
            console.error("Notifications error:", err);
            setError("Could not load notifications. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    const markAsRead = async (id: number) => {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            setError("Please log in to continue.");
            return;
        }

        try {
            setUpdatingId(id);
            setError("");

            const response = await fetch(
                `${API}/notifications/${id}/read/`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update notification.");
            }

            setNotifications((current) => {
                const updated = current.map((notification) => 
                    notification.id === id
                        ? { ...notification, is_read: true }
                        : notification
                );

                const unreadCount = updated.filter(
                    (notification) => !notification.is_read
                ).length;

                window.dispatchEvent(
                    new CustomEvent("notifications-updated", {
                        detail: unreadCount,
                    })
                );

                return updated;
            });

        } catch (err) {
            console.error("Mark as read error:", err);
            setError("Could not mark the notification as read.");
        } finally {
            setUpdatingId(null);
        }
    };

    const markAllAsRead = async () => {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            setError("Please log in to continue.");
            return;
        }

        try {
            setError("");
            setUpdatingId(-1);

            const response = await fetch(
                `${API}/notifications/read-all/`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if(!response.ok) {
                throw new Error("Failed to mark all notifications as read.");
            }

            setNotifications((current) => 
                current.map((notification) => ({
                    ...notification,
                    is_read: true,
                }))
            );

            window.dispatchEvent(
                new CustomEvent("notifications-updated", {
                    detail: 0,
                })
            );
        } catch (err) {
            console.error("Mark all as read error:", err);
            setError("Could not mark all notifications as read.");
        } finally {
            setUpdatingId(null);
        }
    };

    const deleteAllNotifications = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete all notifications? This action cannot be undone."
        );

        if (!confirmed) return;

        const token = localStorage.getItem("accessToken");

        if (!token) {
            setError("Please log in to continue.");
            return;
        }

        try {
            setError("");
            setUpdatingId(-1);

            const response = await fetch(
                `${API}/notifications/delete-all/`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete notifications.");
            }

            setNotifications([]);

            window.dispatchEvent(
                new CustomEvent("notifications-updated", {
                    detail: 0,
                })
            );
        } catch (err) {
            console.error("Delete all notifications error:", err);
            setError("Could not delete all notifications.");
        } finally {
            setUpdatingId(null);
        }
    }

    const deleteNotification = async (id: number) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this notification?"
        );

        if (!confirmed) return;

        const token = localStorage.getItem("accessToken");

        if (!token) {
            setError("Please log in to continue.");
            return;
        }

        try {
            setError("");
            setUpdatingId(id);

            const response = await fetch(
                `${API}/notifications/${id}/delete/`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete notification.");
            }

            setNotifications((current) =>
                current.filter(
                    (notification) => notification.id !== id
                )
            );

            const unreadCount = notifications.filter(
                (notification) =>
                    !notification.is_read &&
                    notification.id !== id
            ).length;

            window.dispatchEvent(
                new CustomEvent("notifications-updated", {
                    detail: unreadCount,
                })
            );
        } catch (err) {
            console.error("Delete notification error:", err);
            setError("Could not delete this notification.");
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) {
        return (
            <main className="mx-auto max-w-4xl px-6 py-12">
                <p className="text-gray-500">Loading notifications...</p>
            </main>
        );
    }

    return (
        <main className="mx-auto min-h-screen max-w-4xl bg-gray-100 px-6 py-10 dark:bg-[#0f0f0f]">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Notifications
                    </h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Stay up to date with your channel activity.
                    </p>
                    <Link
                        href="/"
                        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-red-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                        <span aria-hidden="true">←</span>
                        Back to Home
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    <span className="whitespace-nowrap rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 dark:bg-red-950/50 dark:text-red-400">
                        {notifications.filter((n) => !n.is_read).length} unread
                    </span>

                    {notifications.some((notification) => !notification.is_read) && (
                        <button
                            onClick={markAllAsRead}
                            disabled={updatingId === -1}
                            className="whitespace-nowrap rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-800 disabled:opacity-50"
                        >
                            {updatingId === -1
                                ? "Updating..."
                                : "Mark all as read"}
                        </button>
                    )}

                    {notifications.length > 0 && (
                        <button
                            onClick={deleteAllNotifications}
                            disabled={updatingId === -1}
                            className="whitespace-nowrap rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/50"
                        >
                            {updatingId === -1
                                ? "Updating..."
                                : "Delete all"}
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div
                    role="alert"
                    className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                >
                    {error}

                    {error.toLowerCase().includes("log in") && (
                        <Link
                            href="/login"
                            className="ml-2 font-semibold underline"
                        >
                            Login
                        </Link>
                    )}

                    <button
                        onClick={loadNotifications}
                        className="ml-3 font-semibold underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            {notifications.length === 0 && !error ? (
                <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center dark:border-[#303030] dark:bg-[#181818]">
                    <div className="mb-4 text-5xl">🔔</div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        You’re all caught up!
                    </h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                        New activity on your channel will appear here.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notification) => (
                        <article
                            key={notification.id}
                            className={`flex flex-col gap-4 rounded-xl border p-5 transition sm:flex-row sm:items-center ${
                                notification.is_read
                                    ? "border-gray-200 bg-white dark:border-[#303030] dark:bg-[#181818]"
                                    : "border-red-200 bg-red-50/60 dark:border-red-900/70 dark:bg-red-950/20"
                            }`}
                        >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-2xl shadow-sm dark:bg-[#252525]">
                                {notificationIcons[notification.type] ?? "🔔"}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {notification.type === "video_like" &&
                                    notification.interaction_count > 1
                                        ? `${notification.interaction_count} people liked your video.`
                                        : notification.message}
                                </p>
                                
                                {notification.type === "video_like" &&
                                    notification.interaction_count > 0 && (
                                        <p className="mt-1 text-sm font-medium text-red-700 dark:text-red-400">
                                            👍 {notification.interaction_count} interactions
                                        </p>
                                    )}

                                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                    {notification.sender && (
                                        <span>From {notification.sender}</span>
                                    )}

                                    {notification.sender && (
                                        <span aria-hidden="true">·</span>
                                    )}

                                    <time dateTime={notification.created_at}>
                                        {new Date(
                                            notification.created_at
                                        ).toLocaleString()}
                                    </time>
                                </div>

                                {notification.video_id && (
                                    <Link
                                        href={`/videos/${notification.video_id}`}
                                        className="mt-2 inline-block text-sm font-medium text-red-700 hover:underline dark:text-red-400"
                                    >
                                        {notification.video_title
                                            ? `Watch: ${notification.video_title}`
                                            : "View video"}
                                    </Link>
                                )}
                            </div>

                            {!notification.is_read && (
                                <button
                                    onClick={() => markAsRead(notification.id)}
                                    disabled={updatingId === notification.id}
                                    className="shrink-0 rounded-lg border border-red-700 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white"
                                >
                                    {updatingId === notification.id
                                        ? "Updating..."
                                        : "Mark as read"}
                                </button>
                            )}
                                <button
                                    onClick={() => deleteNotification(notification.id)}
                                    disabled={
                                        updatingId === notification.id ||
                                        updatingId === -1
                                    }
                                    className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/50"
                                >
                                    {updatingId === notification.id
                                        ? "Deleting..."
                                        : "Delete"}
                                </button>
                            
                            {notification.is_read && (
                                <span className="shrink-0 text-sm text-gray-400 dark:text-gray-500">
                                    ✓ Read
                                </span>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
}
