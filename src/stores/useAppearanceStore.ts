"use client";

import { create } from "zustand";
import { saveUserPreferences } from "@/lib/userPreferences";

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

function saveAppearance(
    updates: {
        theme?: ThemeMode;
        accent?: string;
        background_style?: BackgroundStyle;
    }
) {
    void saveUserPreferences(updates).catch((error) => {
        console.error("Could not save appearance settings:", error);
    });
}

export const useAppearanceStore = create<AppearanceState>()((set) => ({
    ...defaultAppearance,

    setMode: (mode) => {
        set({ mode });
        saveAppearance({ theme: mode });
    },

    setAccent: (accent) => {
        set({ accent });
        saveAppearance({ accent });
    },

    setBackgroundStyle: (backgroundStyle) => {
        set({ backgroundStyle });
        saveAppearance({ background_style: backgroundStyle });
    },

    resetAppearance: () => {
        set(defaultAppearance);
        saveAppearance({
            theme: defaultAppearance.mode,
            accent: defaultAppearance.accent,
            background_style: defaultAppearance.backgroundStyle,
        });
    },
}));