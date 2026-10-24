"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API, apiFetch } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

export interface DashboardVideo {
    id: number;
    title: string;
    description: string;
    thumbnail: string | null;
    views_count: number;
    likes_count: number;
    dislikes_count: number;
    comments_count: number;
}

export interface DashboardStats {
    videos_count: number;
    subscribers_count: number;
    following_count: number;
    total_views: number;
    total_likes: number;
    total_comments: number;
}

const initialStats: DashboardStats = {
    videos_count: 0,
    subscribers_count: 0,
    following_count: 0,
    total_views: 0,
    total_likes: 0,
    total_comments: 0,
};

export function useDashboard() {
    const router = useRouter();
    const { language } = useLanguage();
    const t = translations[language].dashboard;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [videos, setVideos] = useState<DashboardVideo[]>([]);
    const [stats, setStats] = useState<DashboardStats>(initialStats);

    useEffect(() => {
        let cancelled = false;

        const getDashboard = async () => {
            const token = localStorage.getItem("accessToken");

            if (!token) {
                router.push("/login");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const response = await apiFetch(`${API}/dashboard/`);

                if (response.status === 401) {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("username");
                    router.push("/login");
                    return;
                }

                if (!response.ok) {
                    throw new Error(t.loadFailed);
                }

                const data = await response.json();

                if (cancelled) return;

                setVideos(data.videos);
                setStats({
                    videos_count: data.videos_count,
                    subscribers_count: data.subscribers_count,
                    following_count: data.following_count,
                    total_views: data.total_views,
                    total_likes: data.total_likes,
                    total_comments: data.total_comments,
                });
            } catch (err) {
                console.error("Dashboard error:", err);

                if (!cancelled) {
                    setError(t.loadFailed);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        getDashboard();

        return () => {
            cancelled = true;
        };
    }, [router, t.loadFailed]);

    const deleteVideo = async (
        videoId: number
    ): Promise<{ success: boolean; message?: string }> => {
        if (!localStorage.getItem("accessToken")) {
            router.push("/login");
            return { success: false };
        }

        try {
            const response = await apiFetch(
                `${API}/videos/${videoId}/delete/`,
                { method: "DELETE" }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("username");
                    router.push("/login");
                    return { success: false };
                }

                return {
                    success: false,
                    message: data.error || t.deleteFailed,
                };
            }

            const deletedVideo = videos.find(
                (video) => video.id === videoId
            );

            setVideos((previousVideos) =>
                previousVideos.filter((video) => video.id !== videoId)
            );

            if (deletedVideo) {
                setStats((previousStats) => ({
                    ...previousStats,
                    videos_count: Math.max(
                        0,
                        previousStats.videos_count - 1
                    ),
                    total_views: Math.max(
                        0,
                        previousStats.total_views - deletedVideo.views_count
                    ),
                    total_likes: Math.max(
                        0,
                        previousStats.total_likes - deletedVideo.likes_count
                    ),
                    total_comments: Math.max(
                        0,
                        previousStats.total_comments -
                            deletedVideo.comments_count
                    ),
                }));
            }

            return { success: true };
        } catch (err) {
            console.error("Delete error:", err);

            return {
                success: false,
                message: t.generalError,
            };
        }
    };

    return {
        loading,
        error,
        videos,
        stats,
        deleteVideo,
    };
}