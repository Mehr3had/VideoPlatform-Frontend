"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

interface Category {
    id: number;
    name: string;
}

interface UploadVideoFormProps {
    title: string;
    setTitle: (value: string) => void;
    description: string;
    setDescription: (value: string) => void;
    categoryId: string;
    setCategoryId: (value: string) => void;
    setVideoFile: (file: File | null) => void;
    setThumbnail: (file: File | null) => void;
    categories: Category[];
    loading: boolean;
    error: string;
    handleUpload: (event: FormEvent<HTMLFormElement>) => void;
}

export default function UploadVideoForm({
    title,
    setTitle,
    description,
    setDescription,
    categoryId,
    setCategoryId,
    setVideoFile,
    setThumbnail,
    categories,
    loading,
    error,
    handleUpload,
}: UploadVideoFormProps) {
    const { language, isPersian } = useLanguage();
    const t = translations[language].uploadVideo;

    const handleVideoChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        setVideoFile(event.target.files?.[0] ?? null);
    };

    const handleThumbnailChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        setThumbnail(event.target.files?.[0] ?? null);
    };

    return (
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-[#181818] sm:p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {t.title}
            </h1>

            <p className="mt-2 text-gray-500 dark:text-gray-400">
                {t.subtitle}
            </p>

            {error && (
                <div
                    role="alert"
                    className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                >
                    {error}
                </div>
            )}

            <form onSubmit={handleUpload} className="mt-8 space-y-6">
                <div>
                    <label
                        htmlFor="video-title"
                        className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        {t.videoTitle}
                    </label>

                    <input
                        id="video-title"
                        type="text"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        required
                        placeholder={t.titlePlaceholder}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-[var(--accent)] dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100 dark:placeholder:text-gray-500"
                    />
                </div>

                <div>
                    <label
                        htmlFor="video-description"
                        className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        {t.description}
                    </label>

                    <textarea
                        id="video-description"
                        dir="auto"
                        value={description}
                        onChange={(event) =>
                            setDescription(event.target.value)
                        }
                        rows={5}
                        placeholder={t.descriptionPlaceholder}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-[var(--accent)] dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100 dark:placeholder:text-gray-500"
                    />
                </div>

                <div>
                    <label
                        htmlFor="video-category"
                        className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        {t.category}
                    </label>

                    <select
                        id="video-category"
                        value={categoryId}
                        onChange={(event) =>
                            setCategoryId(event.target.value)
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[var(--accent)] dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100"
                    >
                        <option value="">{t.selectCategory}</option>

                        {categories.map((category) => (
                            <option
                                key={category.id}
                                value={String(category.id)}
                            >
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label
                        htmlFor="video-file"
                        className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        {t.videoFile}
                    </label>

                    <input
                        id="video-file"
                        type="file"
                        accept="video/*"
                        onChange={handleVideoChange}
                        required
                        className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:font-medium file:text-gray-700 hover:file:bg-gray-200 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-300 dark:file:bg-[#303030] dark:file:text-gray-200 dark:hover:file:bg-[#404040]"
                    />
                </div>

                <div>
                    <label
                        htmlFor="video-thumbnail"
                        className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        {t.thumbnail}
                    </label>

                    <input
                        id="video-thumbnail"
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:font-medium file:text-gray-700 hover:file:bg-gray-200 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-300 dark:file:bg-[#303030] dark:file:text-gray-200 dark:hover:file:bg-[#404040]"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="accent-button w-full rounded-lg px-5 py-3 font-medium disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? t.uploading : t.upload}
                </button>
            </form>
        </div>
    );
}