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
    poster?: string | null;
    videoId: string | number;
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

export default function VideoPlayer({
    src,
    poster,
    videoId,
    subtitles,
    qualities,
}: VideoPlayerProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const playerRef = useRef<ReturnType<typeof videojs> | null>(null);
    const { isPersian } = useLanguage();
    const [skipFeedback, setSkipFeedback] = useState<{
        direction: "backward" | "forward";
        id: number;
    } | null>(null);

    const [isFastForwarding, setIsFastForwarding] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [selectedSubtitle, setSelectedSubtitle] = useState("off");
    const selectedSubtitleRef = useRef("off");
    const [playerElement, setPlayerElement] = useState<HTMLElement | null>(null);
    const [selectedQuality, setSelectedQuality] = useState("auto");
    const pendingQualityRef = useRef<string | null>(null);
    const activeQualityRef = useRef("auto");
    const lastCompletedQualityRef = useRef("auto");
    const qualitySwitchCleanupRef = useRef<(() => void) | null>(null);

    const lastTapRef = useRef<{
        time: number;
        side: "left" | "right";
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

    const handlePlayerDoubleTap = useCallback(
        (event: React.TouchEvent<HTMLDivElement>) => {
            const target = event.target;

            if (
                target instanceof Element &&
                target.closest(".vjs-control-bar, .vjs-big-play-button")
            ) {
                lastTapRef.current = null;
                return;
            }

            const now = Date.now();
            const touch = event.changedTouches[0];

            if (!touch) return;

            const bounds = event.currentTarget.getBoundingClientRect();
            const side =
                touch.clientX < bounds.left + bounds.width / 2
                    ? "left"
                    : "right";

            const previousTap = lastTapRef.current;

            if (
                previousTap &&
                previousTap.side === side &&
                now - previousTap.time < 300
            ) {
                lastTapRef.current = null;
                skip(side === "left" ? -10 : 10);
                return;
            }

            lastTapRef.current = {
                time: now,
                side,
            };
        },
        [skip]
    );

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
                ? src
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
                    type: "video/mp4",
                });
            } catch {
                handleSwitchError();
            }
        };

        // فقط اولین درخواست، تعویض واقعی را شروع می‌کند.
        startSwitch(quality);
    };

    const handleSubtitleChange = (language: string) => {
        const player = playerRef.current;

        if (!player || player.isDisposed()) return;

        selectedSubtitleRef.current = language;

        const textTracks = player.textTracks();

        console.log(
            "Text tracks:",
            Array.from({ length: textTracks.length }, (_, i) => {
                const track = (textTracks as unknown as {
                    [index: number]: TextTrack;
                })[i];

                return track
                    ? {
                        kind: track.kind,
                        language: track.language,
                        label: track.label,
                        mode: track.mode,
                    }
                    : null;
            })
        );

        // Video.js TextTrackList را با رویدادهای addtrack و length می‌خوانیم.
        const tracks: TextTrack[] = [];

        for (let i = 0; i < textTracks.length; i++) {
            const track = (textTracks as unknown as {
                [index: number]: TextTrack;
            })[i];

            if (track) {
                tracks.push(track);
            }
        }

        tracks.forEach((track) => {
            if (track.kind !== "subtitles" && track.kind !== "captions") {
                return;
            }

            track.mode =
                language !== "off" && track.language === language
                    ? "showing"
                    : "disabled";
        });

        setSelectedSubtitle(language);

        console.log(
            "Subtitle tracks after selection:",
            Array.from(
                { length: player.textTracks().length },
                (_, i) => {
                    const track = (
                        player.textTracks() as unknown as {
                            [index: number]: TextTrack;
                        }
                    )[i];

                    return track
                        ? {
                            kind: track.kind,
                            language: track.language,
                            mode: track.mode,
                        }
                        : null;
                }
            )
        );
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const id = String(videoId);

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
            responsive: true,
            fluid: true,
            aspectRatio: "16:9",
            preload: "metadata",
            poster: poster || undefined,
            crossOrigin: "anonymous",
            playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
            sources: [{ src }],
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
                    selectedSubtitleRef.current !== "off" &&
                    track.language === selectedSubtitleRef.current
                        ? "showing"
                        : "disabled";
            }
        };

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
            setIsSettingsOpen((current) => !current);
        };

        player.on("settingsbuttonclick", handleSettingsButtonClick);
        registerSettingsButton();
        addSkipButtons(player);

        player.ready(() => {
            if (player.isDisposed()) return;

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
                setPlayerElement(null);
                setIsSettingsOpen(false);

                player.dispose();
            }

            if (playerRef.current === player) {
                playerRef.current = null;
            }

            container.replaceChildren();
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

    return (
        <div
            ref={containerRef}
            data-vjs-player
            onTouchEnd={handlePlayerDoubleTap}
            onPointerDown={handleHoldStart}
            onPointerUp={handleHoldEnd}
            onPointerCancel={handleHoldEnd}
            className="relative w-full overflow-hidden rounded-xl bg-black [&_.video-js]:bg-black"
        >
            {isSettingsOpen &&
                playerElement &&
                createPortal(
                    <div
                        className="absolute bottom-14 right-3 z-30 w-64 rounded-xl border border-white/15 bg-[#181818]/95 p-3 font-sans text-white shadow-2xl backdrop-blur-md antialiased"
                        dir={isPersian ? "rtl" : "ltr"}
                        onPointerDown={(event) => event.stopPropagation()}
                        onTouchEnd={(event) => event.stopPropagation()}
                    >
                        <div className="mb-3 border-b border-white/15 pb-2 text-sm font-bold tracking-tight text-white">
                            {isPersian ? "تنظیمات پخش" : "Playback settings"}
                        </div>

                        <div className="mb-2 text-xs font-semibold text-white/80">
                            {isPersian ? "سرعت پخش" : "Playback speed"}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                                <button
                                    key={rate}
                                    type="button"
                                    onClick={() => handlePlaybackRateChange(rate)}
                                    aria-pressed={playbackRate === rate}
                                    className={`cursor-pointer rounded-lg border px-2 py-2 text-sm font-medium transition-colors duration-150 ${
                                        playbackRate === rate
                                            ? "border-white bg-white text-black shadow-[0_0_12px_rgba(255,255,255,0.3)] ring-1 ring-white/50"
                                            : "border-white/15 bg-white/[0.07] text-white/90 hover:border-white/50 hover:bg-white/20"
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

                        <div className="mb-2 mt-4 text-xs font-semibold text-white/80">
                            {isPersian ? "کیفیت ویدئو" : "Video quality"}
                        </div>

                        <div className="flex flex-col gap-1">
                            {[
                                { value: "auto", label: isPersian ? "خودکار" : "Auto" },
                                ...qualities.map((quality) => ({
                                    value: String(quality.resolution),
                                    label: quality.label,
                                })),
                            ].map((quality) => (
                                <button
                                    key={quality.value}
                                    type="button"
                                    onClick={() => handleQualityChange(quality.value)}
                                    aria-pressed={selectedQuality === quality.value}
                                    className={`cursor-pointer rounded-lg border px-3 py-2 text-start text-sm font-semibold transition-all duration-150 ${
                                    selectedQuality === quality.value
                                        ? "border-white bg-white text-black shadow-[0_0_12px_rgba(255,255,255,0.3)] ring-1 ring-white/50"
                                        : "border-white/10 text-white/90 hover:border-white/40 hover:bg-white/15"
                                    }`}
                                >
                                    {quality.label}
                                </button>
                            ))}
                        </div>

                        <div className="mb-2 mt-4 text-xs font-semibold text-white/80">
                            {isPersian ? "زیرنویس" : "Subtitles"}
                        </div>

                        <div className="flex flex-col gap-1">
                            <button
                                type="button"
                                onClick={() => handleSubtitleChange("off")}
                                aria-pressed={selectedSubtitle === "off"}
                                className={`cursor-pointer rounded-lg border px-3 py-2 text-start text-sm font-semibold transition-all duration-150 ${
                                    selectedSubtitle === "off"
                                        ? "border-white bg-white text-black shadow-[0_0_12px_rgba(255,255,255,0.3)] ring-1 ring-white/50"
                                        : "border-white/10 text-white/90 hover:border-white/40 hover:bg-white/15"
                                }`}
                            >
                                {isPersian ? "خاموش" : "Off"}
                            </button>

                            {subtitles.map((subtitle) => {
                                const isSelected = selectedSubtitle === subtitle.language;

                                return (
                                    <button
                                        key={subtitle.language}
                                        type="button"
                                        onClick={() => handleSubtitleChange(subtitle.language)}
                                        aria-pressed={isSelected}
                                        className={`cursor-pointer rounded-lg border px-3 py-2 text-start text-sm font-semibold transition-all duration-150 ${
                                            isSelected
                                                ? "border-white bg-white text-black shadow-[0_0_12px_rgba(255,255,255,0.3)] ring-1 ring-white/50"
                                                : "border-white/10 text-white/90 hover:border-white/40 hover:bg-white/15"
                                        }`}
                                    >
                                        {subtitle.label}
                                    </button>
                                );
                            })}

                            {subtitles.length === 0 && (
                                <p className="px-3 py-2 text-xs leading-5 text-white/50">
                                    {isPersian
                                        ? "زیرنویسی برای این ویدئو موجود نیست."
                                        : "No subtitles available."}
                                </p>
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