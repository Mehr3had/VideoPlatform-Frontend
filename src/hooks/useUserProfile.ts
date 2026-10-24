"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API, apiFetch } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

interface Profile {
    id?: number;
    username: string;
    profile_image?: string | null;
    bio?: string | null;
    is_owner: boolean;
    is_subscribed: boolean;
    videos_count: number;
    subscribers_count: number;
}

interface Video {
    id: number;
    title: string;
    thumbnail?: string | null;
    username: string;
    views_count: number;
    category_name?: string | null;
}

interface SubscribeResponse {
    subscribed?: boolean;
    subscribers_count?: number;
    error?: string;
}

export default function useUserProfile() {
    const params = useParams();
    const userId = String(params.id);

    const { language } = useLanguage();
    const t = translations[language].profile;

    const [profile, setProfile] = useState<Profile | null>(null);
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const loadProfile = async () => {
            setLoading(true);

            try {
                const [profileResponse, videosResponse] = await Promise.all([
                    apiFetch(`${API}/users/${userId}/`),
                    fetch(`${API}/users/${userId}/videos/`),
                ]);

                if (!profileResponse.ok) {
                    throw new Error("Failed to fetch profile");
                }

                const profileData: Profile = await profileResponse.json();

                let videosData: Video[] = [];

                if (videosResponse.ok) {
                    videosData = await videosResponse.json();
                }

                if (!cancelled) {
                    setProfile(profileData);
                    setVideos(videosData);
                }
            } catch (error) {
                console.error("Profile loading error:", error);

                if (!cancelled) {
                    setProfile(null);
                    setVideos([]);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadProfile();

        return () => {
            cancelled = true;
        };
    }, [userId]);

    const handleSubscribe = async () => {
        if (!localStorage.getItem("accessToken")) {
            window.alert(t.loginRequired);
            return;
        }

        try {
            const response = await apiFetch(
                `${API}/users/${userId}/subscribe/`,
                { method: "POST" }
            );

            const data: SubscribeResponse = await response
                .json()
                .catch(() => ({}));

            if (response.status === 401) {
                window.alert(t.loginRequired);
                return;
            }

            if (!response.ok) {
                window.alert(data.error || t.actionFailed);
                return;
            }

            if (
                typeof data.subscribed !== "boolean" ||
                typeof data.subscribers_count !== "number"
            ) {
                window.alert(t.actionFailed);
                return;
            }

            setProfile((previousProfile) =>
                previousProfile
                    ? {
                          ...previousProfile,
                          is_subscribed: data.subscribed!,
                          subscribers_count: data.subscribers_count!,
                      }
                    : previousProfile
            );
        } catch (error) {
            console.error("Subscribe error:", error);
            window.alert(t.actionFailed);
        }
    };

    return {
        profile,
        videos,
        loading,
        handleSubscribe,
    };
}