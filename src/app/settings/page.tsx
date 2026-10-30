"use client";

import Navbar from "@/components/Navbar";
import UsernameForm from "@/components/settings/UsernameForm";
import PasswordForm from "@/components/settings/PasswordForm";
import DeleteAccountForm from "@/components/settings/DeleteAccountForm";
import useAccountSettings from "@/hooks/useAccountSettings";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";
import AppearanceSettings from "@/components/settings/AppearanceSettings";

export default function SettingsPage() {
    const {
        newUsername,
        setNewUsername,
        currentPassword,
        setCurrentPassword,
        newPassword,
        setNewPassword,
        passwordConfirm,
        setPasswordConfirm,
        deletePassword,
        setDeletePassword,
        usernameLoading,
        passwordLoading,
        deleteLoading,
        usernameMessage,
        passwordMessage,
        deleteMessage,
        usernameError,
        passwordError,
        deleteError,
        handleUsernameSubmit,
        handlePasswordSubmit,
        handleDeleteAccount,
    } = useAccountSettings();

    const { language, isPersian } = useLanguage();
    const t = translations[language].settings;

    return (
        <main
            dir={isPersian ? "rtl" : "ltr"}
            className="min-h-screen bg-gray-100 dark:bg-[#0f0f0f]"
        >
            <Navbar />

            <section className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {t.title}
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        {t.subtitle}
                    </p>
                </div>

                <AppearanceSettings />

                <UsernameForm
                    username={newUsername}
                    setUsername={setNewUsername}
                    loading={usernameLoading}
                    message={usernameMessage}
                    isError={usernameError}
                    onSubmit={handleUsernameSubmit}
                />

                <PasswordForm
                    currentPassword={currentPassword}
                    setCurrentPassword={setCurrentPassword}
                    newPassword={newPassword}
                    setNewPassword={setNewPassword}
                    passwordConfirm={passwordConfirm}
                    setPasswordConfirm={setPasswordConfirm}
                    loading={passwordLoading}
                    message={passwordMessage}
                    isError={passwordError}
                    onSubmit={handlePasswordSubmit}
                />

                <DeleteAccountForm
                    password={deletePassword}
                    setPassword={setDeletePassword}
                    loading={deleteLoading}
                    message={deleteMessage}
                    isError={deleteError}
                    onSubmit={handleDeleteAccount}
                />
            </section>
        </main>
    );
}