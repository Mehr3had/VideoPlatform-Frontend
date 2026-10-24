"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API, apiFetch } from "@/lib/api";

export interface AdminReport {
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
}

interface ReportsResponse {
    reports: AdminReport[];
    pending_count: number;
    reviewed_count: number;
    dismissed_count: number;
    action_taken_count: number;
    total_count: number;
    total_pages: number;
    current_page: number;
    detail?: string;
    error?: string;
}

type ReportStatus = "reviewed" | "dismissed";
type StatusFilter =
    | "all"
    | "pending"
    | "reviewed"
    | "dismissed"
    | "action_taken";
type SortOrder = "newest" | "oldest";

export default function useAdminReports() {
    const router = useRouter();

    const [checking, setChecking] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [reports, setReports] = useState<AdminReport[]>([]);
    const [pendingCount, setPendingCount] = useState(0);
    const [reviewedCount, setReviewedCount] = useState(0);
    const [dismissedCount, setDismissedCount] = useState(0);
    const [actionTakenCount, setActionTakenCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [reportsLoading, setReportsLoading] = useState(true);
    const [reportsError, setReportsError] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    useEffect(() => {
        let cancelled = false;

        const checkAdmin = async () => {
            if (!localStorage.getItem("accessToken")) {
                router.replace("/login");
                return;
            }

            try {
                const response = await apiFetch(`${API}/me/`);

                if (!response.ok) {
                    router.replace("/login");
                    return;
                }

                const data = await response.json();

                if (data.is_admin !== true) {
                    router.replace("/");
                    return;
                }

                if (!cancelled) setIsAdmin(true);
            } catch (error) {
                console.error("Admin verification error:", error);
                router.replace("/");
            } finally {
                if (!cancelled) setChecking(false);
            }
        };

        checkAdmin();

        return () => {
            cancelled = true;
        };
    }, [router]);

    const loadReports = useCallback(async () => {
        if (!isAdmin) return;

        if (!localStorage.getItem("accessToken")) {
            setReportsError("Please log in again.");
            setReportsLoading(false);
            router.replace("/login");
            return;
        }

        setReportsLoading(true);
        setReportsError("");

        try {
            const params = new URLSearchParams({
                page: String(currentPage),
                page_size: "10",
                status: statusFilter,
                search: searchTerm.trim(),
                ordering: sortOrder,
            });

            const response = await apiFetch(
                `${API}/admin/reports/?${params.toString()}`
            );
            const data: ReportsResponse = await response.json();

            if (response.status === 401) {
                router.replace("/login");
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.detail || data.error || "Failed to load reports."
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
        } catch (error) {
            console.error("Fetch admin reports error:", error);
            setReportsError(
                error instanceof Error
                    ? error.message
                    : "Something went wrong."
            );
        } finally {
            setReportsLoading(false);
        }
    }, [
        isAdmin,
        currentPage,
        statusFilter,
        searchTerm,
        sortOrder,
        router,
    ]);

    useEffect(() => {
        loadReports();
    }, [loadReports]);

    const changeStatus = async (
        reportId: number,
        newStatus: ReportStatus
    ) => {
        if (updatingId !== null) return;

        if (!localStorage.getItem("accessToken")) {
            router.replace("/login");
            return;
        }

        const previous = reports.find((report) => report.id === reportId);
        if (!previous || previous.status === newStatus) return;

        setUpdatingId(reportId);
        setReportsError("");

        try {
            const response = await apiFetch(
                `${API}/admin/reports/${reportId}/`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: newStatus }),
                }
            );

            const data = await response.json();

            if (response.status === 401) {
                router.replace("/login");
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.detail || data.error || "Failed to update report."
                );
            }

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

            if (previous.status === "pending") {
                setPendingCount((count) => Math.max(0, count - 1));
            }

            if (newStatus === "reviewed") {
                setReviewedCount((count) =>
                    count + (previous.status === "reviewed" ? 0 : 1)
                );
            } else {
                setDismissedCount((count) =>
                    count + (previous.status === "dismissed" ? 0 : 1)
                );
            }

            await loadReports();
        } catch (error) {
            console.error("Update report status error:", error);
            setReportsError(
                error instanceof Error
                    ? error.message
                    : "Something went wrong."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const removeComment = async (reportId: number) => {
        if (updatingId !== null) return;

        const previous = reports.find((report) => report.id === reportId);
        if (!previous || previous.comment_is_removed) return;

        if (
            !window.confirm(
                "Are you sure you want to remove this comment?"
            )
        ) {
            return;
        }

        if (!localStorage.getItem("accessToken")) {
            router.replace("/login");
            return;
        }

        setUpdatingId(reportId);
        setReportsError("");

        try {
            const response = await apiFetch(
                `${API}/admin/reports/${reportId}/remove-comment/`,
                { method: "POST" }
            );

            const data = await response.json();

            if (response.status === 401) {
                router.replace("/login");
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.detail || data.error || "Failed to remove comment."
                );
            }

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

            if (previous.status === "pending") {
                setPendingCount((count) => Math.max(0, count - 1));
            }

            if (data.status === "action_taken") {
                setActionTakenCount((count) => count + 1);
            }

            await loadReports();
        } catch (error) {
            console.error("Remove reported comment error:", error);
            setReportsError(
                error instanceof Error
                    ? error.message
                    : "Something went wrong."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    return {
        checking,
        isAdmin,
        reports,
        pendingCount,
        reviewedCount,
        dismissedCount,
        actionTakenCount,
        totalCount,
        reportsLoading,
        reportsError,
        statusFilter,
        setStatusFilter,
        searchTerm,
        setSearchTerm,
        sortOrder,
        setSortOrder,
        currentPage,
        setCurrentPage,
        totalPages,
        updatingId,
        changeStatus,
        removeComment,
    };
}