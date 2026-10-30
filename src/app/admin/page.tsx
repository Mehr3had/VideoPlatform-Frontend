"use client";

import Link from "next/link";
import AdminStats from "@/components/admin/AdminStats";
import AdminReportsList from "@/components/admin/AdminReportsList";
import useAdminReports from "@/hooks/useAdminReports";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

export default function AdminPage() {
    const admin = useAdminReports();
    const { language, isPersian } = useLanguage();
    const t = translations[language].admin;

    if (admin.checking || !admin.isAdmin) {
        return (
            <main
                dir={isPersian ? "rtl" : "ltr"}
                className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-[#0f0f0f]"
            >
                <p className="text-gray-600 dark:text-gray-300">
                    {t.verifyingAccess}
                </p>
            </main>
        );
    }

    return (
        <main
            dir={isPersian ? "rtl" : "ltr"}
            className="min-h-screen bg-gray-100 text-gray-900 dark:bg-[#0f0f0f] dark:text-gray-100"
        >
            <header className="bg-gray-100 px-5 py-3 text-gray-900 dark:border-[#303030] dark:bg-[#0f0f0f] dark:text-white sm:px-8">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                    <div className="min-w-0">
                        <h1 className="text-lg font-bold sm:text-xl">
                            {t.title}
                        </h1>

                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                            {t.subtitle}
                        </p>
                    </div>

                    <Link
                        href="/"
                        className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-200 dark:hover:bg-[#303030] sm:px-5"
                    >
                        {t.backHome}
                        <span aria-hidden="true">←</span>
                    </Link>
                </div>
            </header>

            <section className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
                <AdminStats
                    totalCount={admin.totalCount}
                    pendingCount={admin.pendingCount}
                    reviewedCount={admin.reviewedCount}
                    dismissedCount={admin.dismissedCount}
                    actionTakenCount={admin.actionTakenCount}
                    statusFilter={admin.statusFilter}
                    onFilterChange={(status) => {
                        admin.setStatusFilter(status);
                        admin.setCurrentPage(1);
                    }}
                />

                <AdminReportsList
                    reports={admin.reports}
                    loading={admin.reportsLoading}
                    error={admin.reportsError}
                    statusFilter={admin.statusFilter}
                    onStatusFilterChange={(status) => {
                        admin.setStatusFilter(status);
                        admin.setCurrentPage(1);
                    }}
                    searchTerm={admin.searchTerm}
                    onSearchChange={(value) => {
                        admin.setSearchTerm(value);
                        admin.setCurrentPage(1);
                    }}
                    sortOrder={admin.sortOrder}
                    onSortChange={(value) => {
                        admin.setSortOrder(value);
                        admin.setCurrentPage(1);
                    }}
                    currentPage={admin.currentPage}
                    totalPages={admin.totalPages}
                    totalCount={admin.totalCount}
                    updatingId={admin.updatingId}
                    onPageChange={admin.setCurrentPage}
                    onChangeStatus={admin.changeStatus}
                    onRemoveComment={admin.removeComment}
                />
            </section>
        </main>
    );
}
