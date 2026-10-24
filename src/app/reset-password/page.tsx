"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";
import Navbar from "@/components/Navbar";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

function ResetPasswordContent() {
    const searchParams = useSearchParams();

    return (
        <section className="flex justify-center px-4 py-10 sm:px-6 sm:py-16">
            <ResetPasswordForm
                uid={searchParams.get("uid") ?? ""}
                token={searchParams.get("token") ?? ""}
            />
        </section>
    );
}

export default function ResetPasswordPage() {
    const { language, isPersian } = useLanguage();
    const t = translations[language].resetPassword;

    return (
        <main className="min-h-screen bg-gray-100 dark:bg-[#0f0f0f]">
            <Navbar />

            <Suspense
                fallback={
                    <section className="flex justify-center px-4 py-10 sm:px-6 sm:py-16">
                        <div
                            dir={isPersian ? "rtl" : "ltr"}
                            className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm dark:bg-[#181818]"
                        >
                            <p className="text-gray-500 dark:text-gray-400">
                                {t.loading}
                            </p>
                        </div>
                    </section>
                }
            >
                <ResetPasswordContent />
            </Suspense>
        </main>
    );
}