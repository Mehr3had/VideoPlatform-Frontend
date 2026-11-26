"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
    API,
    apiFetch,
    ensureAccessToken,
    clearAccessToken,
} from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

interface ProfileData {
    id?: number;
    bio?: string | null;
}

export default function useEditProfile() {
    const router = useRouter();
    const { language } = useLanguage();
    const t = translations[language].editProfile;

    const [bio, setBio] = useState("");
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const getProfile = async () => {
            try {
                const token = await ensureAccessToken();

                if (cancelled) return;

                if (!token) {
                    router.replace("/login");
                    return;
                }

                const response = await apiFetch(`${API}/me/`);

                if (cancelled) return;

                if (response.status === 401) {
                    clearAccessToken();
                    router.replace("/login");
                    return;
                }

                if (!response.ok) {
                    throw new Error(t.loadFailed);
                }

                const data: ProfileData = await response.json();

                if (!cancelled) {
                    setBio(data.bio ?? "");
                }
            } catch (err) {
                console.error("Profile loading error:", err);

                if (!cancelled) {
                    setError(t.loadFailed);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        getProfile();

        return () => {
            cancelled = true;
        };
    }, [router, t.loadFailed]);

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        const token = await ensureAccessToken();

        if (!token) {
            router.replace("/login");
            return;
        }

        const formData = new FormData();
        formData.append("bio", bio);

        if (profileImage) {
            formData.append("profile_image", profileImage);
        }

        setSaving(true);
        setError("");

        try {
            const response = await apiFetch(`${API}/profile/edit/`, {
                method: "PATCH",
                body: formData,
            });

            const data = await response.json().catch(() => ({}));

            if (response.status === 401) {
                clearAccessToken();
                router.replace("/login");
                return;
            }

            if (!response.ok) {
                setError(data.error || t.updateFailed);
                return;
            }

            const params = new URLSearchParams();

            if (data.id != null) {
                params.set("id", String(data.id));
            }

            router.push(`/profile/edit/success?${params.toString()}`);
        } catch (err) {
            console.error("Profile update error:", err);
            setError(t.updateError);
        } finally {
            setSaving(false);
        }
    };

    return {
        bio,
        setBio,
        setProfileImage,
        loading,
        saving,
        error,
        handleSubmit,
        goBack: () => router.back(),
    };
}