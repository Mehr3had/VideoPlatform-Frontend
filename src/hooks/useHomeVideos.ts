"use client";

import { useCallback, useEffect, useState } from "react";
import { API } from "@/lib/api";

interface Video {
    id: number;
    title: string;
    thumbnail?: string | null;
    username: string;
    views_count: number;
    category_name?: string | null;
}

interface Category {
    id: number;
    name: string;
}

interface PaginatedVideos {
    count: number;
    results: Video[];
}

export default function useHomeVideos() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [trendingVideos, setTrendingVideos] = useState<Video[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [search, setSearch] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [category, setCategory] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchVideos = useCallback(async () => {
        try {
            const params = new URLSearchParams({
                page: String(page),
            });

            if (appliedSearch.trim()) {
                params.append("search", appliedSearch.trim());
            }

            if (category) {
                params.append("category", category);
            }

            const response = await fetch(
                `${API}/videos/?${params.toString()}`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch videos");
            }

            const data: PaginatedVideos = await response.json();

            setVideos(data.results);
            setTotalPages(Math.max(1, Math.ceil(data.count / 6)));
        } catch (error) {
            console.error("Videos error:", error);
        }
    }, [page, appliedSearch, category]);

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [trendingResponse, categoriesResponse] =
                    await Promise.all([
                        fetch(`${API}/videos/trending/`),
                        fetch(`${API}/categories/`),
                    ]);

                if (trendingResponse.ok) {
                    setTrendingVideos(await trendingResponse.json());
                } else {
                    console.error("Failed to fetch trending videos");
                }

                if (categoriesResponse.ok) {
                    setCategories(await categoriesResponse.json());
                } else {
                    console.error("Failed to fetch categories");
                }
            } catch (error) {
                console.error("Home page data error:", error);
            }
        };

        fetchInitialData();
    }, []);

    const handleSearch = () => {
        setPage(1);
        setAppliedSearch(search.trim());
    };

    const handleCategoryChange = (value: string) => {
        setCategory(value);
        setPage(1);
    };

    return {
        videos,
        trendingVideos,
        categories,
        search,
        setSearch,
        category,
        page,
        setPage,
        totalPages,
        handleSearch,
        handleCategoryChange,
    };
}