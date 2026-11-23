"use client";

import { useRef, useState } from "react";
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

    const [activePicker, setActivePicker] = useState<"video" | "thumbnail" | null>(null);
    const [videoFileName, setVideoFileName] = useState("");
    const [thumbnailFileName, setThumbnailFileName] = useState("");

    const videoGalleryInputRef = useRef<HTMLInputElement | null>(null);
    const videoCameraInputRef = useRef<HTMLInputElement | null>(null);
    const videoFilesInputRef = useRef<HTMLInputElement | null>(null);
    const thumbnailGalleryInputRef = useRef<HTMLInputElement | null>(null);
    const thumbnailCameraInputRef = useRef<HTMLInputElement | null>(null);

    const openFilePicker = (input: HTMLInputElement | null) => {
        setActivePicker(null);
        input?.click();
    };

        const handleVideoChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.currentTarget.files?.[0] ?? null;
        setVideoFile(file);
        setVideoFileName(file?.name ?? "");
        event.currentTarget.value = "";
    };

        const handleThumbnailChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.currentTarget.files?.[0] ?? null;
        setThumbnail(file);
        setThumbnailFileName(file?.name ?? "");
        event.currentTarget.value = "";
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
                {/* Hidden native inputs for mobile file selection */}
                <input
                    ref={videoGalleryInputRef}
                    type="file"
                    accept="video/*"
                    tabIndex={-1}
                    aria-hidden="true"
                    className="hidden"
                    onChange={handleVideoChange}
                />
                <input
                    ref={videoCameraInputRef}
                    type="file"
                    accept="video/*"
                    capture="environment"
                    tabIndex={-1}
                    aria-hidden="true"
                    className="hidden"
                    onChange={handleVideoChange}
                />
                <input
                    ref={videoFilesInputRef}
                    type="file"
                    accept="video/*"
                    tabIndex={-1}
                    aria-hidden="true"
                    className="hidden"
                    onChange={handleVideoChange}
                />
                <input
                    ref={thumbnailGalleryInputRef}
                    type="file"
                    accept="image/*"
                    tabIndex={-1}
                    aria-hidden="true"
                    className="hidden"
                    onChange={handleThumbnailChange}
                />
                <input
                    ref={thumbnailCameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    tabIndex={-1}
                    aria-hidden="true"
                    className="hidden"
                    onChange={handleThumbnailChange}
                />
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

                <div className="sm:hidden">
                    <button
                        type="button"
                        dir={isPersian ? "rtl" : "ltr"}
                        onClick={() => setActivePicker("video")}
                        aria-label={t.replaceVideo}
                        className="flex w-full items-center gap-3 rounded-xl border border-gray-300 bg-white p-3 text-start transition hover:border-[var(--accent)] dark:border-[#404040] dark:bg-[#202020]"
                    >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <rect x="3" y="5" width="18" height="14" rx="3" />
                                <path d="m10 9 5 3-5 3z" />
                            </svg>
                        </span>

                        <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {t.replaceVideo}
                            </span>
                            <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                                {videoFileName || (isPersian ? "برای انتخاب منبع ضربه بزنید" : "Tap to choose a source")}
                            </span>
                        </span>

                        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d={isPersian ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
                        </svg>
                    </button>
                </div>

                <div className="hidden sm:block">
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

                <div className="sm:hidden">
                    <button
                        type="button"
                        dir={isPersian ? "rtl" : "ltr"}
                        onClick={() => setActivePicker("thumbnail")}
                        aria-label={t.replaceThumbnail}
                        className="flex w-full items-center gap-3 rounded-xl border border-gray-300 bg-white p-3 text-start transition hover:border-[var(--accent)] dark:border-[#404040] dark:bg-[#202020]"
                    >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <rect x="3" y="3" width="18" height="18" rx="3" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <path d="m21 15-5-5L5 21" />
                            </svg>
                        </span>

                        <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {t.replaceThumbnail}
                            </span>
                            <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                                {thumbnailFileName || (isPersian ? "برای انتخاب منبع ضربه بزنید" : "Tap to choose a source")}
                            </span>
                        </span>

                        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d={isPersian ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
                        </svg>
                    </button>
                </div>

                <div className="hidden sm:block">
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
            {/* Mobile file source picker */}
            {activePicker !== null && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-6 sm:hidden"
                    onClick={() => setActivePicker(null)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="edit-upload-source-title"
                        dir={isPersian ? "rtl" : "ltr"}
                        className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-[#404040] dark:bg-[#181818]"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <h2
                                id="edit-upload-source-title"
                                className="text-base font-bold text-gray-900 dark:text-gray-100"
                            >
                                {activePicker === "video"
                                    ? isPersian ? "انتخاب منبع ویدئو" : "Choose video source"
                                    : isPersian ? "انتخاب منبع تامبنیل" : "Choose thumbnail source"}
                            </h2>

                            <button
                                type="button"
                                onClick={() => setActivePicker(null)}
                                aria-label={isPersian ? "بستن" : "Close"}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#303030]"
                            >
                                ×
                            </button>
                        </div>

                        {activePicker === "video" ? (
                            <div className="flex flex-col gap-2">
                                <button
                                    type="button"
                                    onClick={() => openFilePicker(videoGalleryInputRef.current)}
                                    className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 text-start transition active:scale-[0.99] dark:border-[#404040] dark:bg-[#202020]"
                                >
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                                        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            <rect x="3" y="3" width="18" height="18" rx="3" />
                                            <path d="M10 9v6l5-3z" />
                                        </svg>
                                    </span>
                                    <span className="flex-1">
                                        <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            {isPersian ? "گالری ویدئوها" : "Video gallery"}
                                        </span>
                                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                                            {isPersian ? "انتخاب ویدئوی موجود در گوشی" : "Choose a video from your gallery"}
                                        </span>
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => openFilePicker(videoCameraInputRef.current)}
                                    className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 text-start transition active:scale-[0.99] dark:border-[#404040] dark:bg-[#202020]"
                                >
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                                        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            <path d="M14 4h-4L8 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-4z" />
                                            <circle cx="12" cy="13" r="4" />
                                        </svg>
                                    </span>
                                    <span className="flex-1">
                                        <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            {isPersian ? "ضبط با دوربین" : "Record with camera"}
                                        </span>
                                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                                            {isPersian ? "ضبط یک ویدئوی جدید" : "Record a new video"}
                                        </span>
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => openFilePicker(videoFilesInputRef.current)}
                                    className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 text-start transition active:scale-[0.99] dark:border-[#404040] dark:bg-[#202020]"
                                >
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                                        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            <path d="M4 4h6l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
                                            <path d="M12 10v6m-3-3 3-3 3 3" />
                                        </svg>
                                    </span>
                                    <span className="flex-1">
                                        <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            {isPersian ? "فایل‌ها و خروجی InShot" : "Files and InShot exports"}
                                        </span>
                                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                                            {isPersian ? "انتخاب از فایل‌ها و برنامه‌های در دسترس گوشی" : "Browse files and available app sources"}
                                        </span>
                                    </span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <button
                                    type="button"
                                    onClick={() => openFilePicker(thumbnailGalleryInputRef.current)}
                                    className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 text-start transition active:scale-[0.99] dark:border-[#404040] dark:bg-[#202020]"
                                >
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                                        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            <rect x="3" y="3" width="18" height="18" rx="3" />
                                            <circle cx="8.5" cy="8.5" r="1.5" />
                                            <path d="m21 15-5-5L5 21" />
                                        </svg>
                                    </span>
                                    <span className="flex-1">
                                        <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            {isPersian ? "گالری تصاویر" : "Photo gallery"}
                                        </span>
                                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                                            {isPersian ? "انتخاب عکس موجود" : "Choose an existing photo"}
                                        </span>
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => openFilePicker(thumbnailCameraInputRef.current)}
                                    className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 text-start transition active:scale-[0.99] dark:border-[#404040] dark:bg-[#202020]"
                                >
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                                        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            <path d="M14 4h-4L8 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-4z" />
                                            <circle cx="12" cy="13" r="4" />
                                        </svg>
                                    </span>
                                    <span className="flex-1">
                                        <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            {isPersian ? "گرفتن عکس با دوربین" : "Take a photo"}
                                        </span>
                                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                                            {isPersian ? "ثبت عکس جدید برای تامبنیل" : "Capture a new thumbnail photo"}
                                        </span>
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}