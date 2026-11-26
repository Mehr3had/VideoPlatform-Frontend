"use client";

import { useEffect } from "react";
import { API, apiFetch, ensureAccessToken } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { useAppearanceStore } from "@/stores/useAppearanceStore";
import { useVideoPlayerStore } from "@/stores/useVideoPlayerStore";

const backgrounds = {
    default: {
        light: "#ffffff",
        dark: "#0f0f0f",
        surfaceLight: "#ffffff",
        surfaceDark: "#181818",
    },
    soft: {
        light: "#f3f4f6",
        dark: "#181825",
        surfaceLight: "#ffffff",
        surfaceDark: "#232333",
    },
    blue: {
        light: "#eff6ff",
        dark: "#101b2d",
        surfaceLight: "#ffffff",
        surfaceDark: "#18263b",
    },
};

interface PreferencesResponse {
    language: "fa" | "en";
    theme: "light" | "dark";
    accent: string;
    background_style: "default" | "soft" | "blue";
    playback_rate: number;
    volume: number;
    muted: boolean;
}

interface WatchHistoryResponse {
    results: {
        video_id: number;
        current_time: number;
        completed: boolean;
    }[];
}

const defaultAppearance = {
    mode: "dark" as const,
    accent: "#8b5cf6",
    backgroundStyle: "default" as const,
};

export default function AppearanceInitializer() {
    const mode = useAppearanceStore((state) => state.mode);
    const accent = useAppearanceStore((state) => state.accent);
    const backgroundStyle = useAppearanceStore(
        (state) => state.backgroundStyle
    );
    const { setLanguage } = useLanguage();

    useEffect(() => {
        let cancelled = false;
        let sessionGeneration = 0;

        const loadServerPreferences = async () => {
            const generation = ++sessionGeneration;

            try {
                const token = await ensureAccessToken();

                if (cancelled || generation !== sessionGeneration) return;

                if (!token) {
                    useVideoPlayerStore.getState().resetPlayerState();
                    return;
                }

                const response = await apiFetch(
                    `${API}/user-preferences/`
                );

                if (
                    !response.ok ||
                    cancelled ||
                    generation !== sessionGeneration
                ) {
                    return;
                }

                const preferences: PreferencesResponse =
                    await response.json();

                if (cancelled || generation !== sessionGeneration) return;

                useAppearanceStore.setState({
                    mode: preferences.theme,
                    accent: preferences.accent,
                    backgroundStyle: preferences.background_style,
                });

                useVideoPlayerStore.getState().hydratePreferences({
                    playback_rate: preferences.playback_rate,
                    volume: preferences.volume,
                    muted: preferences.muted,
                });

                setLanguage(preferences.language, false);

                const historyResponse = await apiFetch(
                    `${API}/watch-history/?limit=100`
                );

                if (
                    !historyResponse.ok ||
                    cancelled ||
                    generation !== sessionGeneration
                ) {
                    return;
                }

                const history: WatchHistoryResponse =
                    await historyResponse.json();

                const progressMap = Object.fromEntries(
                    history.results
                        .filter(
                            (item) =>
                                !item.completed &&
                                Number.isFinite(item.current_time) &&
                                item.current_time > 0
                        )
                        .map((item) => [
                            String(item.video_id),
                            item.current_time,
                        ])
                );

                useVideoPlayerStore.getState().setProgressMap(progressMap);
            } catch (error) {
                if (!cancelled && generation === sessionGeneration) {
                    console.error(
                        "Could not load server preferences:",
                        error
                    );
                }
            }
        };

        const handleAuthenticated = () => {
            void loadServerPreferences();
        };

        const handleLoggedOut = () => {
            sessionGeneration++;

            useAppearanceStore.setState(defaultAppearance);
            useVideoPlayerStore.getState().resetPlayerState();
            setLanguage("fa", false);
        };

        void loadServerPreferences();

        window.addEventListener("app:authenticated", handleAuthenticated);
        window.addEventListener("app:logged-out", handleLoggedOut);

        return () => {
            cancelled = true;
            sessionGeneration++;

            window.removeEventListener(
                "app:authenticated",
                handleAuthenticated
            );
            window.removeEventListener(
                "app:logged-out",
                handleLoggedOut
            );
        };
    }, [setLanguage]);

    useEffect(() => {
        const root = document.documentElement;
        const colors = backgrounds[backgroundStyle];

        root.classList.toggle("dark", mode === "dark");
        root.style.colorScheme = mode;

        root.style.setProperty(
            "--background",
            mode === "dark" ? colors.dark : colors.light
        );

        root.style.setProperty(
            "--surface",
            mode === "dark"
                ? colors.surfaceDark
                : colors.surfaceLight
        );

        root.style.setProperty("--accent", accent);
        root.style.setProperty("--accent-hover", accent);
    }, [mode, accent, backgroundStyle]);

    return null;
}