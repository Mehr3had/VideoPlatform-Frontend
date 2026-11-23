"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
    API,
    apiFetch,
    ensureAccessToken,
    clearAccessToken,
} from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

interface LiveChatReport {
    id: number;
    live_id: number;
    live_title: string;
    channel_username: string;
    message_id: number;
    message_author: string;
    message_text: string;
    message_is_removed: boolean;
    reporter: string;
    reason: string;
    reason_display: string;
    details: string;
    status: string;
    status_display: string;
    created_at: string;
    reviewed_at: string | null;
}

interface ReportsResponse {
    reports: LiveChatReport[];
    pending_count: number;
    reviewed_count: number;
    dismissed_count: number;
    action_taken_count: number;
    total_count: number;
    total_pages: number;
    current_page: number;
    error?: string;
}

type StatusFilter =
    | "all"
    | "pending"
    | "reviewed"
    | "dismissed"
    | "action_taken";

type SortOrder = "newest" | "oldest";

interface LiveChatReportsListProps {
    isAdmin: boolean;
}

export default function LiveChatReportsList({
    isAdmin,
}: LiveChatReportsListProps) {
    const { isPersian } = useLanguage();
    const t = translations[isPersian ? "fa" : "en"].admin;

    const [reports, setReports] = useState<LiveChatReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [statusFilter, setStatusFilter] =
        useState<StatusFilter>("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const [pendingCount, setPendingCount] = useState(0);
    const [reviewedCount, setReviewedCount] = useState(0);
    const [dismissedCount, setDismissedCount] = useState(0);
    const [actionTakenCount, setActionTakenCount] = useState(0);

    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const requestIdRef = useRef(0);

    const loadReports = useCallback(async () => {
        if (!isAdmin) return;

        const requestId = ++requestIdRef.current;

        setLoading(true);
        setError("");

        try {
            const token = await ensureAccessToken();

            if (!token) {
                throw new Error(
                    isPersian
                        ? "لطفاً دوباره وارد حساب کاربری شو."
                        : "Please log in again."
                );
            }

            const params = new URLSearchParams({
                page: String(currentPage),
                page_size: "10",
                status: statusFilter,
                search: searchTerm.trim(),
                ordering: sortOrder,
            });

            const response = await apiFetch(
                `${API}/admin/live-chat-reports/?${params.toString()}`
            );

            const data: ReportsResponse = await response.json();

            if (requestId !== requestIdRef.current) return;

            if (response.status === 401) {
                clearAccessToken();
                throw new Error(
                    isPersian
                        ? "نشست شما منقضی شده است."
                        : "Your session has expired."
                );
            }

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    (isPersian
                        ? "دریافت گزارش‌های پیام ناموفق بود."
                        : "Failed to load chat reports.")
                );
            }

            setReports(data.reports);
            setPendingCount(data.pending_count);
            setReviewedCount(data.reviewed_count);
            setDismissedCount(data.dismissed_count);
            setActionTakenCount(data.action_taken_count);
            setTotalCount(data.total_count);
            setTotalPages(data.total_pages);
            setCurrentPage(data.current_page);
        } catch (requestError) {
            if (requestId !== requestIdRef.current) return;

            setError(
                requestError instanceof Error
                    ? requestError.message
                    : isPersian
                        ? "خطایی رخ داد."
                        : "Something went wrong."
            );
        } finally {
            if (requestId === requestIdRef.current) {
                setLoading(false);
            }
        }
    }, [
        isAdmin,
        currentPage,
        statusFilter,
        searchTerm,
        sortOrder,
        isPersian,
    ]);

    useEffect(() => {
        void loadReports();

        return () => {
            requestIdRef.current += 1;
        };
    }, [loadReports]);

    const changeStatus = async (
        reportId: number,
        newStatus: "reviewed" | "dismissed"
    ) => {
        if (updatingId !== null) return;

        setUpdatingId(reportId);
        setError("");

        try {
            const token = await ensureAccessToken();

            if (!token) {
                clearAccessToken();
                throw new Error(
                    isPersian
                        ? "لطفاً دوباره وارد حساب کاربری شو."
                        : "Please log in again."
                );
            }

            const response = await apiFetch(
                `${API}/admin/live-chat-reports/${reportId}/`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ status: newStatus }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    (isPersian
                        ? "تغییر وضعیت گزارش ناموفق بود."
                        : "Failed to update report.")
                );
            }

            await loadReports();
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : "Something went wrong."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const removeMessage = async (report: LiveChatReport) => {
        if (updatingId !== null || report.message_is_removed) return;

        const confirmed = window.confirm(
            isPersian
                ? "از حذف این پیام از چت زنده مطمئنی؟ سابقه گزارش حفظ می‌شود."
                : "Remove this message from live chat? The report history will be preserved."
        );

        if (!confirmed) return;

        setUpdatingId(report.id);
        setError("");

        try {
            const token = await ensureAccessToken();

            if (!token) {
                clearAccessToken();
                throw new Error(
                    isPersian
                        ? "لطفاً دوباره وارد حساب کاربری شو."
                        : "Please log in again."
                );
            }

            const response = await apiFetch(
                `${API}/admin/live-chat-reports/${report.id}/remove-message/`,
                { method: "POST" }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    (isPersian
                        ? "حذف پیام ناموفق بود."
                        : "Failed to remove message.")
                );
            }

            await loadReports();
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : "Something went wrong."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const filters: {
        label: string;
        value: StatusFilter;
        count: number;
    }[] = [
        { label: t.allReports, value: "all", count: totalCount },
        { label: t.pending, value: "pending", count: pendingCount },
        { label: t.reviewed, value: "reviewed", count: reviewedCount },
        { label: t.dismissed, value: "dismissed", count: dismissedCount },
        { label: t.actionTaken, value: "action_taken", count: actionTakenCount },
    ];

    const statusLabels: Record<string, string> = {
        pending: t.pending,
        reviewed: t.reviewed,
        dismissed: t.dismissed,
        action_taken: t.actionTaken,
    };

    const formatNumber = (value: number) =>
        value.toLocaleString(isPersian ? "fa-IR" : "en-US");

    const formatDate = (value: string) =>
        new Date(value).toLocaleString(isPersian ? "fa-IR" : "en-US");

    return (
        <section
            dir={isPersian ? "rtl" : "ltr"}
            className="mt-6 rounded-xl border border-gray-200 bg-white p-3 dark:border-[#303030] dark:bg-[#181818] sm:mt-8 sm:p-6"
        >
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-semibold">
                        {isPersian
                            ? "گزارش پیام‌های چت زنده"
                            : "Live chat message reports"}
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {isPersian
                            ? "گزارش پیام‌های کاربران را بررسی و مدیریت کن."
                            : "Review and manage reported live chat messages."}
                    </p>
                </div>

                <span className="rounded-full bg-red-100 px-3 py-1.5 text-sm font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">
                    {isPersian ? "در انتظار بررسی: " : "Pending: "}
                    {formatNumber(pendingCount)}
                </span>
            </div>

            <input
                type="search"
                value={searchTerm}
                onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setCurrentPage(1);
                }}
                placeholder={
                    isPersian
                        ? "جست‌وجوی پیام، نام کاربر یا عنوان لایو..."
                        : "Search message, user or live title..."
                }
                className="mb-5 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] dark:border-[#444444] dark:bg-[#181818] dark:text-white"
            />

            <div className="mb-6 flex flex-wrap gap-2">
                {filters.map((filter) => (
                    <button
                        key={filter.value}
                        type="button"
                        onClick={() => {
                            setStatusFilter(filter.value);
                            setCurrentPage(1);
                        }}
                        aria-pressed={statusFilter === filter.value}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                            statusFilter === filter.value
                                ? "bg-[var(--accent)] text-white"
                                : "border border-gray-300 hover:bg-gray-100 dark:border-[#444444] dark:hover:bg-[#252525]"
                        }`}
                    >
                        {filter.label} ({formatNumber(filter.count)})
                    </button>
                ))}
            </div>

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <label
                    htmlFor="live-chat-report-sort"
                    className="text-sm font-medium"
                >
                    {t.sortByDate}
                </label>

                <select
                    id="live-chat-report-sort"
                    value={sortOrder}
                    onChange={(event) => {
                        setSortOrder(event.target.value as SortOrder);
                        setCurrentPage(1);
                    }}
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
                    className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400"
                >
                    {error}
                    <button
                        type="button"
                        onClick={() => void loadReports()}
                        className="ms-3 font-semibold underline"
                    >
                        {isPersian ? "تلاش دوباره" : "Retry"}
                    </button>
                </div>
            ) : reports.length === 0 ? (
                <p className="py-8 text-center text-gray-500 dark:text-gray-400">
                    {isPersian
                        ? "گزارشی برای نمایش وجود ندارد."
                        : "No chat message reports found."}
                </p>
            ) : (
                <div className="space-y-3 sm:space-y-5">
                    {reports.map((report) => {
                        const statusStyle =
                            report.status === "pending"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
                                : report.status === "action_taken"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

                        return (
                            <article
                                key={report.id}
                                className="mx-0.5 rounded-lg border border-gray-200 p-3 dark:border-[#303030] sm:mx-0 sm:rounded-xl sm:p-5"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                                    <h3 className="font-semibold">
                                        {isPersian ? "گزارش" : "Report"} #{formatNumber(report.id)}
                                    </h3>

                                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle}`}>
                                        {statusLabels[report.status] || report.status_display}
                                    </span>
                                </div>

                                <div className="mt-3 grid gap-2 text-xs sm:mt-4 sm:gap-3 sm:text-sm sm:grid-cols-2">
                                    <p>
                                        <span className="text-gray-500">
                                            {isPersian ? "لایو: " : "Live: "}
                                        </span>
                                        <Link
                                            href={`/live/${report.live_id}`}
                                            className="font-medium text-[var(--accent)] hover:underline"
                                        >
                                            {report.live_title}
                                        </Link>
                                    </p>

                                    <p>
                                        <span className="text-gray-500">
                                            {isPersian ? "صاحب کانال: " : "Channel: "}
                                        </span>
                                        {report.channel_username}
                                    </p>

                                    <p>
                                        <span className="text-gray-500">
                                            {isPersian ? "نویسنده پیام: " : "Message author: "}
                                        </span>
                                        {report.message_author}
                                    </p>

                                    <p>
                                        <span className="text-gray-500">
                                            {isPersian ? "گزارش‌دهنده: " : "Reported by: "}
                                        </span>
                                        {report.reporter}
                                    </p>

                                    <p>
                                        <span className="text-gray-500">
                                            {t.reason}:{" "}
                                        </span>
                                        {report.reason_display}
                                    </p>

                                    <p>
                                        <span className="text-gray-500">
                                            {isPersian ? "شناسه پیام: " : "Message ID: "}
                                        </span>
                                        {formatNumber(report.message_id)}
                                    </p>
                                </div>

                                <div className="mt-3 sm:mt-4">
                                    <p className="text-sm font-medium">
                                        {isPersian ? "متن پیام گزارش‌شده" : "Reported message"}
                                    </p>
                                    <p className="mt-1.5 whitespace-pre-wrap break-words rounded-lg bg-gray-50 p-3 text-xs dark:bg-[#222222] sm:mt-2 sm:p-4 sm:text-sm">
                                        {report.message_text}
                                    </p>

                                    {report.message_is_removed && (
                                        <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                                            {isPersian
                                                ? "این پیام قبلاً از چت حذف شده است."
                                                : "This message has already been removed."}
                                        </p>
                                    )}
                                </div>

                                {report.details && (
                                    <div className="mt-3 sm:mt-4">
                                        <p className="text-sm font-medium">
                                            {t.additionalDetails}
                                        </p>
                                        <p className="mt-1.5 whitespace-pre-wrap break-words text-xs text-gray-600 dark:text-gray-300 sm:mt-2 sm:text-sm">
                                            {report.details}
                                        </p>
                                    </div>
                                )}

                                <p className="mt-3 text-[11px] text-gray-500 dark:text-gray-400 sm:mt-4 sm:text-xs">
                                    {t.submitted} {formatDate(report.created_at)}
                                </p>

                                {report.reviewed_at && (
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        {t.reviewedAt} {formatDate(report.reviewed_at)}
                                    </p>
                                )}

                                {report.status === "pending" && (
                                    <div className="mt-4 flex flex-wrap gap-2 sm:mt-5 sm:gap-3">
                                        <button
                                            type="button"
                                            disabled={updatingId !== null}
                                            onClick={() => void changeStatus(report.id, "reviewed")}
                                            className="accent-button rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-2 sm:text-sm"
                                        >
                                            {updatingId === report.id ? t.updating : t.markReviewed}
                                        </button>

                                        <button
                                            type="button"
                                            disabled={updatingId !== null}
                                            onClick={() => void changeStatus(report.id, "dismissed")}
                                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#444444] dark:hover:bg-[#252525] sm:px-4 sm:py-2 sm:text-sm"
                                        >
                                            {t.dismissReport}
                                        </button>

                                        {!report.message_is_removed && (
                                            <button
                                                type="button"
                                                disabled={updatingId !== null}
                                                onClick={() => void removeMessage(report)}
                                                className="rounded-lg bg-red-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-2 sm:text-sm"
                                            >
                                                {isPersian ? "حذف پیام از چت" : "Remove message"}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}

            {!loading && !error && totalCount > 0 && (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 pt-4 dark:border-[#303030] sm:mt-8 sm:gap-4 sm:pt-5">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t.page} {formatNumber(currentPage)} {t.of}{" "}
                        {formatNumber(totalPages)} · {formatNumber(totalCount)} {t.reports}
                    </p>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            disabled={currentPage <= 1 || loading}
                            onClick={() => setCurrentPage((page) => page - 1)}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#444444] dark:hover:bg-[#252525]"
                        >
                            {t.previous}
                        </button>

                        <button
                            type="button"
                            disabled={currentPage >= totalPages || loading}
                            onClick={() => setCurrentPage((page) => page + 1)}
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