"use client";

import { useEffect, useState } from "react";

export function useTheme() {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        const isDark = savedTheme === "dark";

        setDarkMode(isDark);
        document.documentElement.classList.toggle("dark", isDark);
    }, []);

    const toggleTheme = () => {
        const nextDarkMode = !darkMode;

        setDarkMode(nextDarkMode);
        localStorage.setItem("theme", nextDarkMode ? "dark" : "light");
        document.documentElement.classList.toggle("dark", nextDarkMode);
    };

    return { darkMode, toggleTheme };
}