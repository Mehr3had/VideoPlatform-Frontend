"use client";

import { useState, type FormEvent } from "react";
import { API, apiFetch } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

interface RecoveryOptions {
    endpoint: string;
    successMessage: string;
}

export default function useAccountRecovery({
    endpoint,
    successMessage,
}: RecoveryOptions) {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const { language } = useLanguage();
    const t = translations[language].recoveryMessages;

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage("");
        setSuccess(false);
        setLoading(true);

        try {
            const response = await apiFetch(`${API}${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.error ||
                    data.detail ||
                    t.requestError
                );
                return;
            }

            setSuccess(true);
            setMessage(data.message || successMessage || t.success);
            setEmail("");
        } catch {
            setMessage(t.connectionError);
        } finally {
            setLoading(false);
        }
    };

    return {
        email,
        setEmail,
        message,
        success,
        loading,
        handleSubmit,
    };
}