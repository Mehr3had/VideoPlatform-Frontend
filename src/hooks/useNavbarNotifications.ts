"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { API, apiFetch } from "@/lib/api";

export function useNavbarNotifications() {
    const [unreadCount, setUnreadCount] = useState(0);
    const pathname = usePathname();

    useEffect(() => {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            setUnreadCount(0);
            return;
        }

        const getUnreadCount = async () => {
            try {
                const response = await apiFetch(
                    `${API}/notifications/unread-count/`
                );

                if (!response.ok) return;

                const data = await response.json();

                setUnreadCount(
                    data.unread_count ?? data.count ?? 0
                );
            } catch (error) {
                console.error("Unread notifications error:", error);
            }
        };

        getUnreadCount();
    }, [pathname]);

    useEffect(() => {
        const handleNotificationsUpdated = (event: Event) => {
            const customEvent = event as CustomEvent<number>;
            setUnreadCount(customEvent.detail);
        };

        window.addEventListener(
            "notifications-updated",
            handleNotificationsUpdated
        );

        return () => {
            window.removeEventListener(
                "notifications-updated",
                handleNotificationsUpdated
            );
        };
    }, []);

    return {
        unreadCount,
        setUnreadCount,
    };
}