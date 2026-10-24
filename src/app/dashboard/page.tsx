"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useDashboard } from "@/hooks/useDashboard";
import StatCard from "@/components/StatCard";
import DashboardVideoCard from "@/components/DashboardVideoCard";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

export default function DashboardPage() {
    const {
        loading,
        error,
        videos,
        stats,
        deleteVideo,
    } = useDashboard();

    const { language, isPersian } = useLanguage();
    const t = translations[language].dashboard;

    const handleDelete = async (videoId: number) => {
        const confirmed = window.confirm(t.confirmDelete);

        if (!confirmed) return;

        const result = await deleteVideo(videoId);

        if (!result.success && result.message) {
            window.alert(result.message);
        }
    };

    if (loading) {
        return (
            <main
                dir={isPersian ? "rtl" : "ltr"}
                className="min-h-screen bg-gray-100 dark:bg-[#0f0f0f]"
            >
                <Navbar />

                <div className="flex justify-center py-20">
                    <p className="text-gray-500 dark:text-gray-400">
                        {t.loading}
                    </p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main
                dir={isPersian ? "rtl" : "ltr"}
                className="min-h-screen bg-gray-100 dark:bg-[#0f0f0f]"
            >
                <Navbar />

                <div className="mx-auto max-w-2xl px-4 py-20 text-center">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {t.loadFailedTitle}
                    </h1>

                    <p className="mt-3 text-gray-500 dark:text-gray-400">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="mt-6 rounded-lg bg-red-700 px-5 py-3 font-medium text-white hover:bg-red-800"
                    >
                        {t.tryAgain}
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main
            dir={isPersian ? "rtl" : "ltr"}
            className="min-h-screen bg-gray-100 dark:bg-[#0f0f0f]"
        >
            <Navbar />

            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            {t.title}
                        </h1>

                        <p className="mt-2 text-gray-500 dark:text-gray-400">
                            {t.subtitle}
                        </p>
                    </div>

                    <Link
                        href="/dashboard/upload"
                        className="inline-flex items-center justify-center rounded-lg bg-red-700 px-5 py-3 font-medium text-white hover:bg-red-800"
                    >
                        {t.uploadVideo}
                    </Link>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
                    <StatCard title={t.videos} value={stats.videos_count} />
                    <StatCard title={t.subscribers} value={stats.subscribers_count} />
                    <StatCard title={t.totalViews} value={stats.total_views} />
                    <StatCard title={t.totalLikes} value={stats.total_likes} />
                    <StatCard title={t.totalComments} value={stats.total_comments} />
                    <StatCard title={t.following} value={stats.following_count} />
                </div>

                {videos.length === 0 ? (
                    <div className="mt-10 rounded-xl bg-white px-6 py-12 text-center shadow-sm dark:bg-[#181818]">
                        <p className="text-gray-500 dark:text-gray-400">
                            {t.noVideos}
                        </p>
                    </div>
                ) : (
                    <div className="mt-10 overflow-hidden rounded-xl bg-white shadow-sm dark:bg-[#181818]">
                        <div className="border-b border-gray-200 px-6 py-4 dark:border-[#303030]">
                            <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                                {t.yourVideos}
                            </h2>
                        </div>

                        <div className="divide-y divide-gray-200 dark:divide-[#303030]">
                            {videos.map((video) => (
                                <DashboardVideoCard
                                    key={video.id}
                                    video={video}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}