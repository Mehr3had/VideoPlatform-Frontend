"use client";

import Link from "next/link";
import {
    notificationIcons,
    type Notification,
} from "@/hooks/useNotifications";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

interface NotificationItemProps {
    notification: Notification;
    updatingId: number | null;
    onMarkAsRead: (id: number) => void;
    onDelete: (id: number) => void;
}

export default function NotificationItem({
    notification,
    updatingId,
    onMarkAsRead,
    onDelete,
}: NotificationItemProps) {
    const { language, isPersian } = useLanguage();
    const t = translations[language].notifications;
    const isUpdating = updatingId === notification.id;

    const formattedDate = new Date(
        notification.created_at
    ).toLocaleString(isPersian ? "fa-IR" : "en-US");

    const formattedCount = new Intl.NumberFormat(
        isPersian ? "fa-IR" : "en-US"
    ).format(notification.interaction_count);

    const sender = notification.sender;

    // استخراج متن بعد از دونقطه، مثلاً متن پاسخ به کامنت
    const messageDetail = notification.message.includes(":")
        ? notification.message.slice(
              notification.message.indexOf(":") + 1
          ).trim()
        : "";

    const getMessage = () => {
        switch (notification.type) {
            case "subscription":
                return (
                    <>
                        {sender && <bdi dir="auto">{sender}</bdi>}{" "}
                        {t.subscribed}
                    </>
                );

            case "video_like":
                if (notification.interaction_count > 1) {
                    return `${formattedCount} ${t.peopleLiked}`;
                }

                return (
                    <>
                        {sender && <bdi dir="auto">{sender}</bdi>}{" "}
                        {t.likedVideo}
                    </>
                );

            case "comment":
                return (
                    <>
                        {sender && <bdi dir="auto">{sender}</bdi>}{" "}
                        {t.commentedOnVideo}
                        {messageDetail && (
                            <span className="mt-1 block font-normal">
                                {messageDetail}
                            </span>
                        )}
                    </>
                );

            case "comment_reply":
                return (
                    <>
                        {sender && <bdi dir="auto">{sender}</bdi>}{" "}
                        {t.repliedToComment}
                        {messageDetail && (
                            <span className="mt-1 block font-normal">
                                {messageDetail}
                            </span>
                        )}
                    </>
                );

            case "comment_like":
                return (
                    <>
                        {sender && <bdi dir="auto">{sender}</bdi>}{" "}
                        {t.likedComment}
                    </>
                );

            case "new_video":
                return (
                    <>
                        {sender && <bdi dir="auto">{sender}</bdi>}{" "}
                        {t.uploadedVideo}{" "}
                        <bdi dir="auto">
                            {notification.video_title || messageDetail}
                        </bdi>
                    </>
                );

            case "milestone": {
                const match = notification.message.match(
                    /reached\s+(\d+)\s+subscribers/i
                );

                if (!match) {
                    return notification.message;
                }

                const count = new Intl.NumberFormat(
                    isPersian ? "fa-IR" : "en-US"
                ).format(Number(match[1]));

                return (
                    <>
                        {t.milestonePrefix}{" "}
                        <bdi dir="ltr">{count}</bdi>{" "}
                        {t.milestoneSuffix}
                    </>
                );
            }

            case "activity_digest": {
                const count = new Intl.NumberFormat(
                    isPersian ? "fa-IR" : "en-US"
                ).format(notification.interaction_count);

                return (
                    <>
                        {t.digestPrefix}{" "}
                        <bdi dir="ltr">{count}</bdi>{" "}
                        {t.digestSuffix}
                    </>
                );
            }

            case "milestone": {
                const match = notification.message.match(
                    /reached\s+(\d+)\s+subscribers/i
                );

                if (!match) {
                    return notification.message;
                }

                const count = new Intl.NumberFormat(
                    isPersian ? "fa-IR" : "en-US"
                ).format(Number(match[1]));

                return (
                    <>
                        {t.milestonePrefix}{" "}
                        <bdi dir="ltr">{count}</bdi>{" "}
                        {t.milestoneSuffix}
                    </>
                );
            }

            default:
                // برای اعلان‌هایی که هنوز قالبشان را نمی‌شناسیم،
                // پیام اصلی بک‌اند را بدون تغییر نمایش می‌دهیم.
                return notification.message;
        }
    };

    return (
        <article
            dir={isPersian ? "rtl" : "ltr"}
            className={`flex flex-col gap-4 rounded-xl border p-5 transition sm:flex-row sm:items-center ${
                notification.is_read
                    ? "border-gray-200 bg-white dark:border-[#303030] dark:bg-[#181818]"
                    : "border-red-200 bg-red-50/60 dark:border-red-900/70 dark:bg-red-950/20"
            }`}
        >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-2xl shadow-sm dark:bg-[#252525]">
                {notificationIcons[notification.type] ?? "🔔"}
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {getMessage()}
                </p>

                {notification.type === "video_like" &&
                    notification.interaction_count > 0 && (
                        <p className="mt-1 text-sm font-medium text-red-700 dark:text-red-400">
                            👍 {formattedCount} {t.interactions}
                        </p>
                    )}

                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    {sender && (
                        <>
                            <span>
                                {t.from}{" "}
                                <bdi dir="auto">{sender}</bdi>
                            </span>
                            <span aria-hidden="true">·</span>
                        </>
                    )}

                    <time dateTime={notification.created_at}>
                        {formattedDate}
                    </time>
                </div>

                {notification.video_id && (
                    <Link
                        href={`/videos/${notification.video_id}`}
                        className="mt-2 inline-block text-sm font-medium text-red-700 hover:underline dark:text-red-400"
                    >
                        {notification.video_title
                            ? `${t.watch}: ${notification.video_title}`
                            : t.viewVideo}
                    </Link>
                )}
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
                {!notification.is_read && (
                    <button
                        type="button"
                        onClick={() => onMarkAsRead(notification.id)}
                        disabled={isUpdating || updatingId === -1}
                        className="rounded-lg border border-red-700 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white"
                    >
                        {isUpdating ? t.updating : t.markRead}
                    </button>
                )}

                <button
                    type="button"
                    onClick={() => onDelete(notification.id)}
                    disabled={isUpdating || updatingId === -1}
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/50"
                >
                    {isUpdating ? t.deleting : t.delete}
                </button>

                {notification.is_read && (
                    <span className="text-sm text-gray-400 dark:text-gray-500">
                        ✓ {t.read}
                    </span>
                )}
            </div>
        </article>
    );
}