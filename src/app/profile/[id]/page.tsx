"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { API } from "@/lib/api";

export default function ProfilePage() {

    const params = useParams();
    const userId = params.id;

    const [profile, setProfile] = useState<any>(null);
    const [videos, setVideos] = useState<any[]>([]);

    useEffect(() => {

        const getProfile = async () => {

            try {

                    const token = localStorage.getItem("accessToken");

                    const profileResponse = await fetch(
                        `${API}/users/${userId}/`,
                        {
                            headers: token
                                ? { Authorization: `Bearer ${token}` }
                                : {},
                        }
                    );

                    console.log(
                        "Profile status:",
                        profileResponse.status
                    );

                    const profileData = await profileResponse.json();

                    console.log(
                        "Profile data:",
                        profileData
                    );

                    if (profileResponse.ok) {
                        setProfile(profileData);
                    }

            } 
            
            catch (error) {

                console.log(
                    "Profile request error:",
                    error
                );

            }

            try {

                const videosResponse = await fetch(
                    `${API}/users/${userId}/videos/`
                );

                console.log(
                    "Videos status:",
                    videosResponse.status
                );

                const videosData = await videosResponse.json();

                console.log(
                    "Videos data:",
                    videosData
                );

                if (videosResponse.ok) {
                    setVideos(videosData);
                }

            }
            
            catch (error) {

                console.log(
                    "Videos request error:",
                    error
                );

            }

        };

        getProfile();

    }, [userId]);

    const handleSubscribe = async () => {

        const token = localStorage.getItem("accessToken");

        if(!token) {
            alert("Please login first.");
            return;
        }

        try {
            const response = await fetch(
                `${API}/users/${userId}/subscribe/`,
                {
                    method: "POST",

                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }

            );

            const data = await response.json();

            if(response.ok) {
                setProfile((previousProfile: any) => ({
                    ...previousProfile,
                    is_subscribed: data.subscribed,
                    subscribers_count: data.subscribers_count,
                }));
            }

            else {
                alert(data.error || "Something went wrong.");
            }
        }
        catch (error) {
            console.log("Subscribe error:", error);
        }
    };

    console.log("CURRENT PROFILE:", profile);

    if (!profile) {

        return (
            <main className="flex min-h-screen items-center justify-center">
                <p>Loading...</p>
            </main>
        );

    }

    return (

        <main className="min-h-screen bg-gray-100">

            <Navbar />

            <section className="mx-auto max-w-5xl px-8 py-10">

                <div className="rounded-xl bg-white p-8 shadow-sm">

                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-5">

                            {profile.profile_image ? (

                                <img
                                    src={profile.profile_image}
                                    alt={profile.username} 
                                    className="h-24 w-24 rounded-full object-cover"
                                />

                            ) : (

                                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-3xl font-bold text-gray-500">
                                    {profile.username.charAt(0).toUpperCase()}
                                </div>

                            )}

                            <div>

                                <h1 className="text-3xl font-bold text-gray-900">
                                    {profile.username}
                                </h1>

                                <p className="mt-2 text-gray-600">
                                    {profile.bio || "No bio yet."}
                                </p>

                            </div>
                            
                        </div>

                        <div className="flex gap-3">

                            {profile.is_owner && (
                                <>
                                    <Link
                                        href="/dashboard"
                                        className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
                                    >
                                        Dashboard
                                    </Link>

                                    <Link
                                        href="/profile/edit"
                                        className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Edit Profile
                                    </Link>
                                </>
                            )}

                             {!profile.is_owner && (
                                <button
                                    onClick={handleSubscribe}
                                    className={`rounded-lg px-5 py-2.5 text-sm font-medium ${
                                        profile.is_subscribed
                                        ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                        : "bg-red-700 text-white hover:bg-red-800"
                                    }`}
                                >
                                    {profile.is_subscribed
                                        ? "Unsubscribe"
                                        : "Subscribe"}
                                </button>
                             )}

                        </div>

                    </div>

                    <div className="mt-6 flex gap-6 text-sm text-gray-600">

                        <span>
                            <strong className="text-gray-900">
                                {profile.videos_count}
                            </strong>{" "}
                            Videos
                        </span>

                        <span>
                            <strong className="text-gray-900">
                                {profile.subscribers_count}
                            </strong>{" "}
                            Subscribers
                        </span>

                    </div>

                </div>

                <section className="mt-10">

                    <h2 className="mb-6 text-2xl font-bold text-gray-900">
                        Videos
                    </h2>

                    {videos.length === 0 ? (

                        <p className="text-gray-500">
                            No videos yet.
                        </p>

                    ) : (

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                            {videos.map((video) => (

                                <a
                                    key={video.id}
                                    href={`/videos/${video.id}`}
                                    className="block overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md"
                                >

                                    {video.thumbnail && (

                                        <img
                                            src={video.thumbnail}
                                            alt={video.title}
                                            className="h-48 w-full object-cover"
                                        />

                                    )}

                                    <div className="p-5">

                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {video.title}
                                        </h3>

                                        <p className="mt-2 text-sm text-gray-500">
                                            {video.views_count} views
                                        </p>

                                    </div>

                                </a>

                            ))}

                        </div>

                    )}

                </section>

            </section>

        </main>

    );
}