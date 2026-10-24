"use client";

import { useLanguage } from "@/context/LanguageContext";

interface StatCardProps {
    title: string;
    value: number;
}

export default function StatCard({ title, value }: StatCardProps) {
    const { isPersian } = useLanguage();

    const formattedValue = new Intl.NumberFormat(
        isPersian ? "fa-IR" : "en-US"
    ).format(value);

    return (
        <div className="min-w-0 rounded-xl bg-white p-3 text-center shadow-sm sm:p-6 sm:text-start dark:bg-[#181818]">
            <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
                {title}
            </p>

            <p className="mt-1 break-words text-xl font-bold text-gray-900 sm:mt-2 sm:text-3xl dark:text-gray-100">
                {formattedValue}
            </p>
        </div>
    );
}