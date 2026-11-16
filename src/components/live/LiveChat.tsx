"use client";

import {
    FormEvent,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import { isAxiosError } from "axios";
import { axiosClient } from "@/lib/axios";
import { ensureAccessToken } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { PISHI_STICKERS } from "@/lib/stickers";

interface LiveChatProps {
    liveId: number;
    isLive: boolean;
    canReport: boolean;
}

interface ChatMessage {
    id: number;
    user_id: number;
    is_own: boolean;
    username: string;
    message: string;
    created_at: string;
}

interface ChatResponse {
    messages: ChatMessage[];
    next_after: number | null;
    total_count: number;
}

interface SendMessageResponse extends ChatMessage {
    total_count: number;
}

type ReportReason =
    | "spam"
    | "harassment"
    | "hate_speech"
    | "inappropriate"
    | "misinformation"
    | "other";

const EMOJIS = [
    "😀", "😂", "😍", "❤️", "🔥", "👍",
    "😎", "😭", "🎮", "👏", "🥳", "💯",
    "😺", "🚀", "💜", "🙌", "🤣", "🤩",
];

function renderMessageContent(message: string) {
    const parts = message.split(/(:cat(?:[1-9]|1[0-9]|2[0-4]):)/g);

    return parts.map((part, index) => {
        const sticker = PISHI_STICKERS.find(
            (item) => item.code === part
        );

        if (sticker) {
            return (
                <img
                    key={`${index}-${part}`}
                    src={sticker.src}
                    alt="Pishi sticker"
                    loading="lazy"
                    className="my-1 inline-block h-12 w-12 object-contain align-middle"
                />
            );
        }

        return <span key={index}>{part}</span>;
    });
}

export default function LiveChat({
    liveId,
    isLive,
    canReport,
}: LiveChatProps) {
    const { language, isPersian } = useLanguage();
    const isFa = language === "fa";

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [draft, setDraft] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showStickerPicker, setShowStickerPicker] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [reportingMessageId, setReportingMessageId] =
        useState<number | null>(null);
    const [reportReason, setReportReason] =
        useState<ReportReason>("spam");
    const [reportDetails, setReportDetails] = useState("");
    const [reportSubmitting, setReportSubmitting] = useState(false);
    const [reportError, setReportError] = useState("");
    const [reportedMessageIds, setReportedMessageIds] = useState<number[]>([]);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesRef = useRef<HTMLDivElement>(null);
    const cursorRef = useRef(0);

    const chatUrl = `/live/${liveId}/chat/`;

    const loadMessages = useCallback(
        async (initialLoad: boolean, after?: number) => {
            try {
                const response = await axiosClient.get<ChatResponse>(
                    chatUrl,
                    after === undefined
                        ? undefined
                        : { params: { after } }
                );

                const incoming = response.data.messages;
                setTotalCount(response.data.total_count);

                if (initialLoad) {
                    setMessages(incoming);
                } else if (incoming.length > 0) {
                    setMessages((current) => {
                        const knownIds = new Set(
                            current.map((item) => item.id)
                        );

                        const newMessages = incoming.filter(
                            (item) => !knownIds.has(item.id)
                        );

                        return [...current, ...newMessages].slice(-200);
                    });
                }

                const lastMessage =
                    incoming.length > 0
                        ? incoming[incoming.length - 1].id
                        : null;

                if (lastMessage !== null) {
                    cursorRef.current = Math.max(
                        cursorRef.current,
                        lastMessage
                    );
                } else if (initialLoad) {
                    cursorRef.current = 0;
                } else if (response.data.next_after !== null) {
                    cursorRef.current = response.data.next_after;
                }

                setError("");
            } catch (requestError: unknown) {
                if (initialLoad) {
                    setError(
                        isFa
                            ? "دریافت پیام‌های چت ناموفق بود."
                            : "Could not load chat messages."
                    );
                }

                console.error("Live chat request failed:", requestError);
            } finally {
                if (initialLoad) {
                    setLoading(false);
                }
            }
        },
        [chatUrl, isFa]
    );

    useEffect(() => {
        let cancelled = false;
        let requestInFlight = false;
        let intervalId: number | undefined;

        const load = async (initialLoad: boolean) => {
            if (cancelled || requestInFlight) return;

            requestInFlight = true;

            try {
                const after = initialLoad
                    ? undefined
                    : cursorRef.current;

                await loadMessages(initialLoad, after);
            } finally {
                requestInFlight = false;
            }
        };

        void load(true);

        if (isLive) {
            intervalId = window.setInterval(() => {
                void load(false);
            }, 4000);
        }

        return () => {
            cancelled = true;

            if (intervalId !== undefined) {
                window.clearInterval(intervalId);
            }
        };
    }, [isLive, loadMessages]);

    useEffect(() => {
        const container = messagesRef.current;

        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }, [messages]);

    const insertText = (value: string) => {
        const textarea = textareaRef.current;

        if (!textarea) {
            setDraft((current) => (
                current.length + value.length <= 500
                    ? current + value
                    : current
            ));
            return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        const updated =
            draft.slice(0, start) +
            value +
            draft.slice(end);

        if (updated.length > 500) return;

        setDraft(updated);
        setShowEmojiPicker(false);
        setShowStickerPicker(false);

        requestAnimationFrame(() => {
            textarea.focus();

            const position = start + value.length;

            textarea.setSelectionRange(position, position);
        });
    };

    const handleSend = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const message = draft.trim();

        if (!message || sending || !isLive) return;

        setSending(true);
        setError("");

        try {
            const token = await ensureAccessToken();

            if (!token) {
                setError(
                    isFa
                        ? "برای ارسال پیام ابتدا وارد حساب کاربری شو."
                        : "Please sign in to send a message."
                );
                return;
            }

            const response = await axiosClient.post<SendMessageResponse>(
                chatUrl,
                { message },
            );

            const newMessage = response.data;
            setTotalCount(newMessage.total_count);

            setMessages((current) => {
                if (current.some((item) => item.id === newMessage.id)) {
                    return current;
                }

                return [...current, newMessage].slice(-200);
            });

            cursorRef.current = Math.max(
                cursorRef.current,
                newMessage.id
            );

            setDraft("");
            setShowEmojiPicker(false);
            setShowStickerPicker(false);
        } catch (requestError: unknown) {
            if (
                isAxiosError(requestError) &&
                requestError.response?.status === 401
            ) {
                setError(
                    isFa
                        ? "برای ارسال پیام باید وارد حساب کاربری شوی."
                        : "You must sign in to send a message."
                );
            } else if (
                isAxiosError(requestError) &&
                requestError.response?.status === 409
            ) {
                setError(
                    isFa
                        ? "این پخش زنده به پایان رسیده است."
                        : "This live stream has ended."
                );
            } else {
                setError(
                    isFa
                        ? "ارسال پیام ناموفق بود. دوباره تلاش کن."
                        : "Could not send message. Please try again."
                );
            }
        } finally {
            setSending(false);
        }
    };

    const handleReportMessage = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        const messageId = reportingMessageId;

        if (messageId === null || !canReport || reportSubmitting) {
            return;
        }

        if (reportDetails.length > 500) {
            setReportError(
                isFa
                    ? "توضیحات نباید بیشتر از ۵۰۰ کاراکتر باشد."
                    : "Details must be 500 characters or less."
            );
            return;
        }

        setReportSubmitting(true);
        setReportError("");

        try {
            const token = await ensureAccessToken();

            if (!token) {
                setReportError(
                    isFa
                        ? "برای گزارش پیام ابتدا وارد حساب کاربری شو."
                        : "Please sign in to report a message."
                );
                return;
            }

            await axiosClient.post(
                `/live/${liveId}/chat/${messageId}/report/`,
                {
                    reason: reportReason,
                    details: reportDetails.trim(),
                }
            );

            setReportedMessageIds((current) =>
                current.includes(messageId)
                    ? current
                    : [...current, messageId]
            );

            setReportingMessageId(null);
            setReportDetails("");
            setReportReason("spam");
            setReportError("");
        } catch (requestError: unknown) {
            if (
                isAxiosError(requestError) &&
                requestError.response?.status === 409
            ) {
                setReportError(
                    isFa
                        ? "قبلاً این پیام را گزارش کرده‌ای."
                        : "You have already reported this message."
                );
            } else if (
                isAxiosError(requestError) &&
                requestError.response?.status === 401
            ) {
                setReportError(
                    isFa
                        ? "برای گزارش پیام باید وارد حساب کاربری شوی."
                        : "Please sign in to report a message."
                );
            } else {
                const responseData = isAxiosError(requestError)
                    ? requestError.response?.data as
                        | { error?: string }
                        | undefined
                    : undefined;

                setReportError(
                    responseData?.error ||
                    (isFa
                        ? "گزارش پیام ناموفق بود."
                        : "Could not report this message.")
                );
            }

            console.error("Live chat report error:", requestError);
        } finally {
            setReportSubmitting(false);
        }
    };

    return (
        <section className="flex h-[480px] min-h-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-[#303030] dark:bg-[#181818] lg:h-[600px]">
            <header className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-[#303030]">
                <h2 className="font-bold">
                    {isFa ? "چت زنده" : "Live chat"}
                </h2>

                <span className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    {isLive && (
                        <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                    )}
                    {totalCount.toLocaleString(isFa ? "fa-IR" : "en-US")} {isFa ? "پیام" : "messages"}
                </span>
            </header>

            <div
                ref={messagesRef}
                aria-live="polite"
                className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 sm:p-4"
            >
                {loading && messages.length === 0 && (
                    <p className="py-5 text-center text-sm text-gray-500 dark:text-gray-400">
                        {isFa
                            ? "در حال دریافت پیام‌ها..."
                            : "Loading messages..."}
                    </p>
                )}

                {!loading && messages.length === 0 && (
                    <div className="flex h-full items-center justify-center text-center text-sm text-gray-500 dark:text-gray-400">
                        {isFa
                            ? "هنوز پیامی ارسال نشده. اولین نفر باش! 💬"
                            : "No messages yet. Start the conversation! 💬"}
                    </div>
                )}

                {messages.map((item) => (
                    <article
                        key={item.id}
                        className="flex gap-2.5"
                    >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-700 dark:bg-[#303030] dark:text-gray-200">
                            {item.username.slice(0, 1).toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                <button
                                    type="button"
                                    onClick={() => insertText(`@${item.username} `)}
                                    title={isFa ? "منشن کردن کاربر" : "Mention user"}
                                    className="break-all text-xs font-semibold text-gray-800 transition hover:text-[var(--accent)] dark:text-gray-200"
                                >
                                    @{item.username}
                                </button>

                                <time
                                    dateTime={item.created_at}
                                    className="text-[10px] text-gray-400"
                                >
                                    {new Date(
                                        item.created_at
                                    ).toLocaleTimeString(
                                        isPersian ? "fa-IR" : "en-US",
                                        {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        }
                                    )}
                                </time>
                            </div>

                            <p className="mt-1 break-words whitespace-pre-wrap text-sm leading-6 text-gray-700 dark:text-gray-300">
                                {renderMessageContent(item.message)}
                            </p>

                            {!item.is_own && canReport && (
                                <button
                                    type="button"
                                    disabled={reportedMessageIds.includes(item.id)}
                                    onClick={() => {
                                        setReportError("");
                                        setReportReason("spam");
                                        setReportingMessageId(item.id);
                                    }}
                                    className="mt-1 inline-flex cursor-pointer items-center gap-1 rounded px-1 py-0.5 text-[10px] text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:text-green-600 dark:hover:bg-red-950/30"
                                >
                                    <span aria-hidden="true">🚩</span>
                                    {reportedMessageIds.includes(item.id)
                                        ? isFa ? "گزارش شد" : "Reported"
                                        : isFa ? "گزارش پیام" : "Report"}
                                </button>
                            )}
                        </div>
                    </article>
                ))}
            </div>

            {error && (
                <p
                    role="alert"
                    className="shrink-0 border-t border-gray-200 px-3 py-2 text-xs text-red-500 dark:border-[#303030]"
                >
                    {error}
                </p>
            )}

            {isLive ? (
                <form
                    onSubmit={handleSend}
                    className="shrink-0 border-t border-gray-200 p-3 dark:border-[#303030]"
                >
                    <textarea
                        ref={textareaRef}
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        maxLength={500}
                        rows={2}
                        placeholder={
                            isFa
                                ? "پیامت رو بنویس..."
                                : "Write a message..."
                        }
                        className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-[var(--accent)] dark:border-[#383838] dark:bg-[#202020] dark:text-white"
                    />

                    <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEmojiPicker((value) => !value);
                                        setShowStickerPicker(false);
                                    }}
                                    aria-label={isFa ? "انتخاب ایموجی" : "Choose emoji"}
                                    aria-expanded={showEmojiPicker}
                                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-lg transition hover:bg-gray-100 dark:border-[#404040] dark:hover:bg-[#303030]"
                                >
                                    😀
                                </button>

                                {showEmojiPicker && (
                                    <div className="absolute bottom-full start-0 z-30 mb-2 grid w-[min(15rem,calc(100vw-3rem))] grid-cols-6 gap-1 rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-[#404040] dark:bg-[#202020]">
                                        {EMOJIS.map((emoji) => (
                                            <button
                                                key={emoji}
                                                type="button"
                                                onClick={() => insertText(emoji)}
                                                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-xl transition hover:bg-gray-100 dark:hover:bg-[#303030]"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowStickerPicker((value) => !value);
                                        setShowEmojiPicker(false);
                                    }}
                                    aria-label={isFa ? "انتخاب استیکر پیشی" : "Choose Pishi sticker"}
                                    aria-expanded={showStickerPicker}
                                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-lg transition hover:bg-gray-100 dark:border-[#404040] dark:hover:bg-[#303030]"
                                >
                                    😺
                                </button>

                                {showStickerPicker && (
                                    <div className="absolute bottom-full start-0 z-30 mb-2 max-h-[280px] w-[min(18rem,calc(100vw-3rem))] overflow-y-auto rounded-xl border border-gray-200 bg-white p-3 shadow-xl dark:border-[#404040] dark:bg-[#202020]">
                                        <p className="mb-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                            {isFa ? "پک پیشی 🐱" : "Pishi stickers 🐱"}
                                        </p>

                                        <div className="grid grid-cols-5 gap-2">
                                            {PISHI_STICKERS.map((sticker) => (
                                                <button
                                                    key={sticker.code}
                                                    type="button"
                                                    onClick={() => insertText(sticker.code)}
                                                    title={sticker.code}
                                                    className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-lg p-1 transition hover:bg-gray-100 dark:hover:bg-[#303030]"
                                                >
                                                    <img
                                                        src={sticker.src}
                                                        alt={sticker.code}
                                                        loading="lazy"
                                                        className="h-full w-full object-contain"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <span className="text-[10px] text-gray-400">
                                {draft.length}/500
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={!draft.trim() || sending}
                            className="accent-button inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {sending
                                ? isFa
                                    ? "..."
                                    : "..."
                                : isFa
                                    ? "ارسال"
                                    : "Send"}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="shrink-0 border-t border-gray-200 px-4 py-3 text-center text-xs text-gray-500 dark:border-[#303030] dark:text-gray-400">
                    {isFa
                        ? "پخش به پایان رسیده؛ چت فقط قابل مشاهده است."
                        : "The stream has ended. Chat is read-only."}
                </div>
            )}

            {reportingMessageId !== null && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="chat-report-title"
                        dir={isPersian ? "rtl" : "ltr"}
                        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-[#383838] dark:bg-[#181818]"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <h3 id="chat-report-title" className="text-lg font-bold">
                                {isFa ? "گزارش پیام چت" : "Report chat message"}
                            </h3>

                            <button
                                type="button"
                                onClick={() => setReportingMessageId(null)}
                                disabled={reportSubmitting}
                                aria-label={isFa ? "بستن" : "Close"}
                                className="rounded-lg px-3 py-1 text-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-[#303030]"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleReportMessage} className="mt-5 space-y-4">
                            <div>
                                <label htmlFor="chat-report-reason" className="mb-2 block text-sm font-medium">
                                    {isFa ? "دلیل گزارش" : "Report reason"}
                                </label>

                                <select
                                    id="chat-report-reason"
                                    value={reportReason}
                                    onChange={(event) => setReportReason(event.target.value as ReportReason)}
                                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-[var(--accent)] dark:border-[#444444] dark:bg-[#202020]"
                                >
                                    <option value="spam">{isFa ? "هرزنامه" : "Spam"}</option>
                                    <option value="harassment">{isFa ? "آزار و اذیت یا قلدری" : "Harassment or bullying"}</option>
                                    <option value="hate_speech">{isFa ? "نفرت‌پراکنی" : "Hate speech"}</option>
                                    <option value="inappropriate">{isFa ? "محتوای نامناسب" : "Inappropriate content"}</option>
                                    <option value="misinformation">{isFa ? "اطلاعات گمراه‌کننده" : "Misinformation"}</option>
                                    <option value="other">{isFa ? "سایر موارد" : "Other"}</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="chat-report-details" className="mb-2 block text-sm font-medium">
                                    {isFa ? "توضیحات بیشتر (اختیاری)" : "Additional details (optional)"}
                                </label>

                                <textarea
                                    id="chat-report-details"
                                    value={reportDetails}
                                    onChange={(event) => setReportDetails(event.target.value)}
                                    maxLength={500}
                                    rows={3}
                                    className="w-full resize-y rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-[var(--accent)] dark:border-[#444444] dark:bg-[#202020]"
                                    placeholder={isFa ? "توضیحات گزارش..." : "Additional details..."}
                                />

                                <p className="mt-1 text-end text-xs text-gray-400">
                                    {reportDetails.length}/500
                                </p>
                            </div>

                            {reportError && (
                                <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
                                    {reportError}
                                </p>
                            )}

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setReportingMessageId(null)}
                                    disabled={reportSubmitting}
                                    className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium dark:border-[#444444]"
                                >
                                    {isFa ? "انصراف" : "Cancel"}
                                </button>

                                <button
                                    type="submit"
                                    disabled={reportSubmitting || reportDetails.length > 500}
                                    className="rounded-xl bg-red-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {reportSubmitting
                                        ? isFa ? "در حال ارسال..." : "Submitting..."
                                        : isFa ? "ارسال گزارش" : "Submit report"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}
