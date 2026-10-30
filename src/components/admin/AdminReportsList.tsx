"use client";

import type { AdminReport } from "@/hooks/useAdminReports";
import AdminReportCard from "@/components/admin/AdminReportCard";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

type StatusFilter =
    | "all"
    | "pending"
    | "reviewed"
    | "dismissed"
    | "action_taken";

type SortOrder = "newest" | "oldest";

interface AdminReportsListProps {
    reports: AdminReport[];
    loading: boolean;
    error: string;
    statusFilter: StatusFilter;
    onStatusFilterChange: (status: StatusFilter) => void;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    sortOrder: SortOrder;
    onSortChange: (value: SortOrder) => void;
    currentPage: number;
    totalPages: number;
    totalCount: number;
    updatingId: number | null;
    onPageChange: (page: number) => void;
    onChangeStatus: (
        id: number,
        status: "reviewed" | "dismissed"
    ) => void;
    onRemoveComment: (id: number) => void;
}

export default function AdminReportsList({
    reports,
    loading,
    error,
    statusFilter,
    onStatusFilterChange,
    searchTerm,
    onSearchChange,
    sortOrder,
    onSortChange,
    currentPage,
    totalPages,
    totalCount,
    updatingId,
    onPageChange,
    onChangeStatus,
    onRemoveComment,
}: AdminReportsListProps) {
    const { language, isPersian } = useLanguage();
    const t = translations[language].admin;

    const filters: { label: string; value: StatusFilter }[] = [
        { label: t.allReports, value: "all" },
        { label: t.pending, value: "pending" },
        { label: t.reviewed, value: "reviewed" },
        { label: t.dismissed, value: "dismissed" },
        { label: t.actionTaken, value: "action_taken" },
    ];

    return (
        <section
            dir={isPersian ? "rtl" : "ltr"}
            className="rounded-xl border border-gray-200 bg-white p-5 dark:border-[#303030] dark:bg-[#181818] sm:p-6"
        >
            <div className="mb-6">
                <h2 className="text-xl font-semibold">
                    {t.commentReports}
                </h2>

                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {t.reviewDescription}
                </p>
            </div>

            <input
                type="search"
                dir={isPersian && !searchTerm ? "rtl" : "auto"}
                value={searchTerm}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder={t.searchPlaceholder}
                aria-label={t.searchLabel}
                className={`mb-5 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] dark:border-[#444444] dark:bg-[#181818] dark:text-white ${
                    isPersian && !searchTerm ? "text-right" : "text-left"
                }`}
            />

            <div className="mb-6 flex flex-wrap gap-2">
                {filters.map((filter) => (
                    <button
                        key={filter.value}
                        type="button"
                        onClick={() => onStatusFilterChange(filter.value)}
                        aria-pressed={statusFilter === filter.value}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                            statusFilter === filter.value
                                ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
                                : "border border-gray-300 hover:bg-gray-100 dark:border-[#444444] dark:hover:bg-[#252525]"
                        }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <label
                    htmlFor="report-sort"
                    className="text-sm font-medium"
                >
                    {t.sortByDate}
                </label>

                <select
                    id="report-sort"
                    value={sortOrder}
                    onChange={(event) =>
                        onSortChange(event.target.value as SortOrder)
                    }
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-[#444444] dark:bg-[#181818] dark:text-white"
                >
                    <option value="newest">{t.newest}</option>
                    <option value="oldest">{t.oldest}</option>
                </select>
            </div>

            {loading ? (
                <p className="py-8 text-center text-gray-500">
                    {t.loadingReports}
                </p>
            ) : error ? (
                <div
                    role="alert"
                    dir="auto"
                    className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400"
                >
                    {error}
                </div>
            ) : reports.length === 0 ? (
                <p className="py-8 text-center text-gray-500 dark:text-gray-400">
                    {t.noReports}
                </p>
            ) : (
                <div className="space-y-5">
                    {reports.map((report) => (
                        <AdminReportCard
                            key={report.id}
                            report={report}
                            updating={updatingId === report.id}
                            onChangeStatus={onChangeStatus}
                            onRemoveComment={onRemoveComment}
                        />
                    ))}
                </div>
            )}

            {!loading && !error && totalCount > 0 && (
                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-5 dark:border-[#303030]">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t.page}{" "}
                        {currentPage.toLocaleString(
                            isPersian ? "fa-IR" : "en-US"
                        )}{" "}
                        {t.of}{" "}
                        {totalPages.toLocaleString(
                            isPersian ? "fa-IR" : "en-US"
                        )}{" "}
                        ·{" "}
                        {totalCount.toLocaleString(
                            isPersian ? "fa-IR" : "en-US"
                        )}{" "}
                        {t.reports}
                    </p>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            disabled={currentPage <= 1 || loading}
                            onClick={() => onPageChange(currentPage - 1)}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#444444] dark:hover:bg-[#252525]"
                        >
                            {t.previous}
                        </button>

                        <button
                            type="button"
                            disabled={currentPage >= totalPages || loading}
                            onClick={() => onPageChange(currentPage + 1)}
                            className="accent-button rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {t.next}
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}