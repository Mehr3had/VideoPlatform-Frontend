"use client";

import { useCallback, useEffect, useState } from "react";
import {
    API,
    apiFetch,
    ensureAccessToken,
    clearAccessToken,
} from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

export interface Notification {
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

export const notificationIcons: Record<string, string> = {
    subscription: "ðŸ‘¤",
    video_like: "ðŸ‘",
    comment: "ðŸ’¬",
    comment_reply: "â†©ï¸",
    comment_like: "â",
    activity_digest: "ðŸ“¬",
    milestone: "ðŸŽ‰",
    new_video: "ðŸŽ¬",
};

export default function useNotifications() {
    const { language } = useLanguage();
    const t = translations[language].notifications;

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const syncUnreadCount = (items: Notification[]) => {
        const unreadCount = items.filter(
            (notification) => !notification.is_read
        ).length;

        window.dispatchEvent(
            new CustomEvent("notifications-updated", {
                detail: unreadCount,
            })
        );
    };

    const loadNotifications = useCallback(async () => {
        const token = await ensureAccessToken();

        if (!token) {
            setNotifications([]);
            setError(t.loginRequired);
            setLoading(false);
            syncUnreadCount([]);
            return;
        }

        try {
            setError("");

            const response = await apiFetch(`${API}/notifications/`, {
                cache: "no-store",
            });

            if (response.status === 401) {
                clearAccessToken();
                setError(t.sessionExpired);
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to load notifications.");
            }

            const data: Notification[] = await response.json();

            setNotifications(data);
            syncUnreadCount(data);
        } catch (err) {
            console.error("Notifications error:", err);
            setError(t.loadError);
        } finally {
            setLoading(false);
        }
    }, [language]);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    const markAsRead = async (id: number) => {
        const token = await ensureAccessToken();

        if (!token) {
            setError(t.loginToContinue);
            return;
        }

        try {
            setUpdatingId(id);
            setError("");

            const response = await apiFetch(
                `${API}/notifications/${id}/read/`,
                { method: "PATCH" }
            );

            if (response.status === 401) {
                clearAccessToken();
                throw new Error(t.sessionExpired);
            }

            if (!response.ok) {
                throw new Error("Failed to update notification.");
            }

            const updated = notifications.map((notification) =>
                notification.id === id
                    ? { ...notification, is_read: true }
                    : notification
            );

            setNotifications(updated);
            syncUnreadCount(updated);
        } catch (err) {
            console.error("Mark as read error:", err);
            setError(
                err instanceof Error ? err.message : t.markReadError
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const markAllAsRead = async () => {
        const token = await ensureAccessToken();

        if (!token) {
            setError(t.loginToContinue);
            return;
        }

        try {
            setError("");
            setUpdatingId(-1);

            const response = await apiFetch(
                `${API}/notifications/read-all/`,
                { method: "PATCH" }
            );

            if (response.status === 401) {
                clearAccessToken();
                throw new Error(t.sessionExpired);
            }

            if (!response.ok) {
                throw new Error("Failed to mark all notifications as read.");
            }

            const updated = notifications.map((notification) => ({
                ...notification,
                is_read: true,
            }));

            setNotifications(updated);
            syncUnreadCount(updated);
        } catch (err) {
            console.error("Mark all as read error:", err);
            setError(
                err instanceof Error ? err.message : t.markAllError
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const deleteAllNotifications = async () => {
        const token = await ensureAccessToken();

        if (!token) {
            setError(t.loginToContinue);
            return;
        }

        try {
            setError("");
            setUpdatingId(-1);

            const response = await apiFetch(
                `${API}/notifications/delete-all/`,
                { method: "DELETE" }
            );

            if (response.status === 401) {
                clearAccessToken();
                throw new Error(t.sessionExpired);
            }

            if (!response.ok) {
                throw new Error("Failed to delete notifications.");
            }

            setNotifications([]);
            syncUnreadCount([]);
        } catch (err) {
            console.error("Delete all notifications error:", err);
            setError(
                err instanceof Error ? err.message : t.deleteAllError
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const deleteNotification = async (id: number) => {
        const token = await ensureAccessToken();

        if (!token) {
            setError(t.loginToContinue);
            return;
        }

        try {
            setError("");
            setUpdatingId(id);

            const response = await apiFetch(
                `${API}/notifications/${id}/delete/`,
                { method: "DELETE" }
            );

            if (response.status === 401) {
                clearAccessToken();
                throw new Error(t.sessionExpired);
            }

            if (!response.ok) {
                throw new Error("Failed to delete notification.");
            }

            const updated = notifications.filter(
                (notification) => notification.id !== id
            );

            setNotifications(updated);
            syncUnreadCount(updated);
        } catch (err) {
            console.error("Delete notification error:", err);
            setError(
                err instanceof Error ? err.message : t.deleteOneError
            );
        } finally {
            setUpdatingId(null);
        }
    };

    return {
        notifications,
        loading,
        error,
        updatingId,
        loadNotifications,
        markAsRead,
        markAllAsRead,
        deleteAllNotifications,
        deleteNotification,
    };
}