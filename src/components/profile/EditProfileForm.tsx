"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

interface EditProfileFormProps {
    bio: string;
    setBio: (value: string) => void;
    setProfileImage: (file: File | null) => void;
    saving: boolean;
    error: string;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
}

export default function EditProfileForm({
    bio,
    setBio,
    setProfileImage,
    saving,
    error,
    onSubmit,
    onCancel,
}: EditProfileFormProps) {
    const { language, isPersian } = useLanguage();
    const t = translations[language].editProfile;

    const profileImageInputRef = useRef<HTMLInputElement>(null);
    const [profileImageName, setProfileImageName] = useState("");

    const handleProfileImageChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.currentTarget.files?.[0] ?? null;

        if (file) {
            setProfileImage(file);
            setProfileImageName(file.name);
        }

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

            <form onSubmit={onSubmit} className="mt-8 space-y-6">
                <div>
                    <label
                        htmlFor="profile-bio"
                        className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        {t.bio}
                    </label>

                    <textarea
                        id="profile-bio"
                        dir="auto"
                        value={bio}
                        onChange={(event) => setBio(event.target.value)}
                        rows={5}
                        maxLength={500}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-[var(--accent)] dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-[var(--accent)]"
                        placeholder={t.bioPlaceholder}
                    />

                    <p
                        dir="ltr"
                        className={`mt-1 text-xs text-gray-500 dark:text-gray-400 ${
                            isPersian ? "text-left" : "text-right"
                        }`}
                    >
                        {new Intl.NumberFormat(
                            isPersian ? "fa-IR" : "en-US"
                        ).format(bio.length)}
                        /500
                    </p>
                </div>

                <div>
                    <label
                        htmlFor="profile-image"
                        className="mb-2 hidden text-sm font-medium text-gray-700 dark:text-gray-300 sm:block"
                    >
                        {t.profileImage}
                    </label>

                    <div className="mb-3 sm:hidden">
                        <button
                            type="button"
                            dir={isPersian ? "rtl" : "ltr"}
                            onClick={() => profileImageInputRef.current?.click()}
                            className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-200 dark:hover:bg-[#303030]"
                            aria-label={t.chooseImage}
                        >
                            <span className="flex items-center gap-2">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border" style={{ color: "var(--accent)", borderColor: "var(--accent)", backgroundColor: "color-mix(in srgb, var(--accent) 12%, transparent)" }}><svg
                                    aria-hidden="true"
                                    viewBox="0 0 24 24"
                                    className="h-5 w-5 shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect x="3" y="4" width="18" height="16" rx="2" />
                                    <circle cx="8.5" cy="9" r="1.5" />
                                    <path d="m21 15-5-5L5 21" />
                                </svg></span>
                                <span>{t.chooseImage}</span>
                            </span>
                            <svg
                                aria-hidden="true"
                                viewBox="0 0 24 24"
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d={isPersian ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
                            </svg>
                        </button>

                        {profileImageName && (
                            <p dir="auto" className="mt-2 break-all text-xs text-gray-500 dark:text-gray-400">
                                {profileImageName}
                            </p>
                        )}
                    </div>

                    <input
                        ref={profileImageInputRef}
                        id="profile-image"
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageChange}
                        className="hidden w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:font-medium file:text-gray-700 hover:file:bg-gray-200 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-300 dark:file:bg-[#303030] dark:file:text-gray-200 dark:hover:file:bg-[#404040] sm:block"
                    />
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="accent-button rounded-lg px-5 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving ? t.saving : t.saveChanges}
                    </button>

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={saving}
                        className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-300 dark:hover:bg-[#303030]"
                    >
                        {t.cancel}
                    </button>
                </div>
            </form>
        </div>
    );
}