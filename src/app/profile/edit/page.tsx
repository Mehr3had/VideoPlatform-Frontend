"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { API } from "@/lib/api";

export default function EditProfilePage() {
    const router = useRouter();

    const [bio, setBio] = useState("");
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const getProfile = async () => {
            const token = localStorage.getItem("accessToken");

            if (!token) {
                router.push("/login");
                return;
            }

            try {
                const response = await fetch(
                    `${API}/me/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.ok) {
                    const data = await response.json();

                    setBio(data.bio || "");
                }
            } catch (error) {
                console.log("Profile loading error:", error);
            } finally {
                setLoading(false);
            }
        };

        getProfile();
    }, [router]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const token = localStorage.getItem("accessToken");

        if (!token) {
            alert("Please login first.");
            return;
        }

        const formData = new FormData();

        formData.append("bio", bio);

        if (profileImage) {
            formData.append("profile_image", profileImage);
        }

        setSaving(true);

        try {
            const response = await fetch(
                `${API}/profile/edit/`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const data = await response.json();

            if (response.ok) {
                alert("Profile updated successfully!");
                router.push(`/profile/${data.id || ""}`);
            } else {
                alert(data.error || "Something went wrong.");
            }
        } catch (error) {
            console.log("Profile update error:", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center">
                <p>Loading...</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-100">
            <Navbar />

            <section className="mx-auto max-w-2xl px-8 py-10">
                <div className="rounded-xl bg-white p-8 shadow-sm">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Edit Profile
                    </h1>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Bio
                            </label>

                            <textarea
                                value={bio}
                                onChange={(event) => setBio(event.target.value)}
                                rows={5}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-500"
                                placeholder="Tell us something about yourself..."
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Profile Image
                            </label>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={(event) =>
                                    setProfileImage(
                                        event.target.files?.[0] || null
                                    )
                                }
                                className="block w-full text-sm text-gray-600"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>

                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>

                    </form>
                </div>
            </section>
        </main>
    );
}

