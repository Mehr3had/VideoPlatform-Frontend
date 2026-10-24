"use client";

import Link from "next/link";
import useNotifications from "@/hooks/useNotifications";
import NotificationItem from "@/components/notifications/NotificationItem";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

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

                    <Link
                        href="/"
                        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-800"
                    >
                        <span aria-hidden="true">
                            {isPersian ? "→" : "←"}
                        </span>
                        {t.backHome}
                    </Link>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <span className="whitespace-nowrap rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 dark:bg-red-950/50 dark:text-red-400">
                        {unreadCount} {t.unread}
                    </span>

                    {unreadCount > 0 && (
                        <button
                            type="button"
                            onClick={markAllAsRead}
                            disabled={updatingId !== null}
                            className="whitespace-nowrap rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-800 disabled:opacity-50"
                        >
                            {updatingId === -1
                                ? t.updating
                                : t.markAllRead}
                        </button>
                    )}

                    {notifications.length > 0 && (
                        <button
                            type="button"
                            onClick={deleteAllNotifications}
                            disabled={updatingId !== null}
                            className="whitespace-nowrap rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/50"
                        >
                            {updatingId === -1 ? t.updating : t.deleteAll}
                        </button>
                    )}
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
                        className="mx-2 font-semibold underline"
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
                <div className="space-y-3">
                    {notifications.map((notification) => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            updatingId={updatingId}
                            onMarkAsRead={markAsRead}
                            onDelete={deleteNotification}
                        />
                    ))}
                </div>
            )}
        </main>
    );
}