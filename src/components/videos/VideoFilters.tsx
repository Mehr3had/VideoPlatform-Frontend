"use client";

import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

interface Category {
    id: number;
    name: string;
}

interface VideoFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    category: string;
    categories: Category[];
    onCategoryChange: (value: string) => void;
    onSearch: () => void;
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

    return (
        <div
            dir={isPersian ? "rtl" : "ltr"}
            className="mb-8 flex flex-col gap-4 md:flex-row"
        >
            <input
                type="text"
                placeholder={t.searchPlaceholder}
                aria-label={t.searchPlaceholder}
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                onKeyDown={(event) => {
                    if (event.key === "Enter") onSearch();
                }}
                className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-red-600 dark:border-[#404040] dark:bg-[#181818] dark:text-gray-100"
            />

            <select
                aria-label={t.allCategories}
                value={category}
                onChange={(event) => onCategoryChange(event.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-red-600 dark:border-[#404040] dark:bg-[#181818] dark:text-gray-100"
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
                onClick={onSearch}
                className="rounded-lg bg-red-700 px-6 py-3 font-medium text-white hover:bg-red-800"
            >
                {t.search}
            </button>
        </div>
    );
}