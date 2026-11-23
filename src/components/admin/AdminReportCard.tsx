"use client";

import type { AdminReport } from "@/hooks/useAdminReports";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

interface AdminReportCardProps {
    report: AdminReport;
    updating: boolean;
    onChangeStatus: (
        id: number,
        status: "reviewed" | "dismissed"
    ) => void;
    onRemoveComment: (id: number) => void;
}

export default function AdminReportCard({
    report,
    updating,
    onChangeStatus,
    onRemoveComment,
}: AdminReportCardProps) {
    const { language, isPersian } = useLanguage();
    const t = translations[language].admin;

    const statusLabel: Record<AdminReport["status"], string> = {
        pending: t.pending,
        reviewed: t.reviewed,
        dismissed: t.dismissed,
        action_taken: t.actionTaken,
    };

    const statusStyle =
        report.status === "pending"
            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
            : report.status === "action_taken"
              ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

    const formatDate = (date: string) =>
        new Date(date).toLocaleString(
            isPersian ? "fa-IR" : "en-US"
        );

    const formatNumber = (value: number) =>
        value.toLocaleString(isPersian ? "fa-IR" : "en-US");

    return (
        <article
            dir={isPersian ? "rtl" : "ltr"}
            className="mx-0.5 rounded-lg border border-gray-200 p-3 dark:border-[#303030] sm:mx-0 sm:rounded-xl sm:p-5"
        >
            <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                <h3 className="text-sm font-semibold sm:text-base">
                    {t.report} #{formatNumber(report.id)}
                </h3>

                <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle}`}
                >
                    {statusLabel[report.status]}
                </span>
            </div>

            <div className="mt-3 grid gap-2 text-xs sm:mt-4 sm:gap-3 sm:text-sm sm:grid-cols-2">
                <p>
                    <span className="text-gray-500">
                        {t.commentAuthor}{" "}
                    </span>
                    {report.comment_author}
                </p>

                <p>
                    <span className="text-gray-500">
                        {t.reportedBy}{" "}
                    </span>
                    {report.reporter}
                </p>

                <p>
                    <span className="text-gray-500">
                        {t.reason}{" "}
                    </span>
                    {report.reason_display}
                </p>

                <p>
                    <span className="text-gray-500">
                        {t.commentId}{" "}
                    </span>
                    {formatNumber(report.comment_id)}
                </p>
            </div>

            <div className="mt-3 sm:mt-4">
                <p className="text-sm font-medium">
                    {t.reportedComment}
                </p>

                <p
                    dir="auto"
                    className="mt-1.5 whitespace-pre-wrap break-words rounded-lg bg-gray-50 p-3 text-xs dark:bg-[#222222] sm:mt-2 sm:p-4 sm:text-sm"
                >
                    {report.comment_text}
                </p>

                {report.comment_is_removed && (
                    <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                        {t.alreadyRemoved}
                    </p>
                )}
            </div>

            {report.details && (
                <div className="mt-3 sm:mt-4">
                    <p className="text-sm font-medium">
                        {t.additionalDetails}
                    </p>

                    <p
                        dir="auto"
                        className="mt-1.5 whitespace-pre-wrap break-words text-xs text-gray-600 dark:text-gray-300 sm:mt-2 sm:text-sm"
                    >
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
                        disabled={updating}
                        onClick={() =>
                            onChangeStatus(report.id, "reviewed")
                        }
                        className="accent-button rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-2 sm:text-sm"
                    >
                        {updating ? t.updating : t.markReviewed}
                    </button>

                    <button
                        type="button"
                        disabled={updating}
                        onClick={() =>
                            onChangeStatus(report.id, "dismissed")
                        }
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#444444] dark:hover:bg-[#252525] sm:px-4 sm:py-2 sm:text-sm"
                    >
                        {t.dismissReport}
                    </button>

                    {!report.comment_is_removed && (
                        <button
                            type="button"
                            disabled={updating}
                            onClick={() => onRemoveComment(report.id)}
                            className="rounded-lg bg-red-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-2 sm:text-sm"
                        >
                            {t.removeComment}
                        </button>
                    )}
                </div>
            )}
        </article>
    );
}