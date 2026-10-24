"use client";

import { useState, type FormEvent } from "react";
import { API, apiFetch } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

export default function useResetPassword(uid: string, token: string) {
    const { language } = useLanguage();
    const t = translations[language].resetPassword;

    const [newPassword, setNewPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setMessage("");
        setSuccess(false);

        if (!uid || !token) {
            setMessage(t.invalidLink);
            return;
        }

        if (newPassword.length < 8) {
            setMessage(t.passwordTooShort);
            return;
        }

        if (newPassword !== passwordConfirm) {
            setMessage(t.passwordMismatch);
            return;
        }

        setLoading(true);

        try {
            const response = await apiFetch(
                `${API}/password-reset/confirm/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        uid,
                        token,
                        new_password: newPassword,
                        password_confirm: passwordConfirm,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.error ||
                    data.detail ||
                    t.resetFailed
                );
                return;
            }

            setSuccess(true);
            setMessage(data.message || t.resetSuccess);
            setNewPassword("");
            setPasswordConfirm("");
        } catch {
            setMessage(t.connectionError);
        } finally {
            setLoading(false);
        }
    };

    return {
        newPassword,
        setNewPassword,
        passwordConfirm,
        setPasswordConfirm,
        message,
        success,
        loading,
        handleResetPassword,
    };
}
