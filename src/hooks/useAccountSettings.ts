"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { API, apiFetch } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

interface ApiResponse {
    id?: number;
    username?: string;
    error?: string;
}

export default function useAccountSettings() {
    const router = useRouter();
    const { language } = useLanguage();
    const t = translations[language].settings;

    const [newUsername, setNewUsername] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [deletePassword, setDeletePassword] = useState("");

    const [usernameLoading, setUsernameLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [usernameMessage, setUsernameMessage] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");
    const [deleteMessage, setDeleteMessage] = useState("");

    const [usernameError, setUsernameError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [deleteError, setDeleteError] = useState(false);

    const requireLogin = () => {
        if (!localStorage.getItem("accessToken")) {
            router.push("/login");
            return false;
        }

        return true;
    };

    const handleUsernameSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!requireLogin()) return;

        const trimmedUsername = newUsername.trim();

        if (!trimmedUsername) {
            setUsernameError(true);
            setUsernameMessage(t.usernameEmpty);
            return;
        }

        setUsernameLoading(true);
        setUsernameMessage("");
        setUsernameError(false);

        try {
            const response = await apiFetch(`${API}/account/username/`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: trimmedUsername }),
            });

            const data: ApiResponse = await response.json().catch(() => ({}));

            if (response.status === 401) {
                router.push("/login");
                return;
            }

            if (!response.ok) {
                setUsernameError(true);
                setUsernameMessage(data.error || t.usernameFailed);
                return;
            }

            if (data.username) {
                setNewUsername(data.username);
                localStorage.setItem("username", data.username);
            }

            setUsernameMessage(t.usernameSuccess);
        } catch (error) {
            console.error("Username update error:", error);
            setUsernameError(true);
            setUsernameMessage(t.connectionError);
        } finally {
            setUsernameLoading(false);
        }
    };

    const handlePasswordSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!requireLogin()) return;

        if (newPassword !== passwordConfirm) {
            setPasswordError(true);
            setPasswordMessage(t.passwordMismatch);
            return;
        }

        setPasswordLoading(true);
        setPasswordMessage("");
        setPasswordError(false);

        try {
            const response = await apiFetch(`${API}/account/password/`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword,
                    password_confirm: passwordConfirm,
                }),
            });

            const data: ApiResponse = await response.json().catch(() => ({}));

            if (response.status === 401) {
                router.push("/login");
                return;
            }

            if (!response.ok) {
                setPasswordError(true);
                setPasswordMessage(data.error || t.passwordFailed);
                return;
            }

            setPasswordMessage(t.passwordSuccess);
            setCurrentPassword("");
            setNewPassword("");
            setPasswordConfirm("");
        } catch (error) {
            console.error("Password update error:", error);
            setPasswordError(true);
            setPasswordMessage(t.connectionError);
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleDeleteAccount = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!requireLogin()) return;

        const confirmed = window.confirm(t.confirmDelete);

        if (!confirmed) return;

        setDeleteLoading(true);
        setDeleteMessage("");
        setDeleteError(false);

        try {
            const response = await apiFetch(`${API}/account/delete/`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: deletePassword }),
            });

            const data: ApiResponse = await response.json().catch(() => ({}));

            if (response.status === 401) {
                router.push("/login");
                return;
            }

            if (!response.ok) {
                setDeleteError(true);
                setDeleteMessage(data.error || t.deleteFailed);
                return;
            }

            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("username");

            setDeletePassword("");
            router.replace("/login");
        } catch (error) {
            console.error("Account deletion error:", error);
            setDeleteError(true);
            setDeleteMessage(t.connectionError);
        } finally {
            setDeleteLoading(false);
        }
    };

    return {
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
    };
}