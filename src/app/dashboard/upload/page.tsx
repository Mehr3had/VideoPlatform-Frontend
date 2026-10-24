"use client";

import Navbar from "@/components/Navbar";
import UploadVideoForm from "@/components/videos/UploadVideoForm";
import useVideoUpload from "@/hooks/useVideoUpload";
import { useLanguage } from "@/context/LanguageContext";

export default function UploadPage() {
    const {
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
    } = useVideoUpload();

    const { isPersian } = useLanguage();

    return (
        <main
            dir={isPersian ? "rtl" : "ltr"}
            className="min-h-screen bg-gray-100 dark:bg-[#0f0f0f]"
        >
            <Navbar />

            <section className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
                <UploadVideoForm
                    title={title}
                    setTitle={setTitle}
                    description={description}
                    setDescription={setDescription}
                    categoryId={categoryId}
                    setCategoryId={setCategoryId}
                    setVideoFile={setVideoFile}
                    setThumbnail={setThumbnail}
                    categories={categories}
                    loading={loading}
                    error={error}
                    handleUpload={handleUpload}
                />
            </section>
        </main>
    );
}