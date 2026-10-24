"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

export type Language = "fa" | "en";

type LanguageContextType = {
    language: Language;
    setLanguage: (language: Language) => void;
    isPersian: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
    undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>("fa");
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        const savedLanguage = localStorage.getItem("language");

        if (savedLanguage === "fa" || savedLanguage === "en") {
            setLanguageState(savedLanguage);
        }

        setInitialized(true);
    }, []);

    useEffect(() => {
        if (!initialized) return;

        document.documentElement.lang = language;
        document.documentElement.dir = language === "fa" ? "rtl" : "ltr";
        localStorage.setItem("language", language);
    }, [language, initialized]);

    const setLanguage = useCallback((nextLanguage: Language) => {
        localStorage.setItem("language", nextLanguage);
        setLanguageState(nextLanguage);
    }, []);

    return (
        <LanguageContext.Provider
            value={{
                language,
                setLanguage,
                isPersian: language === "fa",
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);

    if (!context) {
        throw new Error(
            "useLanguage must be used inside a LanguageProvider"
        );
    }

    return context;
}