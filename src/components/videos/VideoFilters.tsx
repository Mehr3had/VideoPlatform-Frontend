"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";
import { API } from "@/lib/api";

interface Category {
    id: number;
    name: string;
}

interface VideoSuggestion {
    id: number;
    title: string;
    thumbnail?: string | null;
    username?: string;
}

interface PaginatedVideos {
    count: number;
    results: VideoSuggestion[];
}

interface VideoFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    category: string;
    categories: Category[];
    onCategoryChange: (value: string) => void;
    onSearch: (value?: string) => void;
}

export default function VideoFilters({
    search,
    onSearchChange,
    category,
    categories,
    onCategoryChange,
    onSearch,
}: VideoFiltersProps) {
    const { language, isPersian } = useLanguage();
    const t = translations[language].home;
    const [suggestions, setSuggestions] = useState<VideoSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const query = search.trim();

        if (query.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            setActiveIndex(-1);
            return;
        }

        const controller = new AbortController();

        const timeoutId = setTimeout(async () => {
            try {
                const params = new URLSearchParams({
                    search: query,
                    page: "1",
                });

                const response = await fetch(
                    `${API}/videos/?${params.toString()}`,
                    { signal: controller.signal }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch search suggestions");
                }

                const data: PaginatedVideos = await response.json();

                setSuggestions(
                    data.results
                        .filter((video) =>
                            video.title.toLowerCase().includes(query.toLowerCase())
                        )
                        .slice(0, 5)
                );

                setShowSuggestions(true);
                setActiveIndex(-1);
            } catch (error) {
                if (
                    error instanceof Error &&
                    error.name !== "AbortError"
                ) {
                    console.error("Search suggestions error:", error);
                }
            }
        }, 300);

        return () => {
            clearTimeout(timeoutId);
            controller.abort();
        };
    }, [search]);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
                setActiveIndex(-1);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

    const selectSuggestion = (title: string) => {
        onSearchChange(title);
        setShowSuggestions(false);
        setActiveIndex(-1);
        onSearch(title);
    };

    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (event.key === "Escape") {
            setShowSuggestions(false);
            setActiveIndex(-1);
            return;
        }

        if (event.key === "ArrowDown" && suggestions.length > 0) {
            event.preventDefault();
            setShowSuggestions(true);
            setActiveIndex((current) =>
                current < suggestions.length - 1 ? current + 1 : 0
            );
            return;
        }

        if (event.key === "ArrowUp" && suggestions.length > 0) {
            event.preventDefault();
            setActiveIndex((current) =>
                current > 0 ? current - 1 : suggestions.length - 1
            );
            return;
        }

        if (event.key === "Enter") {
            event.preventDefault();

            if (
                showSuggestions &&
                activeIndex >= 0 &&
                suggestions[activeIndex]
            ) {
                selectSuggestion(suggestions[activeIndex].title);
            } else {
                setShowSuggestions(false);
                onSearch();
            }
        }
    };

    return (
        <div
            dir={isPersian ? "rtl" : "ltr"}
            className="mb-8 flex flex-col gap-4 md:flex-row"
        >
            <div ref={containerRef} className="relative min-w-0 flex-1">
                <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    aria-label={t.searchPlaceholder}
                    aria-autocomplete="list"
                    aria-expanded={showSuggestions && suggestions.length > 0}
                    value={search}
                    onFocus={() => {
                        if (search.trim().length >= 2 && suggestions.length > 0) {
                            setShowSuggestions(true);
                        }
                    }}
                    onChange={(event) => {
                        onSearchChange(event.target.value);
                        setActiveIndex(-1);
                    }}
                    onKeyDown={handleKeyDown}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 dark:border-[#404040] dark:bg-[#181818] dark:text-gray-100"
                />

                {showSuggestions && suggestions.length > 0 && (
                    <ul
                        role="listbox"
                        className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white py-2 shadow-xl dark:border-[#404040] dark:bg-[#202020]"
                    >
                        {suggestions.map((suggestion, index) => (
                            <li key={suggestion.id} role="option" aria-selected={index === activeIndex}>
                                <button
                                    type="button"
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => selectSuggestion(suggestion.title)}
                                    className={`flex w-full items-center gap-3 px-3 py-2 text-start transition ${
                                        index === activeIndex
                                            ? "bg-gray-100 dark:bg-[#303030]"
                                            : "hover:bg-gray-100 dark:hover:bg-[#303030]"
                                    }`}
                                >
                                    {suggestion.thumbnail ? (
                                        <img
                                            src={suggestion.thumbnail}
                                            alt=""
                                            className="h-12 w-[72px] shrink-0 rounded-md object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-12 w-[72px] shrink-0 items-center justify-center rounded-md bg-gray-200 dark:bg-[#303030]">
                                            <span className="text-xl text-gray-500 dark:text-gray-400">
                                                ▶
                                            </span>
                                        </div>
                                    )}

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {suggestion.title}
                                        </p>

                                        {suggestion.username && (
                                            <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                                                {suggestion.username}
                                            </p>
                                        )}
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <select
                aria-label={t.allCategories}
                value={category}
                onChange={(event) => onCategoryChange(event.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 dark:border-[#404040] dark:bg-[#181818] dark:text-gray-100"
            >
                <option value="">{t.allCategories}</option>

                {categories.map((item) => (
                    <option key={item.id} value={String(item.id)}>
                        {item.name}
                    </option>
                ))}
            </select>

            <button
                type="button"
                onClick={() => {
                    setShowSuggestions(false);
                    onSearch();
                }}
                className="accent-button rounded-lg px-6 py-3 font-medium"
            >
                {t.search}
            </button>
        </div>
    );
}