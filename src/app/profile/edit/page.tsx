"use client";

import Navbar from "@/components/Navbar";
import EditProfileForm from "@/components/profile/EditProfileForm";
import useEditProfile from "@/hooks/useEditProfile";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

export default function EditProfilePage() {
    const {
        bio,
        setBio,
        setProfileImage,
        loading,
        saving,
        error,
        handleSubmit,
        goBack,
    } = useEditProfile();

    const { language, isPersian } = useLanguage();
    const t = translations[language].editProfile;

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

    return (
        <main
            dir={isPersian ? "rtl" : "ltr"}
            className="min-h-screen bg-gray-100 dark:bg-[#0f0f0f]"
        >
            <Navbar />

            <section className="mx-auto max-w-2xl px-4 py-10 sm:px-8">
                <EditProfileForm
                    bio={bio}
                    setBio={setBio}
                    setProfileImage={setProfileImage}
                    saving={saving}
                    error={error}
                    onSubmit={handleSubmit}
                    onCancel={goBack}
                />
            </section>
        </main>
    );
}