"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { setApiLanguage } from "@/lib/api";
import { saveUserPreferences } from "@/lib/userPreferences";
import { getAccessToken } from "@/lib/api";

export type Language = "fa" | "en";

type LanguageContextType = {
    language: Language;
    setLanguage: (language: Language, persist?: boolean) => void;
    isPersian: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
    undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>("fa");

    const setLanguage = useCallback(
        (nextLanguage: Language, persist = true) => {
            setLanguageState(nextLanguage);
            setApiLanguage(nextLanguage);

            if (persist && getAccessToken()) {
                void saveUserPreferences({
                    language: nextLanguage,
                }).catch((error) => {
                    console.error("Could not save language preference:", error);
                });
            }
        },
        []
    );

    useEffect(() => {
        setApiLanguage(language);
        document.documentElement.lang = language;
        document.documentElement.dir = language === "fa" ? "rtl" : "ltr";
    }, [language]);

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