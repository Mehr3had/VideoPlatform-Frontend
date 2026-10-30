"use client";

import Link from "next/link";
import useResetPassword from "@/hooks/useResetPassword";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

interface ResetPasswordFormProps {
    uid: string;
    token: string;
}

export default function ResetPasswordForm({
    uid,
    token,
}: ResetPasswordFormProps) {
    const {
        newPassword,
        setNewPassword,
        passwordConfirm,
        setPasswordConfirm,
        message,
        success,
        loading,
        handleResetPassword,
    } = useResetPassword(uid, token);

    const { language, isPersian } = useLanguage();
    const t = translations[language].resetPassword;

    const inputClass =
        "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-[var(--accent)]/20";

    const labelClass =
        "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";

    return (
        <div
            dir={isPersian ? "rtl" : "ltr"}
            className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm dark:bg-[#181818]"
        >
            <div className="mb-6">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-2xl">
                    🔒
                </div>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {t.title}
                </h1>

                <p className="mt-2 text-gray-500 dark:text-gray-400">
                    {t.description}
                </p>
            </div>

            {message && (
                <div
                    role={success ? "status" : "alert"}
                    aria-live="polite"
                    dir="auto"
                    className={`mb-5 rounded-lg border p-3 text-sm ${
                        success
                            ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
                            : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                    }`}
                >
                    {message}
                </div>
            )}

            {!success && (
                <form onSubmit={handleResetPassword} className="space-y-5">
                    <div>
                        <label htmlFor="new-password" className={labelClass}>
                            {t.newPassword}
                        </label>

                        <input
                            id="new-password"
                            type="password"
                            dir={isPersian && !newPassword ? "rtl" : "ltr"}
                            autoComplete="new-password"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            required
                            minLength={8}
                            placeholder={t.newPasswordPlaceholder}
                            className={`${inputClass} ${
                                isPersian && !newPassword ? "text-right" : "text-left"
                            }`}
                        />
                    </div>

                    <div>
                        <label htmlFor="password-confirm" className={labelClass}>
                            {t.confirmPassword}
                        </label>

                        <input
                            id="password-confirm"
                            type="password"
                            dir={isPersian && !passwordConfirm ? "rtl" : "ltr"}
                            autoComplete="new-password"
                            value={passwordConfirm}
                            onChange={(event) => setPasswordConfirm(event.target.value)}
                            required
                            minLength={8}
                            placeholder={t.confirmPasswordPlaceholder}
                            className={`${inputClass} ${
                                isPersian && !passwordConfirm ? "text-right" : "text-left"
                            }`}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="accent-button w-full rounded-lg px-5 py-3 font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? t.submitting : t.submit}
                    </button>
                </form>
            )}

            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                {t.rememberPassword}{" "}
                <Link
                    href="/login"
                    className="font-medium text-[var(--accent)] transition hover:opacity-80"
                >
                    {t.login}
                </Link>
            </p>
        </div>
    );
}