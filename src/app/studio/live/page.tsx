"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { axiosClient } from "@/lib/axios";
import { useAppearanceStore } from "@/stores/useAppearanceStore";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";

interface CreatedLiveStream {
    id: number;
    title: string;
    thumbnail?: string | null;
    description: string;
    status: string;
    rtmp_server: string;
    obs_stream_key: string;
    hls_url: string;
}

interface ApiError {
    error?: string;
    detail?: string;
}

export default function LiveStudioPage() {
    const router = useRouter();
    const { language, isPersian } = useLanguage();
    const accent = useAppearanceStore((state) => state.accent);
    const isFa = language === "fa";
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const thumbnailInputRef = useRef<HTMLInputElement>(null);
    const [createdStream, setCreatedStream] =
        useState<CreatedLiveStream | null>(null);
    const [loading, setLoading] = useState(false);
    const [showStreamKey, setShowStreamKey] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!thumbnail) {
            setThumbnailPreview(null);
            return;
        }

        const previewUrl = URL.createObjectURL(thumbnail);

        setThumbnailPreview(previewUrl);

        return () => {
            URL.revokeObjectURL(previewUrl);
        };
    }, [thumbnail]);

    const handleThumbnailChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            setError(
                isFa
                    ? "فقط تصاویر JPG، PNG و WebP مجاز هستند."
                    : "Only JPG, PNG, and WebP images are allowed."
            );

            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError(
                isFa
                    ? "حجم تصویر نباید بیشتر از ۵ مگابایت باشد."
                    : "Thumbnail must be smaller than 5 MB."
            );

            event.target.value = "";
            return;
        }

        setError("");
        setThumbnail(file);
    };

    const removeThumbnail = () => {
        setThumbnail(null);
        if (thumbnailInputRef.current) {
            thumbnailInputRef.current.value = "";
        }
    };

    const t = {
        title: isFa ? "استودیو پخش زنده" : "Live Studio",
        subtitle: isFa
            ? "پخش زنده خودت رو بساز و از طریق OBS منتشر کن."
            : "Create your live stream and broadcast through OBS.",
        createTitle: isFa ? "ساخت پخش زنده" : "Create a live stream",
        createDescription: isFa
            ? "عنوان و توضیحات پخش زنده خودت رو وارد کن."
            : "Enter your live stream title and description.",
        titleLabel: isFa ? "عنوان لایو" : "Stream title",
        titlePlaceholder: isFa
            ? "مثلاً بازی و گفت‌وگوی زنده"
            : "For example: Live gaming and chat",
        descriptionLabel: isFa ? "توضیحات" : "Description",
        descriptionPlaceholder: isFa
            ? "درباره پخش زنده توضیح بده..."
            : "Describe your live stream...",
        createButton: isFa ? "ساخت لایو" : "Create stream",
        creating: isFa ? "در حال ساخت..." : "Creating...",
        setupTitle: isFa
            ? "اطلاعات اتصال OBS"
            : "OBS connection details",
        setupDescription: isFa
            ? "از اطلاعات زیر برای اتصال OBS به پخش زنده استفاده کن."
            : "Use the following details to connect OBS to your stream.",
        serverLabel: isFa ? "آدرس سرور RTMP" : "RTMP Server",
        keyLabel: isFa ? "کلید استریم" : "Stream Key",
        copy: isFa ? "کپی" : "Copy",
        copied: isFa ? "کپی شد!" : "Copied!",
        show: isFa ? "نمایش" : "Show",
        hide: isFa ? "مخفی کردن" : "Hide",
        watch: isFa ? "آدرس صفحه تماشا" : "Watch page address",
        obsTitle: isFa ? "تنظیم OBS Studio" : "OBS Studio setup",
        obsSteps: isFa
            ? [
                "OBS Studio را باز کن.",
                "به Settings و سپس Stream برو.",
                "سرویس را روی Custom قرار بده.",
                "آدرس RTMP و Stream Key را وارد کن.",
                "روی Start Streaming بزن.",
            ]
            : [
                "Open OBS Studio.",
                "Go to Settings, then Stream.",
                "Set the service to Custom.",
                "Enter the RTMP server and stream key.",
                "Click Start Streaming.",
            ],
        ready: isFa
            ? "اطلاعات استریم آماده است"
            : "Stream details are ready",
        readyDescription: isFa
            ? "حالا OBS را با اطلاعات بالا متصل کن."
            : "Connect OBS using the details above.",
        security: isFa
            ? "کلید استریم محرمانه است. آن را فقط در OBS وارد کن و برای دیگران نفرست."
            : "Your stream key is private. Enter it only in OBS and never share it.",
        keyWarning: isFa
            ? "این کلید فقط یک بار نمایش داده می‌شود و پس از تازه‌سازی صفحه قابل بازیابی نیست. قبل از بستن صفحه آن را در OBS ذخیره کن."
            : "This key is shown only once and cannot be recovered after refreshing this page. Save it in OBS before leaving.",
        backDashboard: isFa ? "بازگشت به داشبورد" : "Back to dashboard",
        validation: isFa
            ? "لطفاً عنوان لایو را وارد کن."
            : "Please enter a stream title.",
        genericError: isFa
            ? "ساخت لایو با خطا مواجه شد. دوباره تلاش کن."
            : "Could not create the stream. Please try again.",
        watchComingSoon: isFa
            ? "صفحه تماشای لایو در مرحله بعد ساخته می‌شود."
            : "The live watch page will be added in the next step.",
    };

    const copyText = async (value: string, field: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(field);

            window.setTimeout(() => {
                setCopied((current) =>
                    current === field ? null : current
                );
            }, 2000);
        } catch {
            setError(
                isFa
                    ? "کپی کردن انجام نشد. متن را دستی انتخاب کن."
                    : "Copy failed. Please select and copy the text manually."
            );
        }
    };

    const handleCreateStream = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!title.trim()) {
            setError(t.validation);
            return;
        }

        if (loading || createdStream) return;

        setLoading(true);
        setError("");

        try {
            const formData = new FormData();

            formData.append("title", title.trim());
            formData.append("description", description.trim());
            if (thumbnail) {
                formData.append("thumbnail", thumbnail);
            }
            const response = await axiosClient.post<CreatedLiveStream>(
                "/live/",
                formData
            );

            setCreatedStream(response.data);
            setShowStreamKey(false);
        } catch (err) {
            const axiosError = err as AxiosError<ApiError>;

            if (axiosError.response?.status === 401) {
                setError(
                    isFa
                        ? "برای ساخت لایو ابتدا وارد حساب کاربری شو."
                        : "Please log in before creating a stream."
                );
            } else {
                setError(
                    axiosError.response?.data?.error ||
                    axiosError.response?.data?.detail ||
                    t.genericError
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const accentButtonStyle = {
        backgroundColor: accent,
    };

    return (
        <main
            dir={isPersian ? "rtl" : "ltr"}
            className="min-h-screen bg-gray-100 text-gray-900 dark:bg-[#0f0f0f] dark:text-gray-100"
        >
            <Navbar />

            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <header className="mb-8">
                    <div
                        className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
                        style={{
                            borderColor: `${accent}55`,
                            color: accent,
                            backgroundColor: `${accent}12`,
                        }}
                    >
                        <span className="h-2 w-2 rounded-full bg-current" />
                        Live Streaming
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-3xl font-bold sm:text-4xl">
                                {t.title}
                            </h1>

                            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 sm:text-base">
                                {t.subtitle}
                            </p>
                        </div>

                        <Link
                            href="/dashboard"
                            aria-label={isPersian ? "بازگشت به داشبورد" : "Back to dashboard"}
                            title={isPersian ? "داشبورد" : "Dashboard"}
                            className="accent-button inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold shadow-sm transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0f0f0f]"
                        >
                            <span aria-hidden="true">
                                {isPersian ? "←" : "→"}
                            </span>
                        </Link>
                    </div>
                </header>

                {!createdStream ? (
                    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[#303030] dark:bg-[#181818] sm:p-8">
                        <div className="mb-7">
                            <h2 className="text-xl font-bold">
                                {t.createTitle}
                            </h2>

                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                {t.createDescription}
                            </p>
                        </div>

                        <form
                            onSubmit={handleCreateStream}
                            className="space-y-6"
                        >
                            <div>
                                <label
                                    htmlFor="live-title"
                                    className="mb-2 block text-sm font-medium"
                                >
                                    {t.titleLabel}
                                </label>

                                <input
                                    id="live-title"
                                    type="text"
                                    maxLength={200}
                                    required
                                    value={title}
                                    onChange={(event) =>
                                        setTitle(event.target.value)
                                    }
                                    placeholder={t.titlePlaceholder}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 dark:border-[#383838] dark:bg-[#202020]"
                                />

                                <div className="mt-1 text-end text-xs text-gray-400">
                                    {title.length}/200
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label
                                    htmlFor="live-thumbnail"
                                    className="block text-sm font-medium"
                                >
                                    {isFa
                                        ? "تصویر بندانگشتی لایو (اختیاری)"
                                        : "Live thumbnail (optional)"}
                                </label>

                                <input
                                    ref={thumbnailInputRef}
                                    id="live-thumbnail"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleThumbnailChange}
                                    disabled={loading}
                                    className="sr-only"
                                />

                                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-[#383838] dark:bg-[#202020]">
                                    {thumbnailPreview ? (
                                        <img
                                            src={thumbnailPreview}
                                            alt={isFa ? "پیش‌نمایش تامبنیل لایو" : "Live thumbnail preview"}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <label
                                            htmlFor="live-thumbnail"
                                            className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-3 text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#282828]"
                                        >
                                            {/* Mobile accent icon */}
                                            <span
                                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border sm:hidden"
                                                style={{
                                                    color: "var(--accent)",
                                                    borderColor: "var(--accent)",
                                                    backgroundColor: "color-mix(in srgb, var(--accent) 12%, transparent)",
                                                }}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.7"
                                                    className="h-6 w-6"
                                                >
                                                    <rect x="3" y="3" width="18" height="18" rx="3" />
                                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                                    <path d="m21 15-5-5L5 21" />
                                                </svg>
                                            </span>

                                            {/* Original desktop icon */}
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.7"
                                                className="hidden h-10 w-10 sm:block"
                                            >
                                                <rect x="3" y="3" width="18" height="18" rx="3" />
                                                <circle cx="8.5" cy="8.5" r="1.5" />
                                                <path d="m21 15-5-5L5 21" />
                                            </svg>

                                            <span className="text-sm font-semibold">
                                                {isFa ? "انتخاب تصویر لایو" : "Choose live thumbnail"}
                                            </span>

                                            <span className="text-xs">
                                                JPG, PNG, WebP · Max 5 MB
                                            </span>
                                        </label>
                                    )}
                                </div>

                                {thumbnail && (
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <span
                                            className="min-w-0 flex-1 truncate text-xs text-gray-500 dark:text-gray-400"
                                            title={thumbnail.name}
                                        >
                                            {thumbnail.name}
                                        </span>

                                        <div className="flex items-center gap-3">
                                            <label
                                                htmlFor="live-thumbnail"
                                                className="cursor-pointer text-sm font-semibold"
                                                style={{ color: accent }}
                                            >
                                                {isFa ? "تغییر تصویر" : "Change image"}
                                            </label>

                                            <button
                                                type="button"
                                                onClick={removeThumbnail}
                                                disabled={loading}
                                                className="cursor-pointer text-sm font-medium text-red-500 transition hover:text-red-600 disabled:opacity-50"
                                            >
                                                {isFa ? "حذف تصویر" : "Remove"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="live-description"
                                    className="mb-2 block text-sm font-medium"
                                >
                                    {t.descriptionLabel}
                                </label>

                                <textarea
                                    id="live-description"
                                    rows={5}
                                    value={description}
                                    onChange={(event) =>
                                        setDescription(event.target.value)
                                    }
                                    placeholder={t.descriptionPlaceholder}
                                    className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 dark:border-[#383838] dark:bg-[#202020]"
                                />
                            </div>

                            {error && (
                                <div
                                    role="alert"
                                    className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
                                >
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                style={accentButtonStyle}
                                className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-48"
                            >
                                {loading ? t.creating : t.createButton}
                            </button>
                        </form>
                    </section>
                ) : (
                    <div className="space-y-6">
                        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[#303030] dark:bg-[#181818] sm:p-8">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <div
                                        className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium"
                                        style={{
                                            color: accent,
                                            backgroundColor: `${accent}15`,
                                        }}
                                    >
                                        <span className="h-2 w-2 rounded-full bg-current" />
                                        {t.ready}
                                    </div>

                                    <h2 className="text-2xl font-bold">
                                        {createdStream.title}
                                    </h2>

                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        {t.readyDescription}
                                    </p>
                                </div>

                                <span className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-600 dark:bg-[#252525] dark:text-gray-300">
                                    ID: {createdStream.id}
                                </span>
                            </div>

                            <div className="mt-8 space-y-6">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold">
                                        {t.serverLabel}
                                    </label>

                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <code
                                            dir="ltr"
                                            className="min-w-0 flex-1 break-all rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm dark:border-[#383838] dark:bg-[#202020]"
                                        >
                                            {createdStream.rtmp_server}
                                        </code>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                copyText(
                                                    createdStream.rtmp_server,
                                                    "server"
                                                )
                                            }
                                            className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium transition hover:bg-gray-100 dark:border-[#383838] dark:hover:bg-[#282828]"
                                        >
                                            {copied === "server"
                                                ? t.copied
                                                : t.copy}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-2 flex items-center justify-between gap-3">
                                        <label className="text-sm font-semibold">
                                            {t.keyLabel}
                                        </label>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowStreamKey((value) => !value)
                                            }
                                            className="text-sm font-medium"
                                            style={{ color: accent }}
                                        >
                                            {showStreamKey ? t.hide : t.show}
                                        </button>
                                    </div>

                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <div
                                            dir="ltr"
                                            className="min-w-0 flex-1 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-[#383838] dark:bg-[#202020]"
                                        >
                                            <code className="block break-all text-sm">
                                                {showStreamKey
                                                    ? createdStream.obs_stream_key
                                                    : "••••••••••••••••••••••••••••"}
                                            </code>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                copyText(
                                                    createdStream.obs_stream_key,
                                                    "key"
                                                )
                                            }
                                            className="rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
                                            style={accentButtonStyle}
                                        >
                                            {copied === "key"
                                                ? t.copied
                                                : t.copy}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold">
                                        {t.watch}
                                    </label>

                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <code
                                            dir="ltr"
                                            className="min-w-0 flex-1 break-all rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm dark:border-[#383838] dark:bg-[#202020]"
                                        >
                                            {typeof window !== "undefined"
                                                ? `${window.location.origin}/live/${createdStream.id}`
                                                : `/live/${createdStream.id}`}
                                        </code>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                copyText(
                                                    `${window.location.origin}/live/${createdStream.id}`,
                                                    "watch"
                                                )
                                            }
                                            className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium transition hover:bg-gray-100 dark:border-[#383838] dark:hover:bg-[#282828]"
                                        >
                                            {copied === "watch"
                                                ? t.copied
                                                : t.copy}
                                        </button>
                                    </div>

                                    <Link
                                        href={`/live/${createdStream.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="accent-button mt-3 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition hover:brightness-110"
                                    >
                                        <span aria-hidden="true">▶</span>
                                        {isFa ? "باز کردن صفحه تماشا" : "Open watch page"}
                                    </Link>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[#303030] dark:bg-[#181818] sm:p-8">
                            <h2 className="text-xl font-bold">
                                {t.obsTitle}
                            </h2>

                            <div
                                role="note"
                                className="mt-4 flex items-start gap-3 rounded-xl border p-4 text-sm leading-7 text-gray-700 dark:text-gray-200"
                                style={{
                                    borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)",
                                    backgroundColor: "color-mix(in srgb, var(--accent) 8%, transparent)",
                                }}
                            >
                                <span
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border"
                                    style={{
                                        color: "var(--accent)",
                                        borderColor: "var(--accent)",
                                        backgroundColor: "color-mix(in srgb, var(--accent) 12%, transparent)",
                                    }}
                                >
                                    <svg
                                        aria-hidden="true"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-5 w-5"
                                    >
                                        <rect x="3" y="4" width="18" height="13" rx="2" />
                                        <path d="M2 21h20M8 17l-1 4m9-4 1 4" />
                                    </svg>
                                </span>

                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold">
                                        {isFa
                                            ? "برای ساخت و اجرای پخش زنده، از لپ‌تاپ و نرم‌افزار OBS استفاده کنید."
                                            : "Use a laptop and OBS to create and run your live stream."}
                                    </p>
                                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                                        {isFa
                                            ? "پخش مستقیم از گوشی در نسخه فعلی پشتیبانی نمی‌شود."
                                            : "Direct live streaming from a phone is not supported in the current version."}
                                    </p>
                                </div>
                            </div>

                            <ol className="mt-5 space-y-4">
                                {t.obsSteps.map((step, index) => (
                                    <li
                                        key={index}
                                        className="flex items-start gap-3"
                                    >
                                        <span
                                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                                            style={accentButtonStyle}
                                        >
                                            {index + 1}
                                        </span>

                                        <span className="pt-1 text-sm text-gray-600 dark:text-gray-300">
                                            {step}
                                        </span>
                                    </li>
                                ))}
                            </ol>

                            <div className="mt-7 rounded-xl border border-amber-300/50 bg-amber-50 p-4 text-sm leading-7 text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/20 dark:text-amber-200">
                                <strong>
                                    {isFa ? "نکته امنیتی:" : "Security note:"}
                                </strong>
                                <p className="mt-1">{t.security}</p>
                                <p className="mt-2">{t.keyWarning}</p>
                            </div>
                        </section>
                    </div>
                )}

                <footer className="mt-8 text-center">
                    <p className="text-xs text-gray-400">
                        VideoPlatform Live · RTMP / HLS
                    </p>
                </footer>
            </div>
        </main>
    );
}