"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API } from "@/lib/api";
import Link from "next/link";

type AdminReport = {
    id: number;
    comment_id: number;
    comment_author: string;
    comment_text: string;
    comment_is_removed: boolean;
    reporter: string;
    reason: string;
    reason_display: string;
    details: string;
    status: string;
    status_display: string;
    created_at: string;
    reviewed_at: string | null;
};

export default function AdminPage() {
    const router = useRouter();
    const [checking, setChecking] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [reports, setReports] = useState<AdminReport[]>([]);
    const [pendingCount, setPendingCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [reportsLoading, setReportsLoading] = useState(true);
    const [reportsError, setReportsError] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [reviewedCount, setReviewedCount] = useState(0);
    const [dismissedCount, setDismissedCount] = useState(0);
    const [actionTakenCount, setActionTakenCount] = useState(0);

    useEffect(() => {
        const checkAdmin = async () => {
            const token = localStorage.getItem("accessToken");

            if (!token) {
                router.replace("/login");
                return;
            }

            try {
                const response = await fetch(`${API}/me/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    router.replace("/login");
                    return;
                }

                const data = await response.json();

                if (data.is_admin !== true) {
                    router.replace("/");
                    return;
                }

                setIsAdmin(true);
            } catch (error) {
                console.error("Admin verification error:", error);
                router.replace("/");
            } finally {
                setChecking(false);
            }
        };

        checkAdmin();
    }, [router]);

    useEffect(() => {
        if (!isAdmin) return;

        let cancelled = false;

        const fetchReports = async () => {
            const token = localStorage.getItem("accessToken");

            if (!token) {
                setReportsError("Please log in again.");
                setReportsLoading(false);
                return;
            }

            setReportsLoading(true);

            try {
                setReportsError("");

                const params = new URLSearchParams({
                    page: String(currentPage),
                    page_size: "10",
                    status: statusFilter,
                    search: searchTerm.trim(),
                    ordering: sortOrder,
                });

                const response = await fetch(
                    `${API}/admin/reports/?${params.toString()}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.detail ||
                        data.error ||
                        "Failed to load reports."
                    );
                }

                if (cancelled) return;

                setReports(data.reports);
                setPendingCount(data.pending_count);
                setReviewedCount(data.reviewed_count);
                setDismissedCount(data.dismissed_count);
                setActionTakenCount(data.action_taken_count);
                setTotalCount(data.total_count);
                setTotalPages(data.total_pages);
                setCurrentPage(data.current_page);
            } catch (error) {
                if (cancelled) return;

                console.error("Fetch admin reports error:", error);

                setReportsError(
                    error instanceof Error
                        ? error.message
                        : "Something went wrong."
                );
            } finally {
                if (!cancelled) {
                    setReportsLoading(false);
                }
            }
        };

        fetchReports();

        return () => {
            cancelled = true;
        };
    }, [
        isAdmin,
        currentPage,
        statusFilter,
        searchTerm,
        sortOrder,
    ]);

    const updateReportStatus = async (
        reportId: number,
        newStatus: "reviewed" | "dismissed"
    ) => {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            setReportsError("Please log in again.");
            return;
        }

        try {
            setReportsError("");

            const response = await fetch(
                `${API}/admin/reports/${reportId}/`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        status: newStatus,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    data.error ||
                    "Failed to update report."
                );
            }

            const previousReport = reports.find(
                (report) => report.id === reportId
            );

            setReports((current) =>
                current.map((report) =>
                    report.id === reportId
                        ? {
                            ...report,
                            status: data.status,
                            status_display: data.status_display,
                            reviewed_at: data.reviewed_at,
                        }
                        : report
                )
            );

            if (
                previousReport?.status === "pending" &&
                data.status !== "pending"
            ) {
                setPendingCount((count) => Math.max(0, count - 1));
            }
        } catch (error) {
            console.error("Update report status error:", error);

            setReportsError(
                error instanceof Error
                    ? error.message
                    : "Something went wrong."
            );
        }
    };

    const removeReportedComment = async (reportId: number) => {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            setReportsError("Please log in again.");
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to remove this comment?"
        );

        if (!confirmed) return;

        try {
            setReportsError("");

            const response = await fetch(
                `${API}/admin/reports/${reportId}/remove-comment/`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    data.error ||
                    "Failed to remove comment."
                );
            }

            const previousReport = reports.find(
                (report) => report.id === reportId
            );

            setReports((current) =>
                current.map((report) =>
                    report.id === reportId
                        ? {
                            ...report,
                            comment_text: data.comment_text,
                            comment_is_removed: true,
                            status: data.status,
                            status_display: data.status_display,
                            reviewed_at: data.reviewed_at,
                        }
                        : report
                )
            );

            if (previousReport?.status === "pending") {
                setPendingCount((count) => Math.max(0, count - 1));
            }
        } catch (error) {
            console.error("Remove reported comment error:", error);

            setReportsError(
                error instanceof Error
                    ? error.message
                    : "Something went wrong."
            );
        }
    };
    
    if (checking || !isAdmin) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-[#0f0f0f]">
                <p className="text-gray-600 dark:text-gray-300">
                    Verifying admin access...
                </p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-100 text-gray-900 dark:bg-[#0f0f0f] dark:text-gray-100">
            <header className="border-b border-gray-200 bg-white px-8 py-6 dark:border-[#303030] dark:bg-[#181818]">
                <div className="mx-auto max-w-7xl">
                    <p className="text-sm font-medium text-red-700">
                        VIDEOPLATFORM / ADMINISTRATION
                    </p>

                    <h1 className="mt-2 text-3xl font-bold">
                        Admin Panel
                    </h1>

                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Manage reports and keep the community safe.
                    </p>
                </div>

                <div className="mt-5">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
                    >
                        <span aria-hidden="true">←</span>
                        Back to Home
                    </Link>
                </div>
            </header>

            <section className="mx-auto max-w-7xl px-6 py-10">
                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-[#303030] dark:bg-[#181818]">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Pending Reports
                        </p>

                        <p className="mt-3 text-3xl font-bold text-red-600">
                            {pendingCount}
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-[#303030] dark:bg-[#181818]">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Total Reports
                        </p>

                        <p className="mt-3 text-3xl font-bold">
                            {totalCount}
                        </p>
                    </div>
                </div>

                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    {[
                        {
                            title: "All Reports",
                            count: totalCount,
                            color: "border-red-500",
                            textColor: "text-red-600 dark:text-red-400",
                        },
                        {
                            title: "Pending",
                            count: pendingCount,
                            color: "border-amber-500",
                            textColor: "text-amber-600 dark:text-amber-400",
                        },
                        {
                            title: "Reviewed",
                            count: reviewedCount,
                            color: "border-blue-500",
                            textColor: "text-blue-600 dark:text-blue-400",
                        },
                        {
                            title: "Dismissed",
                            count: dismissedCount,
                            color: "border-gray-400",
                            textColor: "text-gray-600 dark:text-gray-300",
                        },
                        {
                            title: "Action Taken",
                            count: actionTakenCount,
                            color: "border-red-600",
                            textColor: "text-red-600 dark:text-red-400",
                        },
                    ].map((item) => (
                        <button
                            key={item.title}
                            type="button"
                            onClick={() => {
                                const statusMap: Record<string, string> = {
                                    "All Reports": "all",
                                    Pending: "pending",
                                    Reviewed: "reviewed",
                                    Dismissed: "dismissed",
                                    "Action Taken": "action_taken",
                                };

                                setStatusFilter(statusMap[item.title]);
                                setCurrentPage(1);
                            }}
                            className={`w-full rounded-xl border border-gray-200 border-l-4 ${item.color} p-5 text-left shadow-sm transition hover:bg-gray-50 dark:border-[#303030] dark:hover:bg-[#222222] ${
                            statusFilter ===
                                ({
                                    "All Reports": "all",
                                    Pending: "pending",
                                    Reviewed: "reviewed",
                                    Dismissed: "dismissed",
                                    "Action Taken": "action_taken",
                                } as Record<string, string>)[item.title]
                                    ? "ring-2 ring-red-500"
                                    : ""
                            }`}
                        >
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {item.title}
                            </p>

                            <p className={`mt-3 text-3xl font-bold ${item.textColor}`}>
                                {item.count}
                            </p>
                        </button>
                    ))}
                </div>

                <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-[#303030] dark:bg-[#181818]">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold">
                            Comment Reports
                        </h2>

                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Review reports submitted by users.
                        </p>
                    </div>

                    <div className="mb-5">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) => {
                                setSearchTerm(event.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search by username, comment, report ID..."
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-700 focus:ring-1 focus:ring-red-700 dark:border-[#444444] dark:bg-[#181818] dark:text-white"
                        />
                    </div>

                    <div className="mb-6 flex flex-wrap gap-2">
                        {[
                            { label: "All Reports", value: "all" },
                            { label: "Pending", value: "pending" },
                            { label: "Reviewed", value: "reviewed" },
                            { label: "Dismissed", value: "dismissed" },
                            { label: "Action Taken", value: "action_taken" },
                        ].map((filter) => (
                            <button
                                key={filter.value}
                                type="button"
                                onClick={() => {
                                    setStatusFilter(filter.value);
                                    setCurrentPage(1);
                                }}
                                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                                    statusFilter === filter.value
                                        ? "bg-red-700 text-white"
                                        : "border border-gray-300 hover:bg-gray-100 dark:border-[#444444] dark:hover:bg-[#252525]"
                                }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <label
                            htmlFor="report-sort"
                            className="text-sm font-medium"
                        >
                            Sort by date
                        </label>

                        <select
                            id="report-sort"
                            value={sortOrder}
                            onChange={(event) => {
                                setSortOrder(event.target.value as "newest" | "oldest");
                                setCurrentPage(1);
                            }}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-[#444444] dark:bg-[#181818] dark:text-white"
                        >
                            <option value="newest">Newest first</option>
                            <option value="oldest">Oldest first</option>
                        </select>
                    </div>

                    {reportsLoading ? (
                        <p className="py-8 text-center text-gray-500">
                            Loading reports...
                        </p>
                    ) : reportsError ? (
                        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
                            {reportsError}
                        </p>
                    ) : reports.length === 0 ? (
                        <p className="py-8 text-center text-gray-500">
                            No reports found for this filter.
                        </p>
                    ) : (
                        <div className="space-y-5">
                            {reports.map((report) => (
                                <article
                                    key={report.id}
                                    className="rounded-xl border border-gray-200 p-5 dark:border-[#303030]"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <h3 className="font-semibold">
                                            Report #{report.id}
                                        </h3>

                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                report.status === "pending"
                                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
                                                    : report.status === "action_taken"
                                                    ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                                                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                            }`}
                                        >
                                            {report.status_display}
                                        </span>
                                    </div>

                                    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                                        <p>
                                            <span className="text-gray-500">
                                                Comment author:{" "}
                                            </span>
                                            {report.comment_author}
                                        </p>

                                        <p>
                                            <span className="text-gray-500">
                                                Reported by:{" "}
                                            </span>
                                            {report.reporter}
                                        </p>

                                        <p>
                                            <span className="text-gray-500">
                                                Reason:{" "}
                                            </span>
                                            {report.reason_display}
                                        </p>

                                        <p>
                                            <span className="text-gray-500">
                                                Comment ID:{" "}
                                            </span>
                                            {report.comment_id}
                                        </p>
                                    </div>

                                    <div className="mt-4">
                                        <p className="text-sm font-medium">
                                            Reported comment
                                        </p>

                                        <p className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-gray-50 p-4 text-sm dark:bg-[#222222]">
                                            {report.comment_text}
                                        </p>

                                        {report.comment_is_removed && (
                                            <p className="mt-2 text-xs text-red-600">
                                                This comment has already been removed.
                                            </p>
                                        )}
                                    </div>

                                    {report.details && (
                                        <div className="mt-4">
                                            <p className="text-sm font-medium">
                                                Additional details
                                            </p>

                                            <p className="mt-2 whitespace-pre-wrap break-words text-sm text-gray-600 dark:text-gray-300">
                                                {report.details}
                                            </p>
                                        </div>
                                    )}

                                    <p className="mt-4 text-xs text-gray-500">
                                        Submitted:{" "}
                                        {new Date(report.created_at).toLocaleString()}
                                    </p>

                                    {report.reviewed_at && (
                                        <p className="mt-1 text-xs text-gray-500">
                                            Reviewed:{" "}
                                            {new Date(report.reviewed_at).toLocaleString()}
                                        </p>
                                    )}

                                    {report.status === "pending" && (
                                        <div className="mt-5 flex flex-wrap gap-3">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateReportStatus(report.id, "reviewed")
                                                }
                                                className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
                                            >
                                                Mark as Reviewed
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateReportStatus(report.id, "dismissed")
                                                }
                                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-100 dark:border-[#444444] dark:hover:bg-[#252525]"
                                            >
                                                Dismiss Report
                                            </button>

                                            {!report.comment_is_removed && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeReportedComment(report.id)}
                                                    className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
                                                >
                                                    Remove Comment
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </article>     
                            ))}
                        </div>
                    )}
                    {!reportsLoading && !reportsError && totalCount > 0 && (
                        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-5 dark:border-[#303030]">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Page {currentPage} of {totalPages}
                                {" · "}
                                {totalCount} reports
                            </p>

                            <div className="flex gap-2">
                               <button
                                    type="button"
                                    disabled={currentPage <= 1}
                                    onClick={() => setCurrentPage((page) => page - 1)}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#444444] dark:hover:bg-[#252525]"
                                >
                                    Previous
                                </button>

                                <button
                                    type="button"
                                    disabled={currentPage >= totalPages}
                                    onClick={() => setCurrentPage((page) => page + 1)}
                                    className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
