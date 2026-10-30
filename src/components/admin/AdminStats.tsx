"use client";

import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

type StatusFilter =
    | "all"
    | "pending"
    | "reviewed"
    | "dismissed"
    | "action_taken";

interface AdminStatsProps {
    totalCount: number;
    pendingCount: number;
    reviewedCount: number;
    dismissedCount: number;
    actionTakenCount: number;
    statusFilter: StatusFilter;
    onFilterChange: (status: StatusFilter) => void;
}

export default function AdminStats({
    totalCount,
    pendingCount,
    reviewedCount,
    dismissedCount,
    actionTakenCount,
    statusFilter,
    onFilterChange,
}: AdminStatsProps) {
    const { language, isPersian } = useLanguage();
    const t = translations[language].admin;

    const stats: {
        title: string;
        value: StatusFilter;
        count: number;
        color: string;
        textColor: string;
        icon: string;
    }[] = [
        {
            title: t.allReports,
            value: "all",
            count: totalCount,
            color: "border-s-red-500",
            textColor: "text-red-600 dark:text-red-400",
            icon: "📋",
        },
        {
            title: t.pending,
            value: "pending",
            count: pendingCount,
            color: "border-s-amber-500",
            textColor: "text-amber-600 dark:text-amber-400",
            icon: "⏳",
        },
        {
            title: t.reviewed,
            value: "reviewed",
            count: reviewedCount,
            color: "border-s-blue-500",
            textColor: "text-blue-600 dark:text-blue-400",
            icon: "✓",
        },
        {
            title: t.dismissed,
            value: "dismissed",
            count: dismissedCount,
            color: "border-s-gray-400",
            textColor: "text-gray-600 dark:text-gray-300",
            icon: "—",
        },
        {
            title: t.actionTaken,
            value: "action_taken",
            count: actionTakenCount,
            color: "border-s-red-600",
            textColor: "text-red-600 dark:text-red-400",
            icon: "⚑",
        },
    ];

    const overviewItems = [
        {
            title: t.pendingReports,
            count: pendingCount,
            icon: "⚑",
            featured: true,
        },
        {
            title: t.totalReports,
            count: totalCount,
            icon: "📋",
            featured: false,
        },
    ];

    return (
        <div dir={isPersian ? "rtl" : "ltr"} className="space-y-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {overviewItems.map((item) => (
                    <div
                        key={item.title}
                        className={`flex min-h-28 items-center justify-between gap-4 rounded-xl border bg-white px-5 py-4 shadow-sm dark:bg-[#181818] sm:px-6 ${
                            item.featured
                                ? "border-red-200 dark:border-red-900/50"
                                : "border-gray-200 dark:border-[#303030]"
                        }`}
                    >
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {item.title}
                            </p>

                            <p
                                className={`mt-2 text-3xl font-bold ${
                                    item.featured
                                        ? "text-red-600 dark:text-red-400"
                                        : ""
                                }`}
                            >
                                {item.count.toLocaleString(
                                    isPersian ? "fa-IR" : "en-US"
                                )}
                            </p>
                        </div>

                        <span
                            aria-hidden="true"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xl dark:bg-[#252525]"
                        >
                            {item.icon}
                        </span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
                {stats.map((item) => (
                    <button
                        key={item.value}
                        type="button"
                        onClick={() => onFilterChange(item.value)}
                        aria-pressed={statusFilter === item.value}
                        className={`flex min-h-28 items-center justify-between gap-3 rounded-xl border border-s-4 border-gray-200 ${item.color} bg-white p-4 text-start shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-[#303030] dark:bg-[#181818] dark:hover:bg-[#222222] sm:p-5 ${
                            item.value === "all" ? "xl:col-span-2" : ""
                        } ${
                            statusFilter === item.value
                                ? "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-gray-100 dark:ring-offset-[#0f0f0f]"
                                : ""
                        }`}
                    >
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {item.title}
                            </p>

                            <p
                                className={`mt-2 text-2xl font-bold ${item.textColor}`}
                            >
                                {item.count.toLocaleString(
                                    isPersian ? "fa-IR" : "en-US"
                                )}
                            </p>
                        </div>

                        <span
                            aria-hidden="true"
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-lg dark:bg-[#252525] ${item.textColor}`}
                        >
                            {item.icon}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}