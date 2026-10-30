"use client";

import { useVideoPlayerStore } from "@/stores/useVideoPlayerStore";

export default function VideoPlayerSettings() {
    const playbackRate = useVideoPlayerStore(
        (state) => state.playbackRate
    );
    const volume = useVideoPlayerStore(
        (state) => state.volume
    );
    const muted = useVideoPlayerStore(
        (state) => state.muted
    );

    const setPlaybackRate = useVideoPlayerStore(
        (state) => state.setPlaybackRate
    );
    const setVolume = useVideoPlayerStore(
        (state) => state.setVolume
    );
    const setMuted = useVideoPlayerStore(
        (state) => state.setMuted
    );

    return (
        <div className="mt-4 space-y-4 rounded-xl border border-gray-200 p-4 dark:border-[#404040]">
            <div>
                <label className="mb-2 block text-sm">
                    Playback speed: {playbackRate}x
                </label>

                <select
                    value={playbackRate}
                    onChange={(event) =>
                        setPlaybackRate(Number(event.target.value))
                    }
                    className="rounded-lg border p-2 dark:bg-[#202020]"
                >
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                        <option key={rate} value={rate}>
                            {rate}x
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="mb-2 block text-sm">
                    Volume: {Math.round(volume * 100)}%
                </label>

                <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={volume}
                    onChange={(event) =>
                        setVolume(Number(event.target.value))
                    }
                    className="w-full"
                />
            </div>

            <label className="flex items-center gap-2 text-sm">
                <input
                    type="checkbox"
                    checked={muted}
                    onChange={(event) => setMuted(event.target.checked)}
                />
                Mute
            </label>
        </div>
    );
}