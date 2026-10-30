"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

interface Category {
    id: number;
    name: string;
}

interface EditVideoFormProps {
    title: string;
    setTitle: (value: string) => void;
    description: string;
    setDescription: (value: string) => void;
    categories: Category[];
    categoryId: string;
    setCategoryId: (value: string) => void;
    setVideoFile: (file: File | null) => void;
    setThumbnail: (file: File | null) => void;
    saving: boolean;
    error: string;
    handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
}

export default function EditVideoForm({
    title,
    setTitle,
    description,
    setDescription,
    categories,
    categoryId,
    setCategoryId,
    setVideoFile,
    setThumbnail,
    saving,
    error,
    handleSubmit,
    onCancel,
}: EditVideoFormProps) {
    const { language, isPersian } = useLanguage();
    const t = translations[language].editVideo;

    const handleVideoChange = (event: ChangeEvent<HTMLInputElement>) => {
        setVideoFile(event.target.files?.[0] ?? null);
    };

    const handleThumbnailChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        setThumbnail(event.target.files?.[0] ?? null);
    };

    return (
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-[#181818] sm:p-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {t.title}
            </h1>

            {error && (
                <p
                    role="alert"
                    className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                >
                    {error}
                </p>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div>
                    <label
                        htmlFor="edit-video-title"
                        className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        {t.videoTitle}
                    </label>

                    <input
                        id="edit-video-title"
                        required
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[var(--accent)] dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100"
                    />
                </div>

                <div>
                    <label
                        htmlFor="edit-video-category"
                        className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        {t.category}
                    </label>

                    <select
                        id="edit-video-category"
                        value={categoryId}
                        onChange={(event) => setCategoryId(event.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100"
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
                        htmlFor="edit-video-description"
                        className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        {t.description}
                    </label>

                    <textarea
                        id="edit-video-description"
                        dir="auto"
                        value={description}
                        onChange={(event) =>
                            setDescription(event.target.value)
                        }
                        rows={5}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[var(--accent)] dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100"
                    />
                </div>

                <div>
                    <label
                        htmlFor="edit-video-file"
                        className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        {t.replaceVideo}
                    </label>

                    <input
                        id="edit-video-file"
                        type="file"
                        accept="video/*"
                        onChange={handleVideoChange}
                        className="block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:font-medium file:text-gray-700 hover:file:bg-gray-200 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-300 dark:file:bg-[#303030] dark:file:text-gray-200 dark:hover:file:bg-[#404040]"
                    />
                </div>

                <div>
                    <label
                        htmlFor="edit-video-thumbnail"
                        className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        {t.replaceThumbnail}
                    </label>

                    <input
                        id="edit-video-thumbnail"
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:font-medium file:text-gray-700 hover:file:bg-gray-200 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-300 dark:file:bg-[#303030] dark:file:text-gray-200 dark:hover:file:bg-[#404040]"
                    />
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="accent-button rounded-lg px-5 py-3 font-medium disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving ? t.saving : t.saveChanges}
                    </button>

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={saving}
                        className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-[#404040] dark:text-gray-300 dark:hover:bg-[#252525]"
                    >
                        {t.cancel}
                    </button>
                </div>
            </form>
        </div>
    );
}