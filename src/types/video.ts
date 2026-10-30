export interface Video {
    id: number;
    title: string;
    description: string;
    video_file: string;
    thumbnail: string | null;
    subtitles: {
        language: string;
        label: string;
        src: string;
    }[];
    qualities: {
        resolution: number;
        label: string;
        src: string;
    }[];
    user_id: number;
    username: string;
    views_count: number;
    likes_count: number;
    dislikes_count: number;
}

export interface Channel {
    id: number;
    username: string;
    profile_image: string | null;
    subscribers_count: number;
    is_owner: boolean;
    is_subscribed: boolean;
}