"use client";

import Link from "next/link";
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

interface ProfileHeaderProps {
    profile: Profile;
    onSubscribe: () => void;
}

export default function ProfileHeader({
    profile,
    onSubscribe,
}: ProfileHeaderProps) {
    const { language, isPersian } = useLanguage();
    const t = translations[language].profile;

    const numberFormatter = new Intl.NumberFormat(
        isPersian ? "fa-IR" : "en-US"
    );

    return (
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-[#181818] sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-5">
                    {profile.profile_image ? (
                        <img
                            src={profile.profile_image}
                            alt={profile.username}
                            className="h-20 w-20 shrink-0 rounded-full object-cover sm:h-24 sm:w-24"
                        />
                    ) : (
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gray-200 text-3xl font-bold text-gray-500 dark:bg-[#303030] dark:text-gray-300 sm:h-24 sm:w-24">
                            {profile.username.charAt(0).toUpperCase()}
                        </div>
                    )}

                    <div className="min-w-0">
                        <h1 className="break-words text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
                            <bdi dir="auto">{profile.username}</bdi>
                        </h1>

                        <p
                            dir="auto"
                            className="mt-2 whitespace-pre-wrap break-words text-gray-600 dark:text-gray-400"
                        >
                            {profile.bio || t.noBio}
                        </p>
                    </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-3">
                    {profile.is_owner ? (
                        <>
                            <Link
                                href="/dashboard"
                                className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 dark:bg-[#303030] dark:hover:bg-[#404040]"
                            >
                                {t.dashboard}
                            </Link>

                            <Link
                                href="/profile/edit"
                                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-300 dark:hover:bg-[#303030]"
                            >
                                {t.editProfile}
                            </Link>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={onSubscribe}
                            className={`rounded-lg px-5 py-2.5 text-sm font-medium transition ${
                                profile.is_subscribed
                                    ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-300 dark:hover:bg-[#303030]"
                                    : "bg-red-700 text-white hover:bg-red-800"
                            }`}
                        >
                            {profile.is_subscribed
                                ? t.unsubscribe
                                : t.subscribe}
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
                <span>
                    <strong className="text-gray-900 dark:text-gray-100">
                        {numberFormatter.format(profile.videos_count)}
                    </strong>{" "}
                    {t.videos}
                </span>

                <span>
                    <strong className="text-gray-900 dark:text-gray-100">
                        {numberFormatter.format(profile.subscribers_count)}
                    </strong>{" "}
                    {t.subscribers}
                </span>
            </div>
        </div>
    );
}