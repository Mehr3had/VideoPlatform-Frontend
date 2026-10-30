"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/axios";

interface Video {
    id: number;
    title: string;
    thumbnail?: string | null;
    username: string;
    views_count: number;
    duration: number;
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
    const [search, setSearch] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [category, setCategory] = useState("");
    const [page, setPage] = useState(1);

    const videosQuery = useQuery({
        queryKey: ["homeVideos", page, appliedSearch, category],
        queryFn: async () => {
            const response = await axiosClient.get<PaginatedVideos>(
                "/videos/",
                {
                    params: {
                        page,
                        ...(appliedSearch.trim()
                            ? { search: appliedSearch.trim() }
                            : {}),
                        ...(category ? { category } : {}),
                    },
                }
            );

            return {
                videos: response.data.results,
                totalPages: Math.max(
                    1,
                    Math.ceil(response.data.count / 6)
                ),
            };
        },
        placeholderData: keepPreviousData,
        staleTime: 30 * 1000,
    });

    const trendingQuery = useQuery({
        queryKey: ["trendingVideos"],
        queryFn: async () => {
            const response = await axiosClient.get<Video[]>(
                "/videos/trending/"
            );

            return response.data;
        },
        staleTime: 60 * 1000,
    });

    const categoriesQuery = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const response = await axiosClient.get<Category[]>(
                "/categories/"
            );

            return response.data;
        },
        staleTime: 5 * 60 * 1000,
    });

    const handleSearch = (value?: string) => {
        setPage(1);
        setAppliedSearch((value ?? search).trim());
    };

    const handleCategoryChange = (value: string) => {
        setCategory(value);
        setPage(1);
    };

    return {
        videos: videosQuery.data?.videos ?? [],
        trendingVideos: trendingQuery.data ?? [],
        categories: categoriesQuery.data ?? [],
        isLoadingVideos: videosQuery.isLoading,
        isErrorVideos: videosQuery.isError,
        isLoadingTrending: trendingQuery.isLoading,
        isLoadingCategories: categoriesQuery.isLoading,
        search,
        setSearch,
        category,
        page,
        setPage,
        totalPages: videosQuery.data?.totalPages ?? 1,
        handleSearch,
        handleCategoryChange,
    };
}