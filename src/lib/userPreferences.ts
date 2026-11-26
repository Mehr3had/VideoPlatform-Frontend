import { API, apiFetch, getAccessToken } from "@/lib/api";

export interface UserPreferences {
    language: "fa" | "en";
    theme: "light" | "dark";
    accent: string;
    background_style: "default" | "soft" | "blue";
    playback_rate: number;
    volume: number;
    muted: boolean;
}

export type UserPreferenceUpdate = Partial<UserPreferences>;

export async function saveUserPreferences(
    updates: UserPreferenceUpdate
): Promise<UserPreferences | null> {
    if (!getAccessToken()) {
        return null;
    }

    const response = await apiFetch(`${API}/user-preferences/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
    });

    if (!response.ok) {
        throw new Error(
            `Saving user preferences failed: HTTP ${response.status}`
        );
    }

    return response.json();
}