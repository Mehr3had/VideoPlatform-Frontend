"use client";

import { useAppearanceStore } from "@/stores/useAppearanceStore";

export function useTheme() {
    const mode = useAppearanceStore((state) => state.mode);
    const setMode = useAppearanceStore((state) => state.setMode);

    const toggleTheme = () => {
        setMode(mode === "dark" ? "light" : "dark");
    };

    return {
        darkMode: mode === "dark",
        toggleTheme,
    };
}