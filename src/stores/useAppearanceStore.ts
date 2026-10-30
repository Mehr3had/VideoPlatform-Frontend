"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type ThemeMode = "light" | "dark";

type BackgroundStyle = "default" | "soft" | "blue";

interface AppearanceState {
    mode: ThemeMode;
    accent: string;
    backgroundStyle: BackgroundStyle;

    setMode: (mode: ThemeMode) => void;
    setAccent: (accent: string) => void;
    setBackgroundStyle: (style: BackgroundStyle) => void;
    resetAppearance: () => void;
}

const defaultAppearance = {
    mode: "dark" as ThemeMode,
    accent: "#8b5cf6",
    backgroundStyle: "default" as BackgroundStyle,
};

export const useAppearanceStore = create<AppearanceState>()(
    persist(
        (set) => ({
            ...defaultAppearance,

            setMode: (mode) => set({ mode }),

            setAccent: (accent) => set({ accent }),

            setBackgroundStyle: (backgroundStyle) =>
                set({ backgroundStyle }),

            resetAppearance: () => set(defaultAppearance),
        }),
        {
            name: "video-platform-appearance",
            storage: createJSONStorage(() => localStorage),
        }
    )
);