"use client";

import Navbar from "@/components/Navbar";
import RecoveryForm from "@/components/auth/RecoveryForm";

export default function ForgotPasswordPage() {
    return (
        <main className="min-h-screen bg-gray-100 dark:bg-[#0f0f0f]">
            <Navbar />

            <section className="flex justify-center px-4 py-10 sm:px-6 sm:py-16">
                <RecoveryForm
                    type="password"
                    title=""
                    description=""
                    endpoint="/password-reset/"
                    buttonText=""
                    loadingText=""
                    successMessage=""
                    footerText=""
                />
            </section>
        </main>
    );
}