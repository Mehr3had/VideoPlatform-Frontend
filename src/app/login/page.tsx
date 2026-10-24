"use client";

import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-8 dark:bg-[#0f0f0f]">
            <LoginForm />
        </main>
    );
}