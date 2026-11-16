"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
    API,
    apiFetch,
    ensureAccessToken,
    clearAccessToken,
} from "@/lib/api";

export function useNavbarNotifications() {
    const [unreadCount, setUnreadCount] = useState(0);
    const pathname = usePathname();

    useEffect(() => {
        let cancelled = false;

        const getUnreadCount = async () => {
            try {
                const token = await ensureAccessToken();

                if (cancelled) return;

                if (!token) {
                    setUnreadCount(0);
                    return;
                }

                const response = await apiFetch(
                    `${API}/notifications/unread-count/`
                );

                if (cancelled) return;

                if (response.status === 401) {
                    clearAccessToken();
                    setUnreadCount(0);
                    return;
                }

                if (!response.ok) return;

                const data = await response.json();

                if (!cancelled) {
                    setUnreadCount(
                        data.unread_count ?? data.count ?? 0
                    );
                }
            } catch (error) {
                console.error("Unread notifications error:", error);
            }
        };

        getUnreadCount();

        return () => {
            cancelled = true;
        };
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