"use client";

import Navbar from "@/components/Navbar";
import VideoCard from "@/components/videos/VideoCard";
import ProfileHeader from "@/components/profile/ProfileHeader";
import useUserProfile from "@/hooks/useUserProfile";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

export default function ProfilePage() {
    const { profile, videos, loading, handleSubscribe } = useUserProfile();
    const { language, isPersian } = useLanguage();
    const t = translations[language].profile;

    if (loading) {
        return (
            <main
                dir={isPersian ? "rtl" : "ltr"}
                className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-[#0f0f0f]"
            >
                <p className="text-gray-500 dark:text-gray-400">
                    {t.loading}
                </p>
            </main>
        );
    }

    if (!profile) {
        return (
            <main
                dir={isPersian ? "rtl" : "ltr"}
                className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-[#0f0f0f]"
            >
                <p className="text-gray-500 dark:text-gray-400">
                    {t.loadFailed}
                </p>
            </main>
        );
    }

    return (
        <main
            dir={isPersian ? "rtl" : "ltr"}
            className="min-h-screen bg-gray-100 dark:bg-[#0f0f0f]"
        >
            <Navbar />

            <section className="mx-auto max-w-5xl px-4 py-10 sm:px-8">
                <ProfileHeader
                    profile={profile}
                    onSubscribe={handleSubscribe}
                />

                <section className="mt-10">
                    <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {t.videos}
                    </h2>

                    {videos.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400">
                            {t.noVideos}
                        </p>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {videos.map((video) => (
                                <VideoCard key={video.id} video={video} />
                            ))}
                        </div>
                    )}
                </section>
            </section>
        </main>
    );
}