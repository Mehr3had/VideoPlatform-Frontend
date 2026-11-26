"use client";

import { useCallback, useEffect, useState } from "react";
import {
    API,
    apiFetch,
    ensureAccessToken,
    clearAccessToken,
    getCsrfHeaders,
} from "@/lib/api";

export function useAuth() {
    const [username, setUsername] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);

    const clearUser = useCallback(() => {
        setUsername(null);
        setUserId(null);
        setIsAdmin(false);
        setProfileImage(null);
    }, []);

    useEffect(() => {
        let cancelled = false;
        let requestVersion = 0;

        const getCurrentUser = async () => {
            const currentRequest = ++requestVersion;

            try {
                const token = await ensureAccessToken();

                if (cancelled || currentRequest !== requestVersion) return;

                if (!token) {
                    clearUser();
                    return;
                }

                const response = await apiFetch(`${API}/me/`);

                if (cancelled || currentRequest !== requestVersion) return;

                if (!response.ok) {
                    if (response.status === 401) clearAccessToken();
                    clearUser();
                    return;
                }

                const data = await response.json();

                if (cancelled || currentRequest !== requestVersion) return;

                setUsername(data.username);
                setUserId(data.id);
                setIsAdmin(data.is_admin === true);

                const profileResponse = await apiFetch(
                    `${API}/users/${data.id}/`
                );

                if (
                    profileResponse.ok &&
                    !cancelled &&
                    currentRequest === requestVersion
                ) {
                    const profileData = await profileResponse.json();
                    setProfileImage(profileData.profile_image ?? null);
                }
            } catch (error) {
                if (!cancelled) {
                    console.error("Current user error:", error);
                }
            }
        };

        const handleAuthenticated = () => {
            void getCurrentUser();
        };

        const handleLoggedOut = () => {
            requestVersion++;
            clearUser();
        };

        const handleUserUpdated = () => {
            void getCurrentUser();
        };

        void getCurrentUser();

        window.addEventListener("app:authenticated", handleAuthenticated);
        window.addEventListener("app:logged-out", handleLoggedOut);
        window.addEventListener("app:user-updated", handleUserUpdated);

        return () => {
            cancelled = true;
            requestVersion++;

            window.removeEventListener(
                "app:authenticated",
                handleAuthenticated
            );
            window.removeEventListener(
                "app:logged-out",
                handleLoggedOut
            );
            window.removeEventListener("app:user-updated", handleUserUpdated);
        };
    }, [clearUser]);

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
            window.dispatchEvent(new Event("app:logged-out"));
            clearUser();
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