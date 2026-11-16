"use client";

import { useEffect, useState } from "react";
import { API, apiFetch, ensureAccessToken, clearAccessToken, getCsrfHeaders } from "@/lib/api";

export function useAuth() {
    const [username, setUsername] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const getCurrentUser = async () => {
            try {
                // Remove tokens from the previous localStorage strategy.
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");

                // Restore an access token using the HttpOnly cookie.
                const token = await ensureAccessToken();

                if (cancelled) return;

                if (!token) {
                    setUsername(null);
                    setUserId(null);
                    setIsAdmin(false);
                    setProfileImage(null);
                    return;
                }

                const response = await apiFetch(`${API}/me/`);

                if (!response.ok) {
                    clearAccessToken();

                    setUsername(null);
                    setUserId(null);
                    setIsAdmin(false);
                    setProfileImage(null);
                    return;
                }

                const data = await response.json();

                if (cancelled) return;

                setUsername(data.username);
                setUserId(data.id);
                setIsAdmin(data.is_admin === true);

                localStorage.setItem("username", data.username);

                const profileResponse = await apiFetch(
                    `${API}/users/${data.id}/`
                );

                if (profileResponse.ok) {
                    const profileData = await profileResponse.json();

                    if (!cancelled) {
                        setProfileImage(
                            profileData.profile_image ?? null
                        );
                    }
                }
            } catch (error) {
                console.error("Current user error:", error);
            }
        };

        getCurrentUser();

        return () => {
            cancelled = true;
        };
    }, []);

    const logout = async () => {
        try {
            const response = await fetch(`${API}/logout/`, {
                method: "POST",
                credentials: "include",
                headers: await getCsrfHeaders(),
            });

            if (!response.ok) {
                console.error(
                    "Backend logout failed:",
                    response.status
                );
            }
        } catch (error) {
            console.error("Logout request failed:", error);
        } finally {
            clearAccessToken();

            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("username");

            setUsername(null);
            setUserId(null);
            setIsAdmin(false);
            setProfileImage(null);
        }
    };

    return {
        username,
        userId,
        isAdmin,
        profileImage,
        logout,
    };
}