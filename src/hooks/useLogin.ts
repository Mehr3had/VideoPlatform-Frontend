"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { API, apiFetch, setAccessToken } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

export default function useLogin() {
    const router = useRouter();
    const { language } = useLanguage();
    const t = translations[language].login;

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await apiFetch(`${API}/login/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.error ||
                    data.detail ||
                    t.invalidCredentials
                );
                return;
            }

            if (!data.access) {
                setError(t.connectionError);
                return;
            }

            setAccessToken(data.access);

            window.dispatchEvent(new Event("app:authenticated"));
            router.push("/");
        } catch (error) {
            console.error("Login error:", error);
            setError(t.connectionError);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        username,
        setUsername,
        password,
        setPassword,
        error,
        isLoading,
        handleLogin,
    };
}