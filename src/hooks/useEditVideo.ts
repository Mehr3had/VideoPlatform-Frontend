"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { API, apiFetch } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

interface Category {
    id: number;
    name: string;
}

interface VideoData {
    title?: string | null;
    description?: string | null;
    category?: number | { id: number } | null;
    category_id?: number | null;
}

export default function useEditVideo() {
    const params = useParams();
    const router = useRouter();
    const videoId = String(params.id);

    const { language } = useLanguage();
    const t = translations[language].editVideo;

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryId, setCategoryId] = useState("");
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const getVideo = async () => {
            const token = localStorage.getItem("accessToken");

            if (!token) {
                router.push("/login");
                return;
            }

            try {
                const response = await apiFetch(`${API}/videos/${videoId}/`);

                if (response.status === 401) {
                    router.push("/login");
                    return;
                }

                if (!response.ok) {
                    throw new Error(t.loadFailed);
                }

                const data: VideoData = await response.json();

                const categoryValue =
                    typeof data.category === "object" &&
                    data.category !== null
                        ? data.category.id
                        : data.category ?? data.category_id ?? "";

                if (!cancelled) {
                    setTitle(data.title ?? "");
                    setDescription(data.description ?? "");
                    setCategoryId(String(categoryValue));
                }
            } catch (err) {
                console.error("Load video error:", err);

                if (!cancelled) {
                    setError(t.loadDetailsFailed);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        const getCategories = async () => {
            try {
                const response = await fetch(`${API}/categories`);

                if (!response.ok) {
                    throw new Error("Failed to load categories");
                }

                const data: Category[] = await response.json();

                if (!cancelled) {
                    setCategories(data);
                }
            } catch (err) {
                console.error("Categories error:", err);
            }
        };

        getVideo();
        getCategories();

        return () => {
            cancelled = true;
        };
    }, [videoId, router, t.loadFailed, t.loadDetailsFailed]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const token = localStorage.getItem("accessToken");

        if (!token) {
            router.push("/login");
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("category", categoryId);

        if (videoFile) {
            formData.append("video_file", videoFile);
        }

        if (thumbnail) {
            formData.append("thumbnail", thumbnail);
        }

        setSaving(true);
        setError("");

        try {
            const response = await apiFetch(
                `${API}/videos/${videoId}/edit/`,
                {
                    method: "PATCH",
                    body: formData,
                }
            );

            const data = await response.json().catch(() => ({}));

            if (response.status === 401) {
                router.push("/login");
                return;
            }

            if (!response.ok) {
                setError(data.error || t.updateFailed);
                return;
            }

            const params = new URLSearchParams({
                id: videoId,
                title,
            });

            router.push(`/dashboard/edit/success?${params.toString()}`);
        } catch (err) {
            console.error("Update video error:", err);
            setError(t.updateError);
        } finally {
            setSaving(false);
        }
    };

    return {
        title,
        setTitle,
        description,
        setDescription,
        categories,
        categoryId,
        setCategoryId,
        setVideoFile,
        setThumbnail,
        loading,
        saving,
        error,
        handleSubmit,
        goBack: () => router.back(),
    };
}