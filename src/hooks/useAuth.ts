"use client";

import { useEffect, useState } from "react";
import { API, apiFetch } from "@/lib/api";

export function useAuth() {
    const [username, setUsername] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            setUsername(null);
            setUserId(null);
            setIsAdmin(false);
            setProfileImage(null);
            return;
        }

        const getCurrentUser = async () => {
            try {
                const response = await apiFetch(`${API}/me/`);

                if (!response.ok) {
                    setUsername(null);
                    setUserId(null);
                    setIsAdmin(false);
                    setProfileImage(null);
                    return;
                }

                const data = await response.json();

                setUsername(data.username);
                setUserId(data.id);
                setIsAdmin(data.is_admin === true);

                localStorage.setItem("username", data.username);

                // دریافت تصویر پروفایل کاربر
                const profileResponse = await apiFetch(
                    `${API}/users/${data.id}/`
                );

                if (profileResponse.ok) {
                    const profileData = await profileResponse.json();
                    setProfileImage(profileData.profile_image ?? null);
                }
            } catch (error) {
                console.error("Current user error:", error);
            }
        };

        getCurrentUser();
    }, []);

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("username");

        setUsername(null);
        setUserId(null);
        setIsAdmin(false);
        setProfileImage(null);
    };

    return {
        username,
        userId,
        isAdmin,
        profileImage,
        logout,
    };
}