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

            default:
                // برای اعلان‌هایی که هنوز قالبشان را نمی‌شناسیم،
                // پیام اصلی بک‌اند را بدون تغییر نمایش می‌دهیم.
                return notification.message;
        }
    };

    return (
        <article
            dir={isPersian ? "rtl" : "ltr"}
            className={`flex flex-col gap-3 rounded-xl border p-3 transition sm:flex-row sm:items-center sm:gap-4 sm:p-5 ${
                notification.is_read
                    ? "border-gray-200 bg-white dark:border-[#303030] dark:bg-[#181818]"
                    : "border-[var(--accent)]/40 bg-[var(--accent)]/5"
            }`}
        >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-xl shadow-sm sm:h-12 sm:w-12 sm:text-2xl dark:bg-[#252525]">
                {notificationIcons[notification.type] ?? "🔔"}
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium leading-5 text-gray-900 sm:text-sm sm:leading-normal dark:text-gray-100">
                    {getMessage()}
                </p>

                {notification.type === "video_like" &&
                    notification.interaction_count > 0 && (
                        <p className="mt-1 text-sm font-medium text-[var(--accent)]">
                            👍 {formattedCount} {t.interactions}
                        </p>
                    )}

                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500 sm:mt-2 sm:gap-2 sm:text-sm dark:text-gray-400">
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
                        className="mt-1.5 inline-block text-xs font-medium text-red-700 hover:underline sm:mt-2 sm:text-sm dark:text-red-400"
                    >
                        {notification.video_title
                            ? `${t.watch}: ${notification.video_title}`
                            : t.viewVideo}
                    </Link>
                )}
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:gap-2">
                {!notification.is_read && (
                    <button
                        type="button"
                        onClick={() => onMarkAsRead(notification.id)}
                        disabled={isUpdating || updatingId === -1}
                        className="rounded-lg border border-[var(--accent)] px-3 py-1.5 text-xs font-medium text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-2 sm:text-sm"
                    >
                        {isUpdating ? t.updating : t.markRead}
                    </button>
                )}

                <button
                    type="button"
                    onClick={() => onDelete(notification.id)}
                    disabled={isUpdating || updatingId === -1}
                    className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50 sm:px-3 sm:py-2 sm:text-sm dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/50"
                >
                    {isUpdating ? t.deleting : t.delete}
                </button>

                {notification.is_read && (
                    <span className="text-xs text-gray-400 sm:text-sm dark:text-gray-500">
                        ✓ {t.read}
                    </span>
                )}
            </div>
        </article>
    );
}