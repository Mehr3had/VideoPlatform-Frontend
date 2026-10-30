"use client";

import { useEffect } from "react";
import { useAppearanceStore } from "@/stores/useAppearanceStore";

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

export default function AppearanceInitializer() {
    const mode = useAppearanceStore((state) => state.mode);
    const accent = useAppearanceStore((state) => state.accent);
    const backgroundStyle = useAppearanceStore(
        (state) => state.backgroundStyle
    );

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

        root.style.setProperty(
            "--accent-hover",
            accent
        );
    }, [mode, accent, backgroundStyle]);

    return null;
}