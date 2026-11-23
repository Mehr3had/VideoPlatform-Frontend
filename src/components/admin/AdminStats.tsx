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

    const mobileLabels: Record<StatusFilter, string> = isPersian
        ? {
            all: "همه",
            pending: "انتظار",
            reviewed: "بررسی",
            dismissed: "رد",
            action_taken: "اقدام",
        }
        : {
            all: "All",
            pending: "Pending",
            reviewed: "Reviewed",
            dismissed: "Dismissed",
            action_taken: "Action",
        };
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
        <div dir={isPersian ? "rtl" : "ltr"} className="space-y-4 sm:space-y-8">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-4">
                {overviewItems.map((item) => (
                    <div
                        key={item.title}
                        className={`flex min-h-0 items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2.5 shadow-sm dark:bg-[#181818] sm:min-h-28 sm:gap-4 sm:rounded-xl sm:px-6 sm:py-4 ${
                            item.featured
                                ? "border-red-200 dark:border-red-900/50"
                                : "border-gray-200 dark:border-[#303030]"
                        }`}
                    >
                        <div>
                            <p className="text-xs leading-4 text-gray-500 dark:text-gray-400 sm:text-sm sm:leading-normal">
                                {item.title}
                            </p>

                            <p
                                className={`mt-1 text-xl font-bold sm:mt-2 sm:text-3xl ${
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
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-base dark:bg-[#252525] sm:h-11 sm:w-11 sm:text-xl"
                        >
                            {item.icon}
                        </span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-5 gap-1.5 sm:hidden">
                {stats.map((item) => (
                    <button
                        key={`mobile-${item.value}`}
                        type="button"
                        onClick={() => onFilterChange(item.value)}
                        aria-pressed={statusFilter === item.value}
                        aria-label={`${item.title}: ${item.count.toLocaleString(
                            isPersian ? "fa-IR" : "en-US"
                        )}`}
                        title={item.title}
                        className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg border border-s-2 border-gray-200 ${item.color} bg-white px-0.5 py-2 text-center shadow-sm transition dark:border-[#303030] dark:bg-[#181818] ${
                            statusFilter === item.value
                                ? "ring-1 ring-[var(--accent)] ring-offset-1 ring-offset-gray-100 dark:ring-offset-[#0f0f0f]"
                                : ""
                        }`}
                    >
                        <span
                            aria-hidden="true"
                            className={`flex h-5 w-5 items-center justify-center text-sm ${item.textColor}`}
                        >
                            {item.icon}
                        </span>

                        <span className="w-full break-words text-[9px] font-medium leading-3 text-gray-500 dark:text-gray-400">
                            {mobileLabels[item.value]}
                        </span>

                        <span
                            className={`max-w-full truncate text-xs font-bold tabular-nums ${item.textColor}`}
                        >
                            {item.count.toLocaleString(
                                isPersian ? "fa-IR" : "en-US"
                            )}
                        </span>
                    </button>
                ))}
            </div>

            <div className="hidden grid-cols-2 gap-2 sm:grid sm:grid-cols-2 sm:gap-3 md:grid-cols-3 xl:grid-cols-6">
                {stats.map((item) => (
                    <button
                        key={item.value}
                        type="button"
                        onClick={() => onFilterChange(item.value)}
                        aria-pressed={statusFilter === item.value}
                        className={`flex min-h-0 items-center justify-between gap-2 rounded-lg border border-s-4 border-gray-200 ${item.color} bg-white p-2.5 text-start shadow-sm transition hover:shadow-md dark:border-[#303030] dark:bg-[#181818] dark:hover:bg-[#222222] sm:min-h-28 sm:gap-3 sm:rounded-xl sm:p-5 sm:hover:-translate-y-0.5 ${
                            item.value === "all" ? "xl:col-span-2" : ""
                        } ${
                            statusFilter === item.value
                                ? "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-gray-100 dark:ring-offset-[#0f0f0f]"
                                : ""
                        }`}
                    >
                        <div className="min-w-0">
                            <p className="text-xs leading-4 text-gray-500 dark:text-gray-400 sm:text-sm sm:leading-normal">
                                {item.title}
                            </p>

                            <p
                                className={`mt-1 text-xl font-bold sm:mt-2 sm:text-2xl ${item.textColor}`}
                            >
                                {item.count.toLocaleString(
                                    isPersian ? "fa-IR" : "en-US"
                                )}
                            </p>
                        </div>

                        <span
                            aria-hidden="true"
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-base dark:bg-[#252525] sm:h-9 sm:w-9 sm:text-lg ${item.textColor}`}
                        >
                            {item.icon}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}