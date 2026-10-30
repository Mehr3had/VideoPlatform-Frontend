import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface VideoPlayerState {
    playbackRate: number;
    volume: number;
    muted: boolean;
    progressByVideo: Record<string, number>;

    setPlaybackRate: (rate: number) => void;
    setVolume: (volume: number) => void;
    setMuted: (muted: boolean) => void;
    setVideoProgress: (videoId: string, seconds: number) => void;
}

export const useVideoPlayerStore = create<VideoPlayerState>()(
    persist(
        (set) => ({
            playbackRate: 1,
            volume: 1,
            muted: false,
            progressByVideo: {},

            setPlaybackRate: (playbackRate) => set({ playbackRate }),

            setVolume: (volume) => set({ volume }),

            setMuted: (muted) => set({ muted }),

            setVideoProgress: (videoId, seconds) =>
                set((state) => ({
                    progressByVideo: {
                        ...state.progressByVideo,
                        [videoId]: seconds,
                    },
                })),

        }),
        {
            name: "video-player-settings",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                playbackRate: state.playbackRate,
                volume: state.volume,
                muted: state.muted,
                progressByVideo: state.progressByVideo,
            }),
        }
    )
);