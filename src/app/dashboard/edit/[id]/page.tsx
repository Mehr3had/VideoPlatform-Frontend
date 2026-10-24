"use client";

import Navbar from "@/components/Navbar";
import EditVideoForm from "@/components/videos/EditVideoForm";
import useEditVideo from "@/hooks/useEditVideo";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

export default function EditVideoPage() {
    const {
        title,
        setTitle,
        description,
        setDescription,
        categories,
        categoryId,
        setCategoryId,
        setVideoFile,
        setThumbnail,
        loading,
        saving,
        error,
        handleSubmit,
        goBack,
    } = useEditVideo();

    const { language, isPersian } = useLanguage();
    const t = translations[language].editVideo;

    if (loading) {
        return (
            <main
                dir={isPersian ? "rtl" : "ltr"}
                className="min-h-screen bg-gray-100 dark:bg-[#0f0f0f]"
            >
                <Navbar />
                <p className="py-20 text-center text-gray-500 dark:text-gray-400">
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

            <section className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
                <EditVideoForm
                    title={title}
                    setTitle={setTitle}
                    description={description}
                    setDescription={setDescription}
                    categories={categories}
                    categoryId={categoryId}
                    setCategoryId={setCategoryId}
                    setVideoFile={setVideoFile}
                    setThumbnail={setThumbnail}
                    saving={saving}
                    error={error}
                    handleSubmit={handleSubmit}
                    onCancel={goBack}
                />
            </section>
        </main>
    );
}