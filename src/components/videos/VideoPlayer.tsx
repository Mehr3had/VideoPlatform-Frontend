"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import type Player from "video.js/dist/types/player";
import { useVideoPlayerStore } from "@/stores/useVideoPlayerStore";
import { useLanguage } from "@/context/LanguageContext";
import { createPortal } from "react-dom";

interface VideoQualityOption {
    resolution: number;
    label: string;
    src: string;
}

interface VideoPlayerProps {
    src: string;
    hlsSrc?: string | null;
    poster?: string | null;
    videoId: string | number;
    title: string;
    subtitles: {
        language: string;
        label: string;
        src: string;
    }[];
    qualities: VideoQualityOption[];
}

function createSkipIcon(direction: "backward" | "forward") {
    const isBackward = direction === "backward";

    const arrow = isBackward
        ? `
            <path d="M20 7 A12 12 0 1 0 23 20"/>
            <path d="M20 3 V10 H27"/>
        `
        : `
            <path d="M12 7 A12 12 0 1 1 9 20"/>
            <path d="M12 3 V10 H5"/>
        `;

    return `
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            aria-hidden="true"
            focusable="false"
        >
            <g
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                ${arrow}
            </g>

            <text
                x="${isBackward ? 10 : 22}"
                y="21"
                text-anchor="middle"
                font-family="Arial, sans-serif"
                font-size="10"
                font-weight="700"
                fill="currentColor"
                stroke="none"
                textLength="12"
                lengthAdjust="spacingAndGlyphs"
            >10</text>
        </svg>
    `;
}

function registerSettingsButton() {
    const Button = videojs.getComponent("Button");

    class SettingsButton extends Button {
        constructor(player: Player, options?: object) {
            super(player, options);

            this.addClass("vjs-settings-button");
            this.addClass("vjs-desktop-settings-button");
            this.el()?.setAttribute("aria-label", "Settings");
            this.el()?.setAttribute("title", "Settings");
        }

        handleClick() {
            this.player().trigger("settingsbuttonclick");
        }

        createEl() {
            const element = super.createEl();

            const placeholder = element.querySelector(
                ".vjs-icon-placeholder"
            );

            if (placeholder) {
                placeholder.innerHTML = `
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M10.3 2.8h3.4l.5 2.1a7.5 7.5 0 0 1 1.7.7l1.9-1.1 2.4 2.4-1.1 1.9a7.5 7.5 0 0 1 .7 1.7l2.1.5v3.4l-2.1.5a7.5 7.5 0 0 1-.7 1.7l1.1 1.9-2.4 2.4-1.9-1.1a7.5 7.5 0 0 1-1.7.7l-.5 2.1h-3.4l-.5-2.1a7.5 7.5 0 0 1-1.7-.7l-1.9 1.1-2.4-2.4 1.1-1.9a7.5 7.5 0 0 1-.7-1.7l-2.1-.5v-3.4l2.1-.5a7.5 7.5 0 0 1 .7-1.7L3.8 6.9l2.4-2.4 1.9 1.1a7.5 7.5 0 0 1 1.7-.7z"
                        />
                        <circle cx="12" cy="12" r="3.1" />
                    </svg>
                `;
            }

            return element;
        }
    }

    if (!videojs.getComponent("SettingsButton")) {
        videojs.registerComponent("SettingsButton", SettingsButton);
    }
}

function registerTimeDisplayButton() {
    const Button = videojs.getComponent("Button");

    class TimeDisplayButton extends Button {
        private showRemaining = false;
        private updateTimeBound!: () => void;

        constructor(player: Player, options?: object) {
            super(player, options);

            this.addClass("vjs-time-display-button");

            this.el()?.setAttribute("aria-label", "Toggle time display");
            this.el()?.setAttribute("title", "Toggle elapsed / remaining time");

            this.updateTimeBound = this.updateTime.bind(this);

            player.on("timeupdate", this.updateTimeBound);
            player.on("loadedmetadata", this.updateTimeBound);
            player.on("durationchange", this.updateTimeBound);

            this.updateTime();
        }

        formatTime(seconds: number) {
            const totalSeconds = Math.floor(Math.max(0, seconds));
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const remainingSeconds = totalSeconds % 60;

            if (hours > 0) {
                return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
            }

            return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
        }

        updateTime() {
            const current = this.player().currentTime();
            const duration = this.player().duration();

            const currentTime =
                typeof current === "number" && Number.isFinite(current)
                    ? current
                    : 0;

            const totalDuration =
                typeof duration === "number" && Number.isFinite(duration)
                    ? duration
                    : 0;

            const displayedTime = this.showRemaining
                ? `-${this.formatTime(Math.max(0, totalDuration - currentTime))}`
                : this.formatTime(currentTime);

            const text = this.el()?.querySelector(".vjs-time-display-text");

            if (text) {
                text.textContent = `${displayedTime} / ${this.formatTime(totalDuration)}`;
            }
        }

        handleClick() {
            this.showRemaining = !this.showRemaining;
            this.updateTime();
        }

        createEl() {
            const element = super.createEl();

            element.innerHTML = `
                <span class="vjs-time-display-text">0:00 / 0:00</span>
            `;

            return element;
        }

        dispose() {
            this.player().off("timeupdate", this.updateTimeBound);
            this.player().off("loadedmetadata", this.updateTimeBound);
            this.player().off("durationchange", this.updateTimeBound);

            super.dispose();
        }
    }

    if (!videojs.getComponent("TimeDisplayButton")) {
        videojs.registerComponent("TimeDisplayButton", TimeDisplayButton);
    }
}

function addSkipButtons(player: Player) {
    const Button = videojs.getComponent("Button");

    class SkipBackwardButton extends Button {
        constructor(player: Player, options?: object) {
            super(player, options);
            this.addClass("vjs-skip-backward");
            this.el()?.setAttribute("aria-label", "Back 10 seconds");
            this.el()?.setAttribute("title", "Back 10 seconds");
        }

        handleClick() {
            const currentTime = this.player().currentTime();

            if (typeof currentTime === "number") {
                this.player().currentTime(Math.max(0, currentTime - 10));
            }
        }

        createEl() {
            const element = super.createEl();

            const placeholder = element.querySelector(".vjs-icon-placeholder");

            if (placeholder) {
                placeholder.innerHTML = createSkipIcon("backward");
            }

            return element;
        }
    }

    class SkipForwardButton extends Button {
        constructor(player: Player, options?: object) {
            super(player, options);
            this.addClass("vjs-skip-forward");
            this.el()?.setAttribute("aria-label", "Forward 10 seconds");
            this.el()?.setAttribute("title", "Forward 10 seconds");
        }

        handleClick() {
            const currentTime = this.player().currentTime();
            const duration = this.player().duration();

            if (typeof currentTime !== "number") return;

            this.player().currentTime(
                Math.min(
                    currentTime + 10,
                    typeof duration === "number" && Number.isFinite(duration)
                        ? duration
                        : currentTime + 10
                )
            );
        }

        createEl() {
            const element = super.createEl();

            const placeholder = element.querySelector(".vjs-icon-placeholder");

            if (placeholder) {
                placeholder.innerHTML = createSkipIcon("forward");
            }

            return element;
        }
    }

    if (!videojs.getComponent("SkipBackwardButton")) {
        videojs.registerComponent("SkipBackwardButton", SkipBackwardButton);
    }

    if (!videojs.getComponent("SkipForwardButton")) {
        videojs.registerComponent("SkipForwardButton", SkipForwardButton);
    }

    player.ready(() => {
        if (player.isDisposed()) return;

        const controlBar = player.getChild("controlBar");
        if (!controlBar) return;

        if (!player.getChild("skipButtonsAdded")) {
            controlBar.addChild("SkipBackwardButton", {}, 1);
            controlBar.addChild("SkipForwardButton", {}, 2);
        }
    });
}

type SettingsSection = "main" | "subtitles" | "speed" | "quality";
export default function VideoPlayer({
    src,
    hlsSrc,
    poster,
    videoId,
    title,
    subtitles,
    qualities,
}: VideoPlayerProps) {
    const titleCharacters = Array.from(title.trim());

    const displayTitle =
        titleCharacters.length > 35
            ? `${titleCharacters.slice(0, 35).join("")}…`
            : title.trim();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const playerRef = useRef<ReturnType<typeof videojs> | null>(null);
    const { isPersian } = useLanguage();
    const subtitlePreferenceKey =
        `video-platform:subtitle:${String(videoId)}`;
    const [skipFeedback, setSkipFeedback] = useState<{
        direction: "backward" | "forward";
        id: number;
    } | null>(null);

    const [isFastForwarding, setIsFastForwarding] = useState(false);
    const [playbackFeedback, setPlaybackFeedback] = useState<{
        action: "play" | "pause";
        id: number;
    } | null>(null);

    const playbackFeedbackTimerRef =
        useRef<ReturnType<typeof setTimeout> | null>(null);

    const singleTapTimerRef =
        useRef<ReturnType<typeof setTimeout> | null>(null);

    const desktopClickTimerRef =
        useRef<ReturnType<typeof setTimeout> | null>(null);

    const lastTouchAtRef = useRef(0);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [settingsSection, setSettingsSection] =
        useState<SettingsSection>("main");
    const [selectedSubtitle, setSelectedSubtitle] = useState("off");
    const selectedSubtitleRef = useRef("off");
    const hasPlaybackStartedRef = useRef(false);
    const [playerElement, setPlayerElement] = useState<HTMLElement | null>(null);
    const [selectedQuality, setSelectedQuality] = useState("auto");
    const pendingQualityRef = useRef<string | null>(null);
    const activeQualityRef = useRef("auto");
    const lastCompletedQualityRef = useRef("auto");
    const qualitySwitchCleanupRef = useRef<(() => void) | null>(null);

    const lastTapRef = useRef<{
        time: number;
        side: "left" | "center" | "right";
    } | null>(null);

    const qualitySwitchingRef = useRef(false);
    const qualitySwitchIdRef = useRef(0);
    const qualitySwitchTimeRef = useRef<number | null>(null);
    const qualitySwitchWasPlayingRef = useRef<boolean | null>(null);

    const holdSpeedRef = useRef<{
        active: boolean;
        previousRate: number;
        timer: ReturnType<typeof setTimeout> | null;
    }>({
        active: false,
        previousRate: 1,
        timer: null,
    });

    const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
        null
    );

    const skip = useCallback((seconds: number) => {
        const player = playerRef.current;

        if (!player || player.isDisposed()) return;

        const currentTime = player.currentTime();
        const duration = player.duration();

        if (
            typeof currentTime !== "number" ||
            !Number.isFinite(currentTime)
        ) {
            return;
        }

        const nextTime = Math.max(
            0,
            Math.min(
                currentTime + seconds,
                typeof duration === "number" && Number.isFinite(duration)
                    ? duration
                    : Number.MAX_SAFE_INTEGER
            )
        );

        player.currentTime(nextTime);

        setSkipFeedback({
            direction: seconds < 0 ? "backward" : "forward",
            id: Date.now(),
        });

        if (feedbackTimerRef.current !== null) {
            clearTimeout(feedbackTimerRef.current);
        }

        feedbackTimerRef.current = setTimeout(() => {
            setSkipFeedback(null);
            feedbackTimerRef.current = null;
        }, 600);
    }, []);

    const showPlaybackFeedback = useCallback(
        (action: "play" | "pause") => {
            setPlaybackFeedback({
                action,
                id: Date.now(),
            });

            if (playbackFeedbackTimerRef.current !== null) {
                clearTimeout(playbackFeedbackTimerRef.current);
            }

            playbackFeedbackTimerRef.current = setTimeout(() => {
                setPlaybackFeedback(null);
                playbackFeedbackTimerRef.current = null;
            }, 600);
        },
        []
    );

    const togglePlayback = useCallback(() => {
        const player = playerRef.current;

        if (!player || player.isDisposed()) return;

        const nativeVideo = player.el()?.querySelector("video");

        if (!nativeVideo) return;

        if (nativeVideo.paused) {
            showPlaybackFeedback("play");

            const playPromise = player.play();

            if (playPromise && typeof playPromise.catch === "function") {
                void playPromise.catch((error) => {
                    console.error("[PLAY ERROR]", error);

                    if (playbackFeedbackTimerRef.current !== null) {
                        clearTimeout(playbackFeedbackTimerRef.current);
                        playbackFeedbackTimerRef.current = null;
                    }

                    setPlaybackFeedback(null);
                });
            }
        } else {
            player.pause();
            showPlaybackFeedback("pause");
        }
    }, [showPlaybackFeedback]);

    const handlePlayerDoubleTap = useCallback(
        (event: React.TouchEvent<HTMLDivElement>) => {
            if (isSettingsOpen) return;

            const target = event.target;

            if (
                target instanceof Element &&
                target.closest(
                    ".vjs-control-bar, .vjs-big-play-button, .vjs-menu, .vjs-modal-dialog, .mobile-player-header"
                )
            ) {
                lastTapRef.current = null;

                if (singleTapTimerRef.current !== null) {
                    clearTimeout(singleTapTimerRef.current);
                    singleTapTimerRef.current = null;
                }

                return;
            }

            const touch = event.changedTouches[0];

            if (!touch) return;

            const now = Date.now();
            lastTouchAtRef.current = now;

            const bounds = event.currentTarget.getBoundingClientRect();
            const relativeX =
                (touch.clientX - bounds.left) / bounds.width;
            const side: "left" | "center" | "right" =
                relativeX < 0.4
                    ? "left"
                    : relativeX > 0.6
                        ? "right"
                        : "center";
            const previousTap = lastTapRef.current;

            // Double tap
            if (
                previousTap &&
                previousTap.side === side &&
                now - previousTap.time < 300
            ) {
                lastTapRef.current = null;
                if (singleTapTimerRef.current !== null) {
                    clearTimeout(singleTapTimerRef.current);
                    singleTapTimerRef.current = null;
                }

                if (side === "center") {
                    togglePlayback();
                } else {
                    skip(side === "left" ? -10 : 10);
                }

                return;
            }

            if (singleTapTimerRef.current !== null) {
                clearTimeout(singleTapTimerRef.current);
                singleTapTimerRef.current = null;
            }

            lastTapRef.current = {
                time: now,
                side,
            };

            // Single tap in the center
            if (side === "center") {
                singleTapTimerRef.current = setTimeout(() => {
                    singleTapTimerRef.current = null;
                    lastTapRef.current = null;
                    togglePlayback();
                }, 320);
            }
        },
        [skip, togglePlayback, isSettingsOpen]
    );

    const handlePlayerClick = useCallback(
        (event: React.MouseEvent<HTMLDivElement>) => {
            // Ignore synthetic clicks generated after touch
            if (Date.now() - lastTouchAtRef.current < 700) {
                return;
            }

            if (isSettingsOpen) return;

            const target = event.target;

            if (
                target instanceof Element &&
                target.closest(
                    ".vjs-poster, .vjs-control-bar, .vjs-big-play-button, .vjs-menu, .vjs-modal-dialog, .mobile-player-header, button, a, input, textarea"
                )
            ) {
                return;
            }

            // Ignore the second click of a double-click
            if (event.detail > 1) {
                return;
            }

            // Execute immediately while user interaction is active
            togglePlayback();
        },
        [togglePlayback, isSettingsOpen]
    );

    const handlePlayerDoubleClick = useCallback(() => {
        if (desktopClickTimerRef.current !== null) {
            clearTimeout(desktopClickTimerRef.current);
            desktopClickTimerRef.current = null;
        }
    }, []);

    const handleHoldStart = useCallback(
        (event: React.PointerEvent<HTMLDivElement>) => {
            if (event.pointerType === "mouse" && event.button !== 0) {
                return;
            }

            const target = event.target;

            if (
                target instanceof Element &&
                target.closest(
                    ".vjs-control-bar, .vjs-big-play-button, .vjs-menu"
                )
            ) {
                return;
            }

            const bounds = event.currentTarget.getBoundingClientRect();

            // فقط نیمه‌ی راست پلیر
            if (event.clientX < bounds.left + bounds.width / 2) {
                return;
            }

            const player = playerRef.current;

            if (!player || player.isDisposed()) return;

            const hold = holdSpeedRef.current;

            if (hold.timer !== null) {
                clearTimeout(hold.timer);
            }

            hold.active = false;
            const currentRate = player.playbackRate();

            hold.previousRate =
                typeof currentRate === "number" && Number.isFinite(currentRate)
                    ? currentRate
                    : 1;

            hold.timer = setTimeout(() => {
                const currentPlayer = playerRef.current;

                if (!currentPlayer || currentPlayer.isDisposed()) return;

                hold.active = true;
                currentPlayer.playbackRate(2);
                setIsFastForwarding(true);
            }, 180);
        },
        []
    );

    const handleHoldEnd = useCallback(() => {
        const hold = holdSpeedRef.current;

        if (hold.timer !== null) {
            clearTimeout(hold.timer);
            hold.timer = null;
        }

        if (!hold.active) return;

        hold.active = false;
        setIsFastForwarding(false);

        const player = playerRef.current;

        if (player && !player.isDisposed()) {
            player.playbackRate(hold.previousRate);
        }
    }, []);

    const playbackRate = useVideoPlayerStore(
        (state) => state.playbackRate
    );
    const volume = useVideoPlayerStore((state) => state.volume);
    const muted = useVideoPlayerStore((state) => state.muted);

    const handlePlaybackRateChange = (rate: number) => {
        const player = playerRef.current;

        if (!player || player.isDisposed()) return;

        player.playbackRate(rate);
        useVideoPlayerStore.getState().setPlaybackRate(rate);
    };

    const handleQualityChange = (quality: string) => {
        const player = playerRef.current;

        if (!player || player.isDisposed()) return;

        const getQualitySource = (value: string) =>
            value === "auto"
                ? hlsSrc || src
                : qualities.find(
                    (item) => String(item.resolution) === value
                )?.src;

        if (!getQualitySource(quality)) return;

        // اگر تعویضی در جریان است، درخواست جدید را در صف قرار بده.
        if (qualitySwitchingRef.current) {
            if (quality === activeQualityRef.current) {
                // انتخاب کیفیتی که همین الان در حال بارگذاری است،
                // درخواست‌های منتظر را لغو می‌کند.
                pendingQualityRef.current = null;
                setSelectedQuality(activeQualityRef.current);
            } else if (quality !== selectedQuality) {
                // فقط آخرین درخواست نگه داشته می‌شود.
                pendingQualityRef.current = quality;
                setSelectedQuality(quality);
            }

            return;
        }

        if (quality === selectedQuality) return;

        const currentTime = player.currentTime();

        if (
            typeof currentTime !== "number" ||
            !Number.isFinite(currentTime)
        ) {
            return;
        }

        const wasPlaying = !player.paused();
        const id = String(videoId);

        // زمان و وضعیت اولیه تا پایان تمام درخواست‌های صف حفظ می‌شوند.
        qualitySwitchTimeRef.current = currentTime;
        qualitySwitchWasPlayingRef.current = wasPlaying;
        qualitySwitchingRef.current = true;
        pendingQualityRef.current = null;

        useVideoPlayerStore
            .getState()
            .setVideoProgress(id, currentTime);

        const startSwitch = (targetQuality: string) => {
            const selectedSource = getQualitySource(targetQuality);

            if (!selectedSource || player.isDisposed()) return;

            const switchId = ++qualitySwitchIdRef.current;

            activeQualityRef.current = targetQuality;
            setSelectedQuality(targetQuality);

            let targetTime = currentTime;
            let metadataLoaded = false;
            let seekAttempts = 0;
            let timeoutId: ReturnType<typeof setTimeout> | null = null;
            let cleanedUp = false;

            const sourceMatches = () => {
                const currentSource = player.currentSrc();

                if (!currentSource) return false;

                try {
                    return (
                        new URL(currentSource, window.location.href).href ===
                        new URL(selectedSource, window.location.href).href
                    );
                } catch {
                    return currentSource === selectedSource;
                }
            };

            const cleanup = () => {
                if (cleanedUp) return;

                cleanedUp = true;

                player.off("loadedmetadata", handleLoadedMetadata);
                player.off("canplay", handleCanPlay);
                player.off("seeked", handleSeeked);
                player.off("error", handleSwitchError);

                if (timeoutId !== null) {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                }

                if (qualitySwitchCleanupRef.current === cleanup) {
                    qualitySwitchCleanupRef.current = null;
                }
            };

            const finishSwitch = () => {
                if (
                    cleanedUp ||
                    player.isDisposed() ||
                    switchId !== qualitySwitchIdRef.current ||
                    !metadataLoaded ||
                    !sourceMatches() ||
                    player.seeking()
                ) {
                    return;
                }

                const actualTime = player.currentTime();

                if (
                    typeof actualTime !== "number" ||
                    !Number.isFinite(actualTime) ||
                    Math.abs(actualTime - targetTime) > 0.75
                ) {
                    return;
                }

                cleanup();

                // این کیفیت با موفقیت بارگذاری شده است.
                lastCompletedQualityRef.current = targetQuality;

                // اگر درخواست دیگری در صف باشد، بدون Play مجدد اجرا کن.
                const nextQuality = pendingQualityRef.current;

                if (
                    nextQuality !== null &&
                    nextQuality !== targetQuality
                ) {
                    pendingQualityRef.current = null;
                    startSwitch(nextQuality);
                    return;
                }

                // تمام درخواست‌ها تمام شده‌اند.
                pendingQualityRef.current = null;

                activeQualityRef.current = targetQuality;
                qualitySwitchingRef.current = false;
                qualitySwitchTimeRef.current = null;
                qualitySwitchWasPlayingRef.current = null;

                setSelectedQuality(targetQuality);

                useVideoPlayerStore
                    .getState()
                    .setVideoProgress(id, actualTime);

                if (wasPlaying) {
                    const playPromise = player.play();

                    if (
                        playPromise &&
                        typeof playPromise.catch === "function"
                    ) {
                        playPromise.catch(() => {});
                    }
                }
            };

            const trySeek = () => {
                if (
                    cleanedUp ||
                    player.isDisposed() ||
                    switchId !== qualitySwitchIdRef.current ||
                    !metadataLoaded ||
                    !sourceMatches()
                ) {
                    return;
                }

                const actualTime = player.currentTime();

                if (
                    typeof actualTime === "number" &&
                    Number.isFinite(actualTime) &&
                    !player.seeking() &&
                    Math.abs(actualTime - targetTime) <= 0.75
                ) {
                    finishSwitch();
                    return;
                }

                if (player.seeking() || seekAttempts >= 3) {
                    return;
                }

                seekAttempts += 1;
                player.currentTime(targetTime);
            };

            const handleLoadedMetadata = () => {
                if (
                    player.isDisposed() ||
                    switchId !== qualitySwitchIdRef.current ||
                    !sourceMatches()
                ) {
                    return;
                }

                const duration = player.duration();

                if (
                    typeof duration !== "number" ||
                    !Number.isFinite(duration) ||
                    duration <= 0
                ) {
                    return;
                }

                targetTime = Math.max(
                    0,
                    Math.min(currentTime, duration - 0.25)
                );

                metadataLoaded = true;

                trySeek();
            };

            const handleCanPlay = () => {
                trySeek();
            };

            const handleSeeked = () => {
                trySeek();
            };

            const handleSwitchError = () => {
                if (
                    player.isDisposed() ||
                    switchId !== qualitySwitchIdRef.current ||
                    !sourceMatches()
                ) {
                    return;
                }

                cleanup();

                const nextQuality = pendingQualityRef.current;

                if (
                    nextQuality !== null &&
                    nextQuality !== targetQuality
                ) {
                    pendingQualityRef.current = null;
                    startSwitch(nextQuality);
                    return;
                }

                pendingQualityRef.current = null;
                qualitySwitchingRef.current = false;
                qualitySwitchTimeRef.current = null;
                qualitySwitchWasPlayingRef.current = null;

                activeQualityRef.current =
                    lastCompletedQualityRef.current;

                setSelectedQuality(lastCompletedQualityRef.current);
            };

            // Listenerها قبل از تغییر Source ثبت می‌شوند.
            qualitySwitchCleanupRef.current = cleanup;

            player.on("loadedmetadata", handleLoadedMetadata);
            player.on("canplay", handleCanPlay);
            player.on("seeked", handleSeeked);
            player.on("error", handleSwitchError);

            timeoutId = setTimeout(() => {
                if (
                    player.isDisposed() ||
                    switchId !== qualitySwitchIdRef.current
                ) {
                    return;
                }

                if (metadataLoaded) {
                    trySeek();
                }

                if (
                    !cleanedUp &&
                    switchId === qualitySwitchIdRef.current
                ) {
                    handleSwitchError();
                }
            }, 15000);

            try {
                player.src({
                    src: selectedSource,
                    type:
                        targetQuality === "auto" && hlsSrc
                            ? "application/x-mpegURL"
                            : "video/mp4",
                });
            } catch {
                handleSwitchError();
            }
        };

        // فقط اولین درخواست، تعویض واقعی را شروع می‌کند.
        startSwitch(quality);
    };

    const handleSubtitleChange = (language: string) => {
        // Only allow "off" or an available subtitle language.
        if (
            language !== "off" &&
            !subtitles.some((subtitle) => subtitle.language === language)
        ) {
            return;
        }

        // Update the current selection immediately.
        selectedSubtitleRef.current = language;
        setSelectedSubtitle(language);

        // Persist the selection separately for each video.
        try {
            localStorage.setItem(subtitlePreferenceKey, language);
        } catch (error) {
            console.warn("Could not save subtitle preference:", error);
        }

        const player = playerRef.current;

        if (!player || player.isDisposed()) return;

        const textTracks = player.textTracks();

        for (let i = 0; i < textTracks.length; i++) {
            const track = (textTracks as unknown as {
                [index: number]: TextTrack;
            })[i];

            if (
                !track ||
                (track.kind !== "subtitles" && track.kind !== "captions")
            ) {
                continue;
            }

            track.mode =
                hasPlaybackStartedRef.current &&
                language !== "off" &&
                track.language === language
                    ? "showing"
                    : "disabled";
        }
    };

    useEffect(() => {
        let preference = "off";

        try {
            const saved = localStorage.getItem(subtitlePreferenceKey);

            if (saved === "off") {
                preference = "off";
            } else if (
                saved &&
                subtitles.some((subtitle) => subtitle.language === saved)
            ) {
                preference = saved;
            } else if (saved) {
                // Remove an outdated preference.
                localStorage.removeItem(subtitlePreferenceKey);
            }
        } catch (error) {
            console.warn("Could not restore subtitle preference:", error);
        }

        // Update the ref before the player initialization effect runs.
        selectedSubtitleRef.current = preference;
        setSelectedSubtitle(preference);

    }, [subtitlePreferenceKey, subtitles]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const id = String(videoId);
        hasPlaybackStartedRef.current = false;
        let restoredProgress = false;
        let restoringProgress = false;
        let disposed = false;
        let restoreTarget: number | null = null;
        let restoreAttempts = 0;
        let restoreSeekInFlight = false;
        let restoreRetryTimer: ReturnType<typeof setTimeout> | null = null;

        const videoElement = document.createElement("video-js");

        videoElement.classList.add(
            "vjs-big-play-centered",
            "vjs-fluid"
        );

        container.appendChild(videoElement);

        const player = videojs(videoElement, {
            controls: true,
            userActions: {
                click: false,
            },
            responsive: true,
            fluid: true,
            aspectRatio: "16:9",
            preload: "metadata",
            poster: poster || undefined,
            crossOrigin: "anonymous",
            playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
            sources: [
                {
                    src: hlsSrc || src,
                    type: hlsSrc ? "application/x-mpegURL" : "video/mp4",
                },
            ],
        });

        playerRef.current = player;
        const applySelectedSubtitle = () => {
            const tracks = player.textTracks();

            for (let i = 0; i < tracks.length; i++) {
                const track = (tracks as unknown as {
                    [index: number]: TextTrack;
                })[i];

                if (
                    !track ||
                    (track.kind !== "subtitles" && track.kind !== "captions")
                ) {
                    continue;
                }

                track.mode =
                    hasPlaybackStartedRef.current &&
                    selectedSubtitleRef.current !== "off" &&
                    track.language === selectedSubtitleRef.current
                        ? "showing"
                        : "disabled";
            }
        };

        const handlePlayerPlaying = () => {
            hasPlaybackStartedRef.current = true;
            applySelectedSubtitle();
        };
        player.on("playing", handlePlayerPlaying);

        const registerSubtitleTracks = () => {
            subtitles.forEach((subtitle) => {
                const tracks = player.textTracks();

                let alreadyRegistered = false;

                for (let i = 0; i < tracks.length; i++) {
                    const track = (tracks as unknown as {
                        [index: number]: TextTrack;
                    })[i];

                    if (
                        track &&
                        track.kind === "subtitles" &&
                        track.language === subtitle.language
                    ) {
                        alreadyRegistered = true;
                        break;
                    }
                }

                if (!alreadyRegistered) {
                    player.addRemoteTextTrack(
                        {
                            kind: "subtitles",
                            src: subtitle.src,
                            srclang: subtitle.language,
                            label: subtitle.label,
                            default: false,
                        },
                        false
                    );
                }
            });

            requestAnimationFrame(() => {
                if (disposed || player.isDisposed()) return;

                applySelectedSubtitle();
            });
        };
        const playerRoot = player.el();

        if (playerRoot instanceof HTMLElement) {
            setPlayerElement(playerRoot);
        }

        const handleSettingsButtonClick = () => {
            setSettingsSection("main");
            setIsSettingsOpen((current) => !current);
        };

        player.on("settingsbuttonclick", handleSettingsButtonClick);
        registerSettingsButton();
        addSkipButtons(player);

        player.ready(() => {
            if (player.isDisposed()) return;

            const nativeVideo = player.el()?.querySelector("video");

            if (nativeVideo instanceof HTMLVideoElement) {
                nativeVideo.disablePictureInPicture = false;
                nativeVideo.removeAttribute("disablepictureinpicture");
            }

            registerSubtitleTracks();

            const controlBar = player.getChild("controlBar");
            if (!controlBar) return;

            registerTimeDisplayButton();

            if (!controlBar.getChild("TimeDisplayButton")) {
                const progressControl = controlBar.getChild("progressControl");

                const progressIndex = progressControl
                    ? controlBar.children().indexOf(progressControl)
                    : 3;

                controlBar.addChild(
                    "TimeDisplayButton",
                    {},
                    progressIndex
                );
            }

            if (!controlBar.getChild("SettingsButton")) {
                controlBar.addChild(
                    "SettingsButton",
                    {},
                    controlBar.children().length - 1
                );
            }
        });

        const getProgress = () =>
            useVideoPlayerStore.getState().progressByVideo[id] ?? 0;

        const saveProgress = () => {
            if (
                disposed ||
                player.isDisposed() ||
                qualitySwitchingRef.current ||
                !restoredProgress ||
                restoringProgress ||
                player.seeking()
            ) {
                return;
            }

            const currentTime = player.currentTime();
            const duration = player.duration();

            if (
                typeof currentTime !== "number" ||
                !Number.isFinite(currentTime) ||
                currentTime <= 0 ||
                typeof duration !== "number" ||
                !Number.isFinite(duration) ||
                duration <= 0
            ) {
                return;
            }

            useVideoPlayerStore
                .getState()
                .setVideoProgress(id, currentTime);
        };

        const clearRestoreRetry = () => {
            if (restoreRetryTimer !== null) {
                clearTimeout(restoreRetryTimer);
                restoreRetryTimer = null;
            }
        };

        const completeRestore = () => {
            clearRestoreRetry();

            restoringProgress = false;
            restoredProgress = true;
            restoreSeekInFlight = false;
            restoreTarget = null;

            saveProgress();
        };

        const scheduleRestoreRetry = (delay: number) => {
            clearRestoreRetry();

            restoreRetryTimer = setTimeout(() => {
                restoreRetryTimer = null;
                restoreSeekInFlight = false;

                requestRestoreSeek();
            }, delay);
        };

        const requestRestoreSeek = () => {
            if (
                disposed ||
                player.isDisposed() ||
                !restoringProgress ||
                restoreTarget === null ||
                restoreSeekInFlight
            ) {
                return;
            }

            if (player.seeking()) {
                scheduleRestoreRetry(300);
                return;
            }

            const currentTime = player.currentTime();

            if (
                typeof currentTime === "number" &&
                Number.isFinite(currentTime) &&
                Math.abs(currentTime - restoreTarget) <= 1
            ) {
                completeRestore();
                return;
            }

            if (restoreAttempts >= 8) {
                return;
            }

            restoreAttempts += 1;
            restoreSeekInFlight = true;

            player.currentTime(restoreTarget);

            // اگر رویداد seeked نیامد، کمی صبر کن و دوباره بررسی کن.
            scheduleRestoreRetry(1500);
        };

        const restoreProgress = () => {
            if (
                disposed ||
                player.isDisposed() ||
                restoredProgress ||
                restoringProgress
            ) {
                return;
            }

            const duration = player.duration();

            if (
                player.readyState() < 1 ||
                typeof duration !== "number" ||
                !Number.isFinite(duration) ||
                duration <= 0
            ) {
                return;
            }

            const savedTime = getProgress();

            if (!Number.isFinite(savedTime) || savedTime <= 0) {
                restoredProgress = true;
                return;
            }

            if (duration - savedTime <= 10) {
                restoredProgress = true;
                return;
            }

            restoreTarget = Math.min(savedTime, duration - 10);
            restoreAttempts = 0;
            restoringProgress = true;

            requestRestoreSeek();
        };

        const handleSeeked = () => {
            if (disposed || player.isDisposed()) return;

            if (restoringProgress && restoreTarget !== null) {
                const currentTime = player.currentTime();

                if (
                    typeof currentTime === "number" &&
                    Number.isFinite(currentTime) &&
                    Math.abs(currentTime - restoreTarget) <= 1
                ) {
                    completeRestore();
                    return;
                }

                // این رویداد به زمان هدف نرسیده؛ یک بار دیگر
                // بعد از پایان رویداد فعلی تلاش می‌کنیم.
                restoreSeekInFlight = false;
                scheduleRestoreRetry(250);
                return;
            }

            if (!restoredProgress) {
                restoreProgress();
                return;
            }

            saveProgress();
        };

        const handleTimeUpdate = () => {
            if (
                qualitySwitchingRef.current ||
                restoringProgress ||
                !restoredProgress
            ) return;
            // حین بازیابی، timeupdate نباید مقدار قبلی را تغییر دهد.
            if (restoringProgress || !restoredProgress) return;

            saveProgress();
        };

        const handleRestoreCheck = () => {
            if (disposed || player.isDisposed()) return;

            if (!restoredProgress && !restoringProgress) {
                restoreProgress();
            }
        };

        const handleRateChange = () => {
            if (disposed || player.isDisposed()) return;

            const rate = player.playbackRate();
            if (typeof rate !== "number") return;

            const store = useVideoPlayerStore.getState();

            if (store.playbackRate !== rate) {
                store.setPlaybackRate(rate);
            }
        };

        const handleVolumeChange = () => {
            if (disposed || player.isDisposed()) return;

            const currentVolume = player.volume();
            const currentMuted = player.muted();
            const store = useVideoPlayerStore.getState();

            if (
                typeof currentVolume === "number" &&
                store.volume !== currentVolume
            ) {
                store.setVolume(currentVolume);
            }

            if (
                typeof currentMuted === "boolean" &&
                store.muted !== currentMuted
            ) {
                store.setMuted(currentMuted);
            }
        };

        const handleEnded = () => {
            if (disposed || player.isDisposed()) return;

            useVideoPlayerStore
                .getState()
                .setVideoProgress(id, 0);
        };

        player.on("loadedmetadata", restoreProgress);
        player.on("durationchange", restoreProgress);
        player.on("loadeddata", handleRestoreCheck);
        player.on("canplay", handleRestoreCheck);
        player.on("seeked", handleSeeked);
        player.on("timeupdate", handleTimeUpdate);
        player.on("pause", saveProgress);
        player.on("ended", handleEnded);
        player.on("ratechange", handleRateChange);
        player.on("volumechange", handleVolumeChange);
        player.on("loadedmetadata", registerSubtitleTracks);

        player.ready(() => {
            if (disposed || player.isDisposed()) return;

            const store = useVideoPlayerStore.getState();

            player.playbackRate(store.playbackRate);
            player.volume(store.volume);
            player.muted(store.muted);

            restoreProgress();
        });

        return () => {
            disposed = true;
            clearRestoreRetry();
            qualitySwitchCleanupRef.current?.();
            qualitySwitchCleanupRef.current = null;
            qualitySwitchingRef.current = false;
            pendingQualityRef.current = null;
            qualitySwitchTimeRef.current = null;
            qualitySwitchWasPlayingRef.current = null;

            if (!player.isDisposed()) {
                // هنگام cleanup فقط وقتی ذخیره می‌کنیم که
                // بازیابی قبلی واقعاً تکمیل شده باشد.
                if (
                    restoredProgress &&
                    !restoringProgress &&
                    !player.seeking()
                ) {
                    const currentTime = player.currentTime();
                    const duration = player.duration();

                    if (
                        typeof currentTime === "number" &&
                        Number.isFinite(currentTime) &&
                        currentTime > 0 &&
                        typeof duration === "number" &&
                        Number.isFinite(duration) &&
                        duration > 0
                    ) {
                        useVideoPlayerStore
                            .getState()
                            .setVideoProgress(id, currentTime);
                    }
                }

                player.off("loadedmetadata", restoreProgress);
                player.off("durationchange", restoreProgress);
                player.off("loadeddata", handleRestoreCheck);
                player.off("canplay", handleRestoreCheck);
                player.off("seeked", handleSeeked);
                player.off("timeupdate", handleTimeUpdate);
                player.off("pause", saveProgress);
                player.off("ended", handleEnded);
                player.off("ratechange", handleRateChange);
                player.off("volumechange", handleVolumeChange);
                player.off("settingsbuttonclick", handleSettingsButtonClick);
                player.off("loadedmetadata", registerSubtitleTracks);
                player.off("playing", handlePlayerPlaying);
                setPlayerElement(null);
                setIsSettingsOpen(false);

                player.dispose();
            }

            if (playerRef.current === player) {
                playerRef.current = null;
            }

            videoElement.remove();
        };
    }, [src, poster, videoId]);

    useEffect(() => {
        const player = playerRef.current;

        if (player && !player.isDisposed()) {
            if (player.playbackRate() !== playbackRate) {
                player.playbackRate(playbackRate);
            }
        }
    }, [playbackRate]);

    useEffect(() => {
        const player = playerRef.current;

        if (player && !player.isDisposed()) {
            if (player.volume() !== volume) {
                player.volume(volume);
            }
        }
    }, [volume]);

    useEffect(() => {
        const player = playerRef.current;

        if (player && !player.isDisposed()) {
            if (player.muted() !== muted) {
                player.muted(muted);
            }
        }
    }, [muted]);

    useEffect(() => {
        const hold = holdSpeedRef.current;

        if (hold.timer !== null) {
            clearTimeout(hold.timer);
            hold.timer = null;
        }

        return () => {
            if (feedbackTimerRef.current !== null) {
                clearTimeout(feedbackTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        return () => {
            if (singleTapTimerRef.current !== null) {
                clearTimeout(singleTapTimerRef.current);
            }

            if (desktopClickTimerRef.current !== null) {
                clearTimeout(desktopClickTimerRef.current);
            }

            if (playbackFeedbackTimerRef.current !== null) {
                clearTimeout(playbackFeedbackTimerRef.current);
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            data-vjs-player
            onTouchEnd={handlePlayerDoubleTap}
            onClick={handlePlayerClick}
            onDoubleClick={handlePlayerDoubleClick}
            onPointerDown={handleHoldStart}
            onPointerUp={handleHoldEnd}
            onPointerCancel={handleHoldEnd}
            className="relative w-full min-w-0 overflow-hidden rounded-lg bg-black sm:rounded-xl [&_.video-js]:bg-black"
        >
            {/* Mobile player header */}
            <div
                dir="ltr"
                className="mobile-player-header pointer-events-none absolute left-2 right-2 top-2 z-20 flex flex-row items-center justify-between gap-3"
            >
                {/* Settings button - Left */}
                <button
                    type="button"
                    onClick={() =>
                        playerRef.current?.trigger("settingsbuttonclick")
                    }
                    onPointerDown={(event) => event.stopPropagation()}
                    onTouchEnd={(event) => event.stopPropagation()}
                    aria-label={isPersian ? "تنظیمات" : "Settings"}
                    title={isPersian ? "تنظیمات" : "Settings"}
                    className="pointer-events-auto flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white shadow-md backdrop-blur-sm transition-colors hover:bg-black/80 active:bg-black"
                >
                    <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M10.3 2.8h3.4l.5 2.1a7.5 7.5 0 0 1 1.7.7l1.9-1.1 2.4 2.4-1.1 1.9a7.5 7.5 0 0 1 .7 1.7l2.1.5v3.4l-2.1.5a7.5 7.5 0 0 1-.7 1.7l1.1 1.9-2.4 2.4-1.9-1.1a7.5 7.5 0 0 1-1.7.7l-.5 2.1h-3.4l-.5-2.1a7.5 7.5 0 0 1-1.7-.7l-1.9 1.1-2.4-2.4 1.1-1.9a7.5 7.5 0 0 1-.7-1.7l-2.1-.5v-3.4l2.1-.5a7.5 7.5 0 0 1 .7-1.7L3.8 6.9l2.4-2.4 1.9 1.1a7.5 7.5 0 0 1 1.7-.7z" />
                        <circle cx="12" cy="12" r="3.1" />
                    </svg>
                </button>

                {/* Video title - Right */}
                <div
                    dir={isPersian ? "rtl" : "ltr"}
                    title={title}
                    className="pointer-events-auto min-w-0 flex-1 overflow-hidden"
                >
                    <span
                        className={`block truncate text-sm font-semibold text-white drop-shadow-md ${
                            isPersian ? "text-right" : "text-left"
                        }`}
                    >
                        {displayTitle}
                    </span>
                </div>
            </div>

            {/* Play / Pause feedback */}
            {playbackFeedback && (
                <div
                    key={playbackFeedback.id}
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
                >
                    <div className="playback-feedback-icon flex h-16 w-16 items-center justify-center rounded-full bg-black/65 text-white shadow-xl backdrop-blur-sm sm:h-20 sm:w-20">
                        {playbackFeedback.action === "play" ? (
                            <svg
                                viewBox="0 0 24 24"
                                className="ml-1 h-9 w-9 sm:h-11 sm:w-11"
                                fill="currentColor"
                            >
                                <path d="M7 4.5v15L19 12 7 4.5Z" />
                            </svg>
                        ) : (
                            <svg
                                viewBox="0 0 24 24"
                                className="h-9 w-9 sm:h-11 sm:w-11"
                                fill="currentColor"
                            >
                                <rect x="6" y="4" width="4.5" height="16" rx="1" />
                                <rect x="13.5" y="4" width="4.5" height="16" rx="1" />
                            </svg>
                        )}
                    </div>
                </div>
            )}

            {/* Settings portal */}
            {isSettingsOpen &&
                playerElement &&
                createPortal(
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 px-4 py-6 sm:absolute sm:inset-0 sm:flex sm:items-stretch sm:justify-end sm:bg-transparent sm:px-0 sm:py-0"
                        onClick={() => {
                            setIsSettingsOpen(false);
                            setSettingsSection("main");
                        }}
                    >
                        <div
                            className="relative max-h-[min(70vh,34rem)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto overscroll-contain rounded-2xl border border-white/15 bg-[#181818] p-3 font-sans text-white shadow-2xl backdrop-blur-md antialiased sm:absolute sm:bottom-[4.5rem] sm:right-3 sm:max-h-[calc(100%-5.5rem)] sm:w-[17rem] sm:p-3"
                            onClick={(event) => event.stopPropagation()}
                            onPointerDown={(event) => event.stopPropagation()}
                            onTouchEnd={(event) => event.stopPropagation()}
                        >
                            <div className="sticky top-0 z-10 -mx-1 mb-3 flex items-center gap-2 border-b border-white/15 bg-[#181818] px-1 pb-2 text-sm font-bold text-white">

                                {settingsSection !== "main" && (
                                    <button
                                        type="button"
                                        onClick={() => setSettingsSection("main")}
                                        aria-label={isPersian ? "بازگشت" : "Go back"}
                                        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-xl transition-colors hover:bg-white/10 active:bg-white/20"
                                    >
                                        {isPersian ? "→" : "←"}
                                    </button>
                                )}

                                <span className="flex-1">
                                    {settingsSection === "main"
                                        ? isPersian ? "تنظیمات" : "Settings"
                                        : settingsSection === "quality"
                                            ? isPersian ? "کیفیت" : "Quality"
                                            : settingsSection === "speed"
                                                ? isPersian ? "سرعت پخش" : "Playback speed"
                                                : isPersian ? "زیرنویس" : "Subtitles"}
                                </span>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsSettingsOpen(false);
                                        setSettingsSection("main");
                                    }}
                                    aria-label={isPersian ? "بستن تنظیمات" : "Close settings"}
                                    className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-xl text-white/70 transition-colors hover:bg-white/10 hover:text-white active:bg-white/20"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Main menu */}
                            {settingsSection === "main" && (
                                <div className="flex flex-col gap-1">
                                    {/* Quality */}
                                    <button
                                        type="button"
                                        onClick={() => setSettingsSection("quality")}
                                        dir={isPersian ? "rtl" : "ltr"}
                                        style={{
                                            display: "flex",
                                            flexDirection: "row",
                                            flexWrap: "nowrap",
                                            alignItems: "center",
                                            width: "100%",
                                        }}
                                        className="cursor-pointer gap-2 rounded-lg px-2.5 py-2.5 text-start transition-colors hover:bg-white/10 active:bg-white/20 sm:gap-3 sm:px-3 sm:py-3"
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            className="h-5 w-5 shrink-0"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M4 7h16M4 12h16M4 17h16" />
                                            <circle cx="8" cy="7" r="2" />
                                            <circle cx="15" cy="12" r="2" />
                                            <circle cx="10" cy="17" r="2" />
                                        </svg>

                                        <span className="shrink-0 whitespace-nowrap text-sm font-medium">
                                            {isPersian ? "کیفیت" : "Quality"}
                                        </span>

                                        <span className="min-w-0 flex-1 truncate text-end text-xs text-white/55">
                                            {selectedQuality === "auto"
                                                ? isPersian ? "خودکار" : "Auto"
                                                : (qualities.find(
                                                    (quality) =>
                                                        String(quality.resolution) === selectedQuality
                                                )?.label ?? `${selectedQuality}p`)}
                                        </span>

                                        <span className="text-lg text-white/45">
                                            {isPersian ? "‹" : "›"}
                                        </span>
                                    </button>

                                    {/* Playback speed */}
                                    <button
                                        type="button"
                                        onClick={() => setSettingsSection("speed")}
                                        dir={isPersian ? "rtl" : "ltr"}
                                        style={{
                                            display: "flex",
                                            flexDirection: "row",
                                            flexWrap: "nowrap",
                                            alignItems: "center",
                                            width: "100%",
                                        }}
                                        className="cursor-pointer gap-2 rounded-lg px-2.5 py-2.5 text-start transition-colors hover:bg-white/10 active:bg-white/20 sm:gap-3 sm:px-3 sm:py-3"
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            className="h-5 w-5 shrink-0"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <circle cx="12" cy="12" r="9" />
                                            <path d="M12 7v5l3 2" />
                                        </svg>

                                        <span className="shrink-0 whitespace-nowrap text-sm font-medium">
                                            {isPersian ? "سرعت پخش" : "Playback speed"}
                                        </span>

                                        <span className="min-w-0 flex-1 truncate text-end text-xs text-white/55">
                                            {playbackRate === 1
                                                ? isPersian ? "عادی" : "Normal"
                                                : `${playbackRate}×`}
                                        </span>

                                        <span className="shrink-0 text-lg text-white/45">
                                            {isPersian ? "‹" : "›"}
                                        </span>
                                    </button>

                                    {/* Subtitles */}
                                    <button
                                        type="button"
                                        onClick={() => setSettingsSection("subtitles")}
                                        dir={isPersian ? "rtl" : "ltr"}
                                        style={{
                                            display: "flex",
                                            flexDirection: "row",
                                            flexWrap: "nowrap",
                                            alignItems: "center",
                                            width: "100%",
                                        }}
                                        className="cursor-pointer gap-2 rounded-lg px-2.5 py-2.5 text-start transition-colors hover:bg-white/10 active:bg-white/20 sm:gap-3 sm:px-3 sm:py-3"
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            className="h-5 w-5 shrink-0"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <rect x="3" y="5" width="18" height="14" rx="2" />
                                            <path d="M7 10h4M7 14h3M14 10h3M14 14h3" />
                                        </svg>

                                        <span className="shrink-0 whitespace-nowrap text-sm font-medium">
                                            {isPersian ? "زیرنویس" : "Subtitles"}
                                        </span>

                                        <span className="min-w-0 flex-1 truncate text-end text-xs text-white/55">
                                            {selectedSubtitle === "off"
                                                ? isPersian ? "خاموش" : "Off"
                                                : subtitles.find(
                                                    (subtitle) =>
                                                        subtitle.language === selectedSubtitle
                                                )?.label ?? selectedSubtitle}
                                        </span>

                                        <span className="shrink-0 text-lg text-white/45">
                                            {isPersian ? "‹" : "›"}
                                        </span>
                                    </button>
                                </div>
                            )}

                            {/* Subtitles section */}
                            {settingsSection === "subtitles" && (
                                <div className="flex flex-col gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            handleSubtitleChange("off");
                                            setSettingsSection("main");
                                        }}
                                        aria-pressed={selectedSubtitle === "off"}
                                        className={`w-full cursor-pointer rounded-lg border px-3 py-3 text-start text-sm font-semibold transition-colors ${
                                            selectedSubtitle === "off"
                                                ? "border-white bg-white text-black"
                                                : "border-white/10 bg-white/[0.05] text-white hover:bg-white/15"
                                        }`}
                                    >
                                        <span className="flex items-center justify-between">
                                            {isPersian ? "خاموش" : "Off"}
                                            {selectedSubtitle === "off" && "✓"}
                                        </span>
                                    </button>

                                    {subtitles.map((subtitle) => {
                                        const isSelected =
                                            selectedSubtitle === subtitle.language;

                                        return (
                                            <button
                                                key={subtitle.language}
                                                type="button"
                                                onClick={() => {
                                                    handleSubtitleChange(subtitle.language);
                                                    setSettingsSection("main");
                                                }}
                                                aria-pressed={isSelected}
                                                className={`w-full cursor-pointer rounded-lg border px-3 py-3 text-start text-sm font-semibold transition-colors ${
                                                    isSelected
                                                        ? "border-white bg-white text-black"
                                                        : "border-white/10 bg-white/[0.05] text-white hover:bg-white/15"
                                                }`}
                                            >
                                                <span className="flex items-center justify-between">
                                                    {subtitle.label}
                                                    {isSelected && "✓"}
                                                </span>
                                            </button>
                                        );
                                    })}

                                    {subtitles.length === 0 && (
                                        <p className="px-3 py-3 text-xs leading-5 text-white/50">
                                            {isPersian
                                                ? "زیرنویسی برای این ویدئو موجود نیست."
                                                : "No subtitles available."}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Playback speed section */}
                            {settingsSection === "speed" && (
                                <div className="grid grid-cols-3 gap-2">

                                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                                        <button
                                            key={rate}
                                            type="button"
                                            onClick={() => {
                                                handlePlaybackRateChange(rate);
                                                setSettingsSection("main");
                                            }}
                                            aria-pressed={playbackRate === rate}
                                            className={`cursor-pointer rounded-lg border px-2 py-3 text-sm font-medium transition-colors ${
                                                playbackRate === rate
                                                    ? "border-white bg-white text-black"
                                                    : "border-white/15 bg-white/[0.07] text-white/90 hover:bg-white/20"
                                            }`}
                                        >
                                            {rate}×

                                            {rate === 1 && (
                                                <span className="block text-[10px] font-medium">
                                                    {isPersian ? "عادی" : "Normal"}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Video quality section */}
                            {settingsSection === "quality" && (
                                <div className="flex flex-col gap-2">
                                    {[
                                        {
                                            value: "auto",
                                            label: isPersian ? "خودکار" : "Auto",
                                        },
                                        ...qualities.map((quality) => ({
                                            value: String(quality.resolution),
                                            label: quality.label,
                                        })),
                                    ].map((quality) => {
                                        const isSelected =
                                            selectedQuality === quality.value;

                                        return (
                                            <button
                                                key={quality.value}
                                                type="button"
                                                onClick={() => {
                                                    handleQualityChange(quality.value);
                                                    setSettingsSection("main");
                                                }}
                                                aria-pressed={isSelected}
                                                className={`w-full cursor-pointer rounded-lg border px-3 py-3 text-start text-sm font-semibold transition-colors ${
                                                    isSelected
                                                        ? "border-white bg-white text-black"
                                                        : "border-white/10 bg-white/[0.05] text-white hover:bg-white/15"
                                                }`}
                                            >
                                                <span className="flex items-center justify-between">
                                                    {quality.label}
                                                    {isSelected && "✓"}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>,
                    playerElement
                )}

            {skipFeedback && (
                <div
                    key={skipFeedback.id}
                    className={`pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/70 px-5 py-3 text-white ${
                        skipFeedback.direction === "backward"
                            ? "left-[15%]"
                            : "right-[15%]"
                    }`}
                >
                    {skipFeedback.direction === "backward"
                        ? "⏪ −10s"
                        : "+10s ⏩"}
                </div>
            )}

            {isFastForwarding && (
                <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 rounded-2xl bg-black/65 px-7 py-5 text-white shadow-lg backdrop-blur-sm">
                        <span className="text-3xl font-bold">2x</span>
                        <span className="text-sm font-medium">
                            {isPersian ? "جلو رفتن سریع" : "Fast forward"}
                        </span>
                        <div className="flex gap-1">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white [animation-delay:150ms]" />
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white [animation-delay:300ms]" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}