"use client";

import Link from "next/link";
import useNotifications from "@/hooks/useNotifications";
import NotificationItem from "@/components/notifications/NotificationItem";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";
import { useState } from "react";
import ConfirmDialog from "./success/page";

type DeleteAction =
    | { type: "one"; id: number }
    | { type: "all" };
export default function NotificationsPage() {
    const {
        notifications,
        loading,
        error,
        updatingId,
        loadNotifications,
        markAsRead,
        markAllAsRead,
        deleteAllNotifications,
        deleteNotification,
    } = useNotifications();

    const { language, isPersian } = useLanguage();
    const t = translations[language].notifications;
    const [deleteAction, setDeleteAction] =
        useState<DeleteAction | null>(null);
    const handleConfirmDelete = async () => {
        const action = deleteAction;

        if (!action) return;

        try {
            if (action.type === "all") {
                await deleteAllNotifications();
            } else {
                await deleteNotification(action.id);
            }
        } finally {
            setDeleteAction(null);
        }
    };

    if (loading) {
        return (
            <main
                dir={isPersian ? "rtl" : "ltr"}
                className="mx-auto min-h-screen w-full max-w-4xl bg-gray-100 px-6 py-12 dark:bg-[#0f0f0f]"
            >
                <p className="text-gray-500 dark:text-gray-400">
                    {t.loading}
                </p>
            </main>
        );
    }

    const unreadCount = notifications.filter(
        (notification) => !notification.is_read
    ).length;

    return (
        <main
            dir={isPersian ? "rtl" : "ltr"}
            className="mx-auto min-h-screen w-full max-w-4xl bg-gray-100 px-4 py-10 dark:bg-[#0f0f0f] sm:px-6"
        >
            <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {t.title}
                    </h1>

                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {t.subtitle}
                    </p>


                </div>

                <div className="flex w-full min-w-0 flex-nowrap items-center gap-0.5 sm:w-auto sm:flex-wrap sm:gap-3 lg:flex-nowrap">
                    <span role="status" aria-label={`${unreadCount} ${t.unread}`} title={`${unreadCount} ${t.unread}`} className="shrink-0 whitespace-nowrap rounded-full bg-[var(--accent)]/10 px-2 py-[7px] text-[12px] font-semibold text-[var(--accent)] sm:px-4 sm:py-2 sm:text-sm">
                        {unreadCount} {t.unread}
                    </span>

                    {unreadCount > 0 && (
                        <button
                            type="button"
                            onClick={markAllAsRead}
                            disabled={updatingId !== null}
                            aria-label={updatingId === -1 ? t.updating : t.markAllRead} title={updatingId === -1 ? t.updating : t.markAllRead} className="accent-button shrink-0 whitespace-nowrap rounded-lg px-2 py-[7px] text-[12px] font-medium transition disabled:opacity-50 sm:px-4 sm:py-2 sm:text-sm"
                        >
                            {updatingId === -1 ? (
                                <span aria-hidden="true">…</span>
                            ) : (
                                <>
                                    {t.markAllRead}
                                </>
                            )}
                        </button>
                    )}

                    {notifications.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setDeleteAction({ type: "all" })}
                            disabled={updatingId !== null}
                            aria-label={updatingId === -1 ? t.updating : t.deleteAll} title={updatingId === -1 ? t.updating : t.deleteAll} className="shrink-0 whitespace-nowrap rounded-lg border border-red-200 px-2 py-[7px] text-[12px] font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/50 sm:px-4 sm:py-2 sm:text-sm"
                        >
                            {updatingId === -1 ? (
                                <span aria-hidden="true">…</span>
                            ) : (
                                <>
                                    {t.deleteAll}
                                </>
                            )}
                        </button>
                    )}
                            <Link
                                href="/"
                                aria-label={t.backHome}
                                className={`inline-flex h-9 w-9 shrink-0 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-lg font-semibold text-gray-700 shadow-sm transition-colors duration-150 hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] active:border-[var(--accent)] active:bg-[var(--accent)]/20 active:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30 dark:border-[#404040] dark:bg-[#202020] dark:text-gray-200 dark:hover:border-[var(--accent)] dark:hover:text-[var(--accent)] dark:active:border-[var(--accent)] dark:active:text-[var(--accent)] ${isPersian ? "ms-37 sm:ms-0" : "ms-24 sm:ms-0"}`}
                            >
                                <span aria-hidden="true">
                                    {isPersian ? "←" : "→"}
                                </span>

                            </Link>
                </div>
            </div>


            {error && (
                <div
                    role="alert"
                    className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                >
                    {error}

                    {[
                        t.loginRequired,
                        t.sessionExpired,
                        t.loginToContinue,
                    ].includes(error) && (
                        <Link
                            href="/login"
                            className="mx-2 font-semibold underline"
                        >
                            {t.login}
                        </Link>
                    )}

                    <button
                        type="button"
                        onClick={loadNotifications}
                        className="mt-2 inline-block text-sm font-medium text-[var(--accent)] hover:underline"
                    >
                        {t.retry}
                    </button>
                </div>
            )}

            {notifications.length === 0 && !error ? (
                <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center dark:border-[#303030] dark:bg-[#181818]">
                    <div className="mb-4 text-5xl">🔔</div>

                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {t.emptyTitle}
                    </h2>

                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                        {t.emptyDescription}
                    </p>
                </div>
            ) : (
                <div className="space-y-2 sm:space-y-3">
                    {notifications.map((notification) => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            updatingId={updatingId}
                            onMarkAsRead={markAsRead}
                            onDelete={(id) =>
                                setDeleteAction({ type: "one", id })
                            }
                        />
                    ))}
                </div>
            )}
            <ConfirmDialog
                isOpen={deleteAction !== null}
                title={
                    deleteAction?.type === "all"
                        ? isPersian
                            ? "حذف همه اعلان‌ها؟"
                            : "Delete all notifications?"
                        : isPersian
                            ? "حذف این اعلان؟"
                            : "Delete this notification?"
                }
                message={
                    deleteAction?.type === "all"
                        ? t.confirmDeleteAll
                        : t.confirmDeleteOne
                }
                confirmLabel={
                    deleteAction?.type === "all"
                        ? t.deleteAll
                        : t.delete
                }
                cancelLabel={isPersian ? "انصراف" : "Cancel"}
                loadingLabel={t.deleting}
                isLoading={
                    deleteAction?.type === "all"
                        ? updatingId === -1
                        : deleteAction
                            ? updatingId === deleteAction.id
                            : false
                }
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteAction(null)}
            />
        </main>
    );
}