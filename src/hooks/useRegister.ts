"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { API, apiFetch } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

export default function useRegister() {
    const router = useRouter();
    const { language } = useLanguage();
    const t = translations[language].register;

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        if (password !== passwordConfirm) {
            setError(t.passwordMismatch);
            return;
        }

        setLoading(true);

        try {
            const response = await apiFetch(`${API}/register/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    password_confirm: passwordConfirm,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.error ||
                    data.detail ||
                    t.registrationFailed
                );
                return;
            }

            router.push("/register/success");
        } catch (error) {
            console.error("Registration error:", error);
            setError(t.connectionError);
        } finally {
            setLoading(false);
        }
    };

    return {
        username,
        setUsername,
        email,
        setEmail,
        password,
        setPassword,
        passwordConfirm,
        setPasswordConfirm,
        error,
        loading,
        handleRegister,
    };
}