"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { API, apiFetch } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

interface Category {
    id: number;
    name: string;
}

export default function useVideoUpload() {
    const router = useRouter();
    const { language } = useLanguage();
    const t = translations[language].uploadVideo;

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const getCategories = async () => {
            try {
                const response = await fetch(`${API}/categories/`);

                if (!response.ok) {
                    throw new Error(t.categoriesFailed);
                }

                const data: Category[] = await response.json();

                if (!cancelled) {
                    setCategories(data);
                }
            } catch (err) {
                console.error("Categories error:", err);

                if (!cancelled) {
                    setError(t.categoriesFailed);
                }
            }
        };

        getCategories();

        return () => {
            cancelled = true;
        };
    }, [t.categoriesFailed]);

    const handleUpload = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setError("");

        const token = localStorage.getItem("accessToken");

        if (!token) {
            setError(t.loginRequired);
            return;
        }

        if (!videoFile) {
            setError(t.selectVideo);
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("video_file", videoFile);

        if (thumbnail) {
            formData.append("thumbnail", thumbnail);
        }

        if (categoryId) {
            formData.append("category_id", categoryId);
        }

        try {
            const response = await apiFetch(`${API}/videos/upload/`, {
                method: "POST",
                body: formData,
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                window.alert(t.uploadSuccess);
                router.push("/dashboard");
            } else {
                setError(data.error || t.uploadFailed);
            }
        } catch (err) {
            console.error("Upload error:", err);
            setError(t.generalError);
        } finally {
            setLoading(false);
        }
    };

    return {
        title,
        setTitle,
        description,
        setDescription,
        categoryId,
        setCategoryId,
        videoFile,
        setVideoFile,
        setThumbnail,
        categories,
        loading,
        error,
        handleUpload,
    };
}