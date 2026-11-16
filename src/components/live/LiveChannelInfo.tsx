"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API, apiFetch, ensureAccessToken } from "@/lib/api";
import type { Channel } from "@/types/video";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

interface LiveChannelInfoProps {
    ownerId: number;
    fallbackUsername: string;
}

interface SubscribeResponse {
    subscribed?: boolean;
    subscribers_count?: number;
    error?: string;
}

export default function LiveChannelInfo({
    ownerId,
    fallbackUsername,
}: LiveChannelInfoProps) {
    const { language, isPersian } = useLanguage();
    const t = translations[language].videoDetail;

    const [channel, setChannel] = useState<Channel | null>(null);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState(false);

    const numberFormatter = new Intl.NumberFormat(
        isPersian ? "fa-IR" : "en-US"
    );

    useEffect(() => {
        let cancelled = false;

        const loadChannel = async () => {
            setLoading(true);
            setChannel(null);

            try {
                await ensureAccessToken();

                const response = await apiFetch(
                    `${API}/users/${ownerId}/`
                );

                if (!response.ok) {
                    throw new Error("Failed to load channel.");
                }

                const data: Channel = await response.json();

                if (!cancelled) {
                    setChannel(data);
                }
            } catch (error) {
                console.error("Live channel loading error:", error);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void loadChannel();

        return () => {
            cancelled = true;
        };
    }, [ownerId]);

    const handleSubscribe = async () => {
        if (!channel || channel.is_owner || subscribing) return;

        const token = await ensureAccessToken();

        if (!token) {
            window.alert(t.loginRequired);
            return;
        }

        try {
            setSubscribing(true);

            const response = await apiFetch(
                `${API}/users/${ownerId}/subscribe/`,
                { method: "POST" }
            );

            const data: SubscribeResponse = await response
                .json()
                .catch(() => ({}));

            if (!response.ok) {
                window.alert(data.error || t.subscriptionFailed);
                return;
            }

            if (
                typeof data.subscribed !== "boolean" ||
                typeof data.subscribers_count !== "number"
            ) {
                window.alert(t.generalError);
                return;
            }

            setChannel((current) =>
                current
                    ? {
                        ...current,
                        is_subscribed: data.subscribed!,
                        subscribers_count: data.subscribers_count!,
                    }
                    : current
            );
        } catch (error) {
            console.error("Live subscribe error:", error);
            window.alert(t.generalError);
        } finally {
            setSubscribing(false);
        }
    };

    const username = channel?.username || fallbackUsername;

    return (
        <>
            <div className="flex min-w-0 items-center gap-4">
                <Link
                    href={`/profile/${ownerId}`}
                    aria-label={username}
                    className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >
                    {channel?.profile_image ? (
                        <img
                            src={channel.profile_image}
                            alt={username}
                            className="h-14 w-14 rounded-full object-cover"
                        />
                    ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 text-xl font-bold text-gray-600 dark:bg-[#303030] dark:text-gray-300">
                            {(username || "?").charAt(0).toUpperCase()}
                        </div>
                    )}
                </Link>

                <div className="min-w-0">
                    <Link
                        href={`/profile/${ownerId}`}
                        className="break-words font-semibold text-gray-900 transition hover:text-red-700 dark:text-gray-100 dark:hover:text-red-400"
                    >
                        <bdi dir="auto">{username}</bdi>
                    </Link>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {channel
                            ? `${numberFormatter.format(channel.subscribers_count)} ${t.subscribers}`
                            : loading
                                ? isPersian
                                    ? "در حال دریافت اطلاعات کانال..."
                                    : "Loading channel..."
                                : ""}
                    </p>
                </div>
            </div>

            {channel && !channel.is_owner && (
                <button
                    type="button"
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
        </>
    );
}