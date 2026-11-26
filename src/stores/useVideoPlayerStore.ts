import { create } from "zustand";
import { getAccessToken } from "@/lib/api";
import { saveUserPreferences } from "@/lib/userPreferences";

interface PlayerServerPreferences {
    playback_rate: number;
    volume: number;
    muted: boolean;
}

interface VideoPlayerState {
    playbackRate: number;
    volume: number;
    muted: boolean;
    preferencesHydrated: boolean;
    progressByVideo: Record<string, number>;

    setPlaybackRate: (rate: number) => void;
    setVolume: (volume: number) => void;
    setMuted: (muted: boolean) => void;
    setVideoProgress: (videoId: string, seconds: number) => void;
    setProgressMap: (progress: Record<string, number>) => void;
    hydratePreferences: (preferences: PlayerServerPreferences) => void;
    resetPlayerState: () => void;
}

const defaultPlayerState = {
    playbackRate: 1,
    volume: 1,
    muted: false,
    preferencesHydrated: false,
    progressByVideo: {},
};

function persistPlayerPreference(
    updates: {
        playback_rate?: number;
        volume?: number;
        muted?: boolean;
    },
    enabled: boolean
) {
    if (!enabled || !getAccessToken()) return;

    void saveUserPreferences(updates).catch((error) => {
        console.error("Could not save player preferences:", error);
    });
}

export const useVideoPlayerStore = create<VideoPlayerState>()((set) => ({
    ...defaultPlayerState,

    setPlaybackRate: (playbackRate) =>
        set((state) => {
            persistPlayerPreference(
                { playback_rate: playbackRate },
                state.preferencesHydrated
            );
            return { playbackRate };
        }),

    setVolume: (volume) =>
        set((state) => {
            persistPlayerPreference(
                { volume },
                state.preferencesHydrated
            );
            return { volume };
        }),

    setMuted: (muted) =>
        set((state) => {
            persistPlayerPreference(
                { muted },
                state.preferencesHydrated
            );
            return { muted };
        }),

    setVideoProgress: (videoId, seconds) => {
        if (!Number.isFinite(seconds) || seconds < 0) return;

        set((state) => ({
            progressByVideo: {
                ...state.progressByVideo,
                [videoId]: seconds,
            },
        }));
    },

    setProgressMap: (progressByVideo) => set({ progressByVideo }),

    hydratePreferences: (preferences) =>
        set({
            playbackRate: preferences.playback_rate,
            volume: preferences.volume,
            muted: preferences.muted,
            preferencesHydrated: true,
        }),

    resetPlayerState: () => set(defaultPlayerState),
}));