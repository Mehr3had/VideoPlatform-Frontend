"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";
import { API, apiFetch, ensureAccessToken } from "@/lib/api";

const MAX_SEARCH_HISTORY = 5;

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
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showSearchHistory, setShowSearchHistory] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const categoryDropdownRef = useRef<HTMLDivElement>(null);
    const categoryTriggerRef = useRef<HTMLButtonElement>(null);

    // Load recent searches from the backend.
    useEffect(() => {
        let cancelled = false;
        let generation = 0;

        const loadRecentSearches = async () => {
            const currentGeneration = ++generation;

            try {
                const token = await ensureAccessToken();

                if (cancelled || currentGeneration !== generation) return;

                if (!token) {
                    setRecentSearches([]);
                    return;
                }

                const response = await apiFetch(`${API}/search-history/`);

                if (!response.ok) {
                    throw new Error(`Search history load failed: ${response.status}`);
                }

                const data: { results?: unknown } = await response.json();

                if (cancelled || currentGeneration !== generation) return;

                const normalized = Array.isArray(data.results)
                    ? data.results
                        .filter((item): item is string => typeof item === "string")
                        .map((item) => item.trim())
                        .filter(Boolean)
                        .slice(0, MAX_SEARCH_HISTORY)
                    : [];

                setRecentSearches(normalized);
            } catch (error) {
                if (!cancelled) {
                    console.error("Failed to load search history:", error);
                }
            }
        };

        const handleAuthenticated = () => {
            void loadRecentSearches();
        };

        const handleLoggedOut = () => {
            generation++;
            setRecentSearches([]);
            setShowSearchHistory(false);
        };

        void loadRecentSearches();

        window.addEventListener("app:authenticated", handleAuthenticated);
        window.addEventListener("app:logged-out", handleLoggedOut);

        return () => {
            cancelled = true;
            generation++;

            window.removeEventListener("app:authenticated", handleAuthenticated);
            window.removeEventListener("app:logged-out", handleLoggedOut);
        };
    }, []);

    // Save recent searches on the backend for authenticated users.
    const saveRecentSearch = (value: string) => {
        const normalized = value.trim();
        if (!normalized) return;

        const nextHistory = [
            normalized,
            ...recentSearches.filter(
                (item) => item.toLowerCase() !== normalized.toLowerCase()
            ),
        ].slice(0, MAX_SEARCH_HISTORY);

        setRecentSearches(nextHistory);

        void (async () => {
            try {
                const token = await ensureAccessToken();
                if (!token) return;

                const response = await apiFetch(`${API}/search-history/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query: normalized }),
                });

                if (!response.ok) {
                    throw new Error(`Search history save failed: ${response.status}`);
                }

                const data: { results?: unknown } = await response.json();

                if (Array.isArray(data.results)) {
                    setRecentSearches(
                        data.results
                            .filter((item): item is string => typeof item === "string")
                            .slice(0, MAX_SEARCH_HISTORY)
                    );
                }
            } catch (error) {
                console.error("Failed to save search history:", error);
            }
        })();
    };

    // Remove one recent search.
    const removeRecentSearch = (value: string) => {
        const nextHistory = recentSearches.filter((item) => item !== value);

        setRecentSearches(nextHistory);
        setActiveIndex(-1);

        if (nextHistory.length === 0) {
            setShowSearchHistory(false);
        }

        void (async () => {
            try {
                const token = await ensureAccessToken();
                if (!token) return;

                const response = await apiFetch(
                    `${API}/search-history/?query=${encodeURIComponent(value)}`,
                    { method: "DELETE" }
                );

                if (!response.ok) {
                    throw new Error(`Search history delete failed: ${response.status}`);
                }
            } catch (error) {
                console.error("Failed to remove search history:", error);
            }
        })();
    };

    // Clear all recent searches.
    const clearSearchHistory = () => {
        setRecentSearches([]);
        setShowSearchHistory(false);
        setActiveIndex(-1);

        void (async () => {
            try {
                const token = await ensureAccessToken();
                if (!token) return;

                const response = await apiFetch(
                    `${API}/search-history/`,
                    { method: "DELETE" }
                );

                if (!response.ok) {
                    throw new Error(`Search history clear failed: ${response.status}`);
                }
            } catch (error) {
                console.error("Failed to clear search history:", error);
            }
        })();
    };
    // Close dropdowns and release input focus.
    const closeDropdowns = () => {
        setShowSuggestions(false);
        setShowSearchHistory(false);
        setActiveIndex(-1);
        setIsSearchFocused(false);
        searchInputRef.current?.blur();
    };

    // Execute the current search.
    const executeSearch = (value?: string) => {
        const query = (value ?? search).trim();

        if (query) {
            saveRecentSearch(query);
        }

        setShowSuggestions(false);
        setShowSearchHistory(false);
        setActiveIndex(-1);
        setIsSearchFocused(false);
        searchInputRef.current?.blur();

        onSearch(query || undefined);
    };

    // Select an autocomplete suggestion.
    const selectSuggestion = (title: string) => {
        onSearchChange(title);
        saveRecentSearch(title);
        closeDropdowns();
        onSearch(title);
    };

    // Select a previous search.
    const selectRecentSearch = (query: string) => {
        onSearchChange(query);
        saveRecentSearch(query);
        closeDropdowns();
        onSearch(query);
    };

    // Fetch video suggestions while the input is focused.
    useEffect(() => {
        const query = search.trim();

        if (!isSearchFocused || query.length < 2) {
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

                const results = data.results
                    .filter((video) =>
                        video.title.toLowerCase().includes(query.toLowerCase())
                    )
                    .slice(0, 5);

                setSuggestions(results);
                setShowSuggestions(results.length > 0);
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
    }, [search, isSearchFocused]);

    // Close dropdowns when clicking outside the search area.
    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            const target = event.target as Node;

            if (
                containerRef.current &&
                !containerRef.current.contains(target)
            ) {
                setShowSuggestions(false);
                setShowSearchHistory(false);
                setActiveIndex(-1);
                setIsSearchFocused(false);
            }

            if (
                categoryDropdownRef.current &&
                !categoryDropdownRef.current.contains(target)
            ) {
                setShowCategoryDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (event.key === "Escape") {
            setShowSuggestions(false);
            setShowSearchHistory(false);
            setActiveIndex(-1);
            return;
        }

        const activeListLength = showSuggestions
            ? suggestions.length
            : showSearchHistory
                ? recentSearches.length
                : 0;

        if (event.key === "ArrowDown" && activeListLength > 0) {
            event.preventDefault();

            setActiveIndex((current) =>
                current < activeListLength - 1 ? current + 1 : 0
            );

            return;
        }

        if (event.key === "ArrowUp" && activeListLength > 0) {
            event.preventDefault();

            setActiveIndex((current) =>
                current > 0 ? current - 1 : activeListLength - 1
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
                return;
            }

            if (
                showSearchHistory &&
                activeIndex >= 0 &&
                recentSearches[activeIndex]
            ) {
                selectRecentSearch(recentSearches[activeIndex]);
                return;
            }

            executeSearch();
        }
    };

    return (
        <div
            dir={isPersian ? "rtl" : "ltr"}
            className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] gap-2 md:mb-8 md:flex md:gap-4"
        >
            <div ref={containerRef} className="relative col-start-1 row-start-1 col-span-1 min-w-0 md:col-auto md:row-auto md:flex-1">
                <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={t.searchPlaceholder}
                    aria-label={t.searchPlaceholder}
                    aria-autocomplete="list"
                    aria-expanded={showSuggestions || showSearchHistory}
                    aria-controls={
                        showSearchHistory
                            ? "search-history-list"
                            : "video-search-suggestions"
                    }
                    value={search}
                    onFocus={() => {
                        setIsSearchFocused(true);

                        if (search.trim().length < 2) {
                            setShowSuggestions(false);
                            setShowSearchHistory(recentSearches.length > 0);
                            setActiveIndex(-1);
                        } else {
                            setShowSearchHistory(false);

                            if (suggestions.length > 0) {
                                setShowSuggestions(true);
                            }
                        }
                    }}
                    onBlur={() => {
                        setIsSearchFocused(false);
                        setShowSuggestions(false);
                        setShowSearchHistory(false);
                        setActiveIndex(-1);
                    }}
                    onChange={(event) => {
                        const value = event.target.value;

                        onSearchChange(value);
                        setActiveIndex(-1);

                        if (value.trim().length === 0) {
                            setShowSearchHistory(recentSearches.length > 0);
                            setShowSuggestions(false);
                        } else {
                            setShowSearchHistory(false);
                        }
                    }}
                    onKeyDown={handleKeyDown}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 outline-none transition focus:border-[var(--accent)] md:px-4 md:py-3 focus:ring-2 focus:ring-[var(--accent)]/20 dark:border-[#404040] dark:bg-[#181818] dark:text-gray-100"
                />

                {/* Recent Search History */}
                {showSearchHistory && recentSearches.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white py-2 shadow-xl dark:border-[#404040] dark:bg-[#202020]">
                        <div className="flex items-center justify-between border-b border-gray-100 px-4 pb-2 dark:border-[#383838]">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                {t.searchHistory}
                            </p>

                            <button
                                type="button"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={clearSearchHistory}
                                className="text-xs font-medium text-gray-500 transition hover:text-[var(--accent)] dark:text-gray-400"
                            >
                                {t.clearSearchHistory}
                            </button>
                        </div>

                        <ul
                            id="search-history-list"
                            role="listbox"
                            aria-label={t.searchHistory}
                            className="py-1"
                        >
                            {recentSearches.map((item, index) => (
                                <li
                                    key={item}
                                    role="option"
                                    aria-selected={index === activeIndex}
                                >
                                    <div className="flex items-center gap-2 px-2">
                                        <button
                                            type="button"
                                            onMouseDown={(event) => event.preventDefault()}
                                            onClick={() => selectRecentSearch(item)}
                                            className={`group flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-transparent border-s-2 px-2 py-2 text-start text-sm transition-colors hover:border-[var(--accent)] md:py-3 hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] ${
                                                index === activeIndex
                                                    ? "border-[var(--accent)] bg-[var(--accent)]/10 text-gray-900 dark:text-gray-100"
                                                    : "text-gray-700 dark:text-gray-300"
                                            }`}
                                        >
                                            <svg
                                                aria-hidden="true"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="h-5 w-5 shrink-0 text-gray-400 transition-colors group-hover:text-[var(--accent)]"
                                            >
                                                <circle cx="12" cy="12" r="9" />
                                                <path d="M12 7v5l3 2" />
                                            </svg>

                                            <span className="truncate">
                                                {item}
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            onMouseDown={(event) => event.preventDefault()}
                                            onClick={() => removeRecentSearch(item)}
                                            aria-label={`${t.removeSearchHistory}: ${item}`}
                                            title={t.removeSearchHistory}
                                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg text-gray-400 transition hover:bg-gray-200 hover:text-red-500 dark:hover:bg-[#404040]"
                                        >
                                            {"\u00D7"}
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Existing Video Autocomplete Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                    <ul
                        id="video-search-suggestions"
                        role="listbox"
                        className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white py-2 shadow-xl dark:border-[#404040] dark:bg-[#202020]"
                    >
                        {suggestions.map((suggestion, index) => (
                            <li
                                key={suggestion.id}
                                role="option"
                                aria-selected={index === activeIndex}
                            >
                                <button
                                    type="button"
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => selectSuggestion(suggestion.title)}
                                    className={`group mx-2 flex w-[calc(100%-1rem)] cursor-pointer items-center gap-3 rounded-lg border border-transparent border-s-2 px-3 py-2 text-start transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 ${
                                        index === activeIndex
                                            ? "border-[var(--accent)] bg-[var(--accent)]/10"
                                            : "text-gray-700 dark:text-gray-300"
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
                                                {"\u25B6"}
                                            </span>
                                        </div>
                                    )}

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-gray-900 transition-colors group-hover:text-[var(--accent)] dark:text-gray-100">
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

            <div
                ref={categoryDropdownRef}
                className="relative col-start-1 row-start-2 col-span-2 w-fit max-w-[180px] min-w-0 justify-self-start md:col-auto md:row-auto md:w-auto md:max-w-none md:min-w-[180px]"
                onKeyDown={(event) => {
                    if (event.key === "Escape" && showCategoryDropdown) {
                        event.preventDefault();
                        setShowCategoryDropdown(false);
                        categoryTriggerRef.current?.focus();
                    }
                }}
            >
                <button
                    ref={categoryTriggerRef}
                    type="button"
                    aria-label={t.allCategories}
                    aria-haspopup="listbox"
                    aria-expanded={showCategoryDropdown}
                    aria-controls="category-options-list"
                    onClick={() =>
                        setShowCategoryDropdown((current) => !current)
                    }
                    onKeyDown={(event) => {
                        if (event.key === "ArrowDown" && !showCategoryDropdown) {
                            event.preventDefault();
                            setShowCategoryDropdown(true);
                        }
                    }}
                    className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-gray-300 bg-white px-3 py-2 text-start text-sm text-gray-900 outline-none transition hover:border-[var(--accent)] md:px-4 md:py-3 md:text-base hover:bg-[var(--accent)]/10 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 dark:border-[#404040] dark:bg-[#181818] dark:text-gray-100"
                >
                    <span className="truncate transition-colors group-hover:text-[var(--accent)]">
                        {categories.find(
                            (item) => String(item.id) === category
                        )?.name ?? t.allCategories}
                    </span>

                    <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`h-4 w-4 shrink-0 text-gray-500 transition-transform group-hover:text-[var(--accent)] ${
                            showCategoryDropdown ? "rotate-180" : ""
                        }`}
                    >
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </button>

                {showCategoryDropdown && (
                    <div
                        id="category-options-list"
                        role="listbox"
                        aria-label={t.allCategories}
                        className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-xl border border-gray-200 bg-white py-2 shadow-xl dark:border-[#404040] dark:bg-[#202020]"
                    >
                        <button
                            type="button"
                            role="option"
                            aria-selected={category === ""}
                            onClick={() => {
                                onCategoryChange("");
                                setShowCategoryDropdown(false);
                                categoryTriggerRef.current?.focus();
                            }}
                            className={`group mx-2 flex w-[calc(100%-1rem)] cursor-pointer items-center justify-between gap-3 rounded-lg border border-transparent border-s-2 px-3 py-2 text-start text-sm md:py-3 transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] ${
                                category === ""
                                    ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                                    : "text-gray-700 dark:text-gray-300"
                            }`}
                        >
                            <span>{t.allCategories}</span>

                            {category === "" && (
                                <svg
                                    aria-hidden="true"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4 shrink-0 text-[var(--accent)]"
                                >
                                    <path d="m5 12 4 4L19 6" />
                                </svg>
                            )}
                        </button>

                        {categories.map((item) => {
                            const isSelected = category === String(item.id);

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    role="option"
                                    aria-selected={isSelected}
                                    onClick={() => {
                                        onCategoryChange(String(item.id));
                                        setShowCategoryDropdown(false);
                                        categoryTriggerRef.current?.focus();
                                    }}
                                    className={`group mx-2 flex w-[calc(100%-1rem)] cursor-pointer items-center justify-between gap-3 rounded-lg border border-transparent border-s-2 px-3 py-2 text-start text-sm md:py-3 transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] ${
                                        isSelected
                                            ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                                            : "text-gray-700 dark:text-gray-300"
                                    }`}
                                >
                                    <span className="truncate">
                                        {item.name}
                                    </span>

                                    {isSelected && (
                                        <svg
                                            aria-hidden="true"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-4 w-4 shrink-0 text-[var(--accent)]"
                                        >
                                            <path d="m5 12 4 4L19 6" />
                                        </svg>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            <button
                type="button"
                onClick={() => executeSearch()}
                className="col-start-2 row-start-1 cursor-pointer accent-button rounded-lg px-3 py-1.5 text-xs font-medium md:col-auto md:row-auto md:px-6 md:py-3 md:text-sm"
            >
                {t.search}
            </button>
        </div>
    );
}