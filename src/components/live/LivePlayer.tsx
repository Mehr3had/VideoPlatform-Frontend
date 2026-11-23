"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import videojs from "video.js";
import type Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";

interface LiveTrackerApi {
    isLive: () => boolean;
    liveCurrentTime: () => number;
    seekToLiveEdge: () => void;
}

type PlayerWithLiveTracker = Player & {
    liveTracker?: LiveTrackerApi;
};

interface LivePlayerProps {
    src: string;
    errorText: string;
}

function formatLiveDelay(seconds: number) {
    const safeSeconds = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function SkipIcon({ direction }: { direction: "backward" | "forward" }) {
    const isBackward = direction === "backward";

    return (
        <svg
            viewBox="0 0 32 32"
            className="h-6 w-6"
            aria-hidden="true"
            focusable="false"
        >
            <g
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                {isBackward ? (
                    <>
                        <path d="M20 7 A12 12 0 1 0 23 20" />
                        <path d="M20 3 V10 H27" />
                    </>
                ) : (
                    <>
                        <path d="M12 7 A12 12 0 1 1 9 20" />
                        <path d="M12 3 V10 H5" />
                    </>
                )}
            </g>
            <text
                x={isBackward ? 10 : 22}
                y="21"
                textAnchor="middle"
                fontFamily="Arial, sans-serif"
                fontSize="10"
                fontWeight="700"
                fill="currentColor"
                stroke="none"
                textLength="12"
                lengthAdjust="spacingAndGlyphs"
            >
                10
            </text>
        </svg>
    );
}

export default function LivePlayer({ src, errorText }: LivePlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<Player | null>(null);

    const [hasError, setHasError] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [seekStart, setSeekStart] = useState(0);
    const [seekEnd, setSeekEnd] = useState(0);
    const [behindLiveSeconds, setBehindLiveSeconds] = useState<number | null>(null);
    const [volume, setVolume] = useState(1);
    const [muted, setMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isPiP, setIsPiP] = useState(false);

    const updatePlayerState = useCallback(() => {
        const player = playerRef.current;
        if (!player || player.isDisposed()) return;

        const livePlayer = player as PlayerWithLiveTracker;
        const tracker = livePlayer.liveTracker;
        const current = player.currentTime();

        if (current !== undefined && Number.isFinite(current)) {
            setCurrentTime(current);
        }

        const ranges = player.seekable();

        if (ranges.length > 0) {
            const start = ranges.start(0);
            const end = ranges.end(ranges.length - 1);

            if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
                setSeekStart(Math.max(start, end - 70));
                setSeekEnd(end);

                const liveTime = tracker?.isLive()
                    ? tracker.liveCurrentTime()
                    : end;

                const delay = Math.max(0, Math.round(liveTime - (current ?? end)));
                setBehindLiveSeconds(delay >= 3 ? delay : null);
            }
        } else {
            setSeekStart(0);
            setSeekEnd(0);
            setBehindLiveSeconds(null);
        }

        setVolume(player.volume() ?? 1);
        setMuted(player.muted() ?? false);
        setIsPlaying(!player.paused());
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || !src) return;

        setHasError(false);
        setIsPlaying(false);
        setCurrentTime(0);
        setSeekStart(0);
        setSeekEnd(0);
        setBehindLiveSeconds(null);

        const videoElement = document.createElement("video-js");
        videoElement.classList.add("vjs-fluid");
        videoElement.style.setProperty("--vjs-theme-color", "#8b5cf6");
        container.appendChild(videoElement);

        const player = videojs(videoElement, {
            controls: false,
            responsive: true,
            fluid: true,
            aspectRatio: "16:9",
            preload: "auto",
            liveui: true,
            liveTracker: {
                trackingThreshold: 5,
                liveTolerance: 5,
            },
            autoplay: false,
            sources: [
                {
                    src,
                    type: "application/x-mpegURL",
                },
            ],
        });

        playerRef.current = player;

        const handleError = () => setHasError(true);
        const handlePlaying = () => {
            setHasError(false);
            setIsPlaying(true);
            updatePlayerState();
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        const handleFullscreenChange = () => {
            const shell = container.parentElement;
            setIsFullscreen(
                !!shell && document.fullscreenElement === shell
            );
        };

        const handleEnterPiP = () => setIsPiP(true);
        const handleLeavePiP = () => setIsPiP(false);

        player.on("error", handleError);
        player.on("playing", handlePlaying);
        player.on("play", handlePlay);
        player.on("pause", handlePause);
        player.on("timeupdate", updatePlayerState);
        player.on("seeked", updatePlayerState);
        player.on("durationchange", updatePlayerState);
        player.on("progress", updatePlayerState);
        player.on("loadedmetadata", updatePlayerState);
        document.addEventListener("fullscreenchange", handleFullscreenChange);

        const video = player.el()?.querySelector("video");

        video?.addEventListener("enterpictureinpicture", handleEnterPiP);
        video?.addEventListener("leavepictureinpicture", handleLeavePiP);

        const interval = window.setInterval(updatePlayerState, 500);

        return () => {
            window.clearInterval(interval);

            player.off("error", handleError);
            player.off("playing", handlePlaying);
            player.off("play", handlePlay);
            player.off("pause", handlePause);
            player.off("timeupdate", updatePlayerState);
            player.off("seeked", updatePlayerState);
            player.off("durationchange", updatePlayerState);
            player.off("progress", updatePlayerState);
            player.off("loadedmetadata", updatePlayerState);
            document.removeEventListener("fullscreenchange", handleFullscreenChange);

            video?.removeEventListener("enterpictureinpicture", handleEnterPiP);
            video?.removeEventListener("leavepictureinpicture", handleLeavePiP);

            if (!player.isDisposed()) {
                player.dispose();
            }

            if (playerRef.current === player) {
                playerRef.current = null;
            }
        };
    }, [src, updatePlayerState]);

    const seekTo = (time: number) => {
        const player = playerRef.current;
        if (!player || player.isDisposed()) return;

        const target = Math.min(
            seekEnd,
            Math.max(seekStart, time)
        );

        player.currentTime(target);
        updatePlayerState();
    };

    const rewind = () => {
        const player = playerRef.current;
        if (!player || player.isDisposed()) return;

        const current = player.currentTime() ?? seekEnd;
        seekTo(current - 10);
    };

    const forward = () => {
        const player = playerRef.current;
        if (!player || player.isDisposed()) return;

        const current = player.currentTime() ?? seekEnd;
        seekTo(current + 10);
    };

    const goLive = () => {
        const player = playerRef.current;
        if (!player || player.isDisposed()) return;

        const tracker = (player as PlayerWithLiveTracker).liveTracker;

        if (tracker?.isLive()) {
            tracker.seekToLiveEdge();
        } else {
            seekTo(seekEnd);
        }

        window.setTimeout(updatePlayerState, 300);
    };

    const togglePlayback = async () => {
        const player = playerRef.current;
        if (!player || player.isDisposed()) return;

        try {
            if (player.paused()) {
                await player.play();
            } else {
                player.pause();
            }
        } catch {
            // Playback may be blocked by browser autoplay policies.
        }
    };

    const toggleMute = () => {
        const player = playerRef.current;
        if (!player) return;

        player.muted(!player.muted());
        updatePlayerState();
    };

    const changeVolume = (value: number) => {
        const player = playerRef.current;
        if (!player) return;

        player.volume(value);
        player.muted(value === 0);
        updatePlayerState();
    };

    const toggleFullscreen = async () => {
        const shell = containerRef.current?.parentElement;
        if (!shell) return;

        try {
            if (document.fullscreenElement === shell) {
                await document.exitFullscreen();
            } else {
                await shell.requestFullscreen();
            }
        } catch {
            // Fullscreen may be unavailable in some browser contexts.
        }
    };

    const togglePiP = async () => {
        const player = playerRef.current;
        const video = player?.el()?.querySelector("video");

        if (!video) return;

        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else if (document.pictureInPictureEnabled && video.requestPictureInPicture) {
                await video.requestPictureInPicture();
            }
        } catch {
            // Picture-in-picture may be unavailable in some browser contexts.
        }
    };

    const seekRange = Math.max(0, seekEnd - seekStart);
    const sliderValue = Math.min(
        seekRange,
        Math.max(0, currentTime - seekStart)
    );
    const progressPercent = seekRange > 0
        ? (sliderValue / seekRange) * 100
        : 0;

    const isAtLiveEdge = behindLiveSeconds === null;

    return (
        <div className="live-player-shell relative w-full overflow-hidden rounded-2xl bg-black">
            <div
                ref={containerRef}
                data-vjs-player
                className="w-full"
            />

            {hasError && (
                <p
                    role="alert"
                    className="px-4 py-3 text-sm text-amber-300"
                >
                    {errorText}
                </p>
            )}

            <div className="space-y-1.5 bg-[#101010] px-2.5 py-2 text-white sm:space-y-2 sm:px-4 sm:py-3">
                <div dir="ltr" className="relative flex h-4 items-center sm:h-5">
                    <div className="absolute h-1 w-full overflow-hidden rounded-full bg-white/20 sm:h-1.5">
                        <div
                            className="h-full rounded-full bg-violet-500"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>

                    <input
                        aria-label="موقعیت پخش زنده"
                        type="range"
                        min={0}
                        max={Math.max(seekRange, 0.1)}
                        step={0.25}
                        value={sliderValue}
                        disabled={seekRange <= 0}
                        onChange={(event) => {
                            seekTo(seekStart + Number(event.target.value));
                        }}
                        className="live-dvr-slider absolute inset-0 h-full w-full cursor-pointer touch-pan-y disabled:cursor-not-allowed"
                    />
                </div>

                <div dir="ltr" className="live-player-controls-row flex flex-nowrap items-center justify-between gap-1 sm:flex-wrap sm:gap-x-3 sm:gap-y-3">
                    <div className="live-player-main-controls flex min-w-0 flex-1 flex-nowrap items-center gap-1 sm:flex-wrap sm:flex-initial sm:gap-2">

                        {/* Play / Pause */}
                        <button
                            type="button"
                            onClick={() => void togglePlayback()}
                            aria-label={isPlaying ? "Pause" : "Play"}
                            title={isPlaying ? "Pause" : "Play"}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-white transition hover:bg-white/15 active:scale-95 sm:h-9 sm:w-9"
                        >
                            {isPlaying ? (
                                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                                    <rect x="6" y="4" width="4" height="16" rx="1" />
                                    <rect x="14" y="4" width="4" height="16" rx="1" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                                    <path d="M8 5.5a1 1 0 0 1 1.52-.85l10 6.5a1 1 0 0 1 0 1.7l-10 6.5A1 1 0 0 1 8 18.5z" />
                                </svg>
                            )}
                        </button>

                        {/* Volume */}
                        <button
                            type="button"
                            onClick={toggleMute}
                            aria-label={muted ? "Unmute" : "Mute"}
                            title={muted ? "Unmute" : "Mute"}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-white transition hover:bg-white/15 active:scale-95 sm:h-9 sm:w-9"
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
                                <path d="M11 5 6 9H3v6h3l5 4V5Z" />
                                {muted || volume === 0 ? (
                                    <>
                                        <path d="m16 9 5 6" />
                                        <path d="m21 9-5 6" />
                                    </>
                                ) : volume < 0.5 ? (
                                    <path d="M15 9a5 5 0 0 1 0 6" />
                                ) : (
                                    <>
                                        <path d="M15 9a5 5 0 0 1 0 6" />
                                        <path d="M18 6a9 9 0 0 1 0 12" />
                                    </>
                                )}
                            </svg>
                        </button>

                        {/* Custom volume slider */}
                        <input
                            aria-label="Volume"
                            title={`Volume: ${Math.round((muted ? 0 : volume) * 100)}%`}
                            type="range"
                            min={0}
                            max={1}
                            step={0.05}
                            value={muted ? 0 : volume}
                            onChange={(event) => changeVolume(Number(event.target.value))}
                            style={{
                                background: `linear-gradient(to right, #8b5cf6 ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.25) ${(muted ? 0 : volume) * 100}%) center / 100% 5px no-repeat`,
                            }}
                            className="live-volume-slider hidden h-5 w-20 cursor-pointer sm:block sm:w-28"
                        />

                        {/* Live delay */}
                        {behindLiveSeconds !== null && (
                            <span
                                dir="ltr"
                                className="hidden min-w-[48px] px-1 text-center font-mono text-xs font-semibold text-violet-300 sm:inline-flex"
                                title="Delay behind live"
                            >
                                −{formatLiveDelay(behindLiveSeconds)}
                            </span>
                        )}

                        {/* Go to live */}
                        <button
                            type="button"
                            onClick={goLive}
                            disabled={isAtLiveEdge}
                            aria-label="Go to live"
                            title="Go to live"
                            className={`order-5 sm:order-none flex h-8 shrink-0 items-center gap-1.5 rounded-full px-2 text-xs font-bold transition active:scale-95 sm:h-9 sm:px-3 ${
                                isAtLiveEdge
                                    ? "bg-red-500/10 text-red-400"
                                    : "bg-red-600 text-white hover:bg-red-500"
                            }`}
                        >
                            <span className={`h-2 w-2 rounded-full ${
                                isAtLiveEdge ? "animate-pulse bg-red-500" : "bg-white"
                            }`} />
                            LIVE
                        </button>

                        {/* Forward 10 seconds */}
                        <button
                            type="button"
                            onClick={rewind}
                            disabled={seekRange <= 0 || currentTime <= seekStart}
                            aria-label="Back 10 seconds"
                            title="Back 10 seconds"
                            className="order-3 sm:order-none flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-white transition hover:bg-white/15 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 sm:h-9 sm:w-10"
                        >
                            <SkipIcon direction="backward" />
                        </button>

                        {/* Backward 10 seconds */}
                        <button
                            type="button"
                            onClick={forward}
                            disabled={seekRange <= 0 || currentTime >= seekEnd - 0.5}
                            aria-label="Forward 10 seconds"
                            title="Forward 10 seconds"
                            className="order-4 sm:order-none flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-white transition hover:bg-white/15 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 sm:h-9 sm:w-10"
                        >
                            <SkipIcon direction="forward" />
                        </button>
                    </div>

                    {/* Picture in Picture / Fullscreen */}
                    <div className="live-player-secondary-controls flex shrink-0 items-center gap-1 sm:gap-2">
                        <button
                            type="button"
                            onClick={togglePiP}
                            aria-label="Picture in picture"
                            title="Picture in picture"
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 transition hover:bg-white/15 active:scale-95 sm:h-9 sm:w-9 ${
                                isPiP ? "text-violet-400" : "text-white"
                            }`}
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
                                <rect x="3" y="4" width="18" height="16" rx="2" />
                                <rect x="11" y="12" width="9" height="6" rx="1" />
                            </svg>
                        </button>

                        <button
                            type="button"
                            onClick={toggleFullscreen}
                            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-white transition hover:bg-white/15 active:scale-95 sm:h-9 sm:w-9"
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
                                {isFullscreen ? (
                                    <path d="M8 3v5H3 M21 8h-5V3 M16 21v-5h5 M3 16h5v5" />
                                ) : (
                                    <path d="M8 3H3v5 M16 3h5v5 M21 16v5h-5 M3 16v5h5" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .live-player-shell .video-js {
                    --vjs-theme-color: #8b5cf6;
                }

                .live-player-shell .live-dvr-slider,
                .live-player-shell .live-volume-slider {
                    appearance: none;
                    -webkit-appearance: none;
                    background: transparent;
                    accent-color: #8b5cf6;
                }

                .live-player-shell .live-dvr-slider::-webkit-slider-thumb,
                .live-player-shell .live-volume-slider::-webkit-slider-thumb {
                    appearance: none;
                    -webkit-appearance: none;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: #8b5cf6;
                    border: 2px solid white;
                    box-shadow: 0 0 0 2px #8b5cf6;
                }

                .live-player-shell .live-dvr-slider::-moz-range-thumb,
                .live-player-shell .live-volume-slider::-moz-range-thumb {
                    width: 9px;
                    height: 9px;
                    border-radius: 50%;
                    background: #8b5cf6;
                    border: 2px solid white;
                }

                .live-player-shell .live-dvr-slider:focus-visible,
                .live-player-shell button:focus-visible {
                    outline: 2px solid #a78bfa;
                    outline-offset: 3px;
                }
                .live-player-shell .live-dvr-slider::-webkit-slider-runnable-track {
                    height: 4px;
                    border-radius: 9999px;
                    background: transparent;
                }

                .live-player-shell .live-dvr-slider::-moz-range-track {
                    height: 4px;
                    border-radius: 9999px;
                    background: transparent;
                }

                .live-player-shell .live-dvr-slider::-moz-range-progress {
                    background: transparent;
                }

                .live-player-shell .live-volume-slider::-webkit-slider-runnable-track {
                    height: 5px;
                    border-radius: 9999px;
                    background: transparent;
                }

                .live-player-shell .live-volume-slider::-moz-range-track {
                    height: 5px;
                    border-radius: 9999px;
                    background: transparent;
                }
            `}</style>
        </div>
    );
}
