"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

interface QueryProviderProps {
    children: ReactNode;
}

export default function QueryProvider({
    children,
}: QueryProviderProps) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 30_000,
                        retry: 1,
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    useEffect(() => {
        const clearUserCache = () => {
            queryClient.clear();
        };

        window.addEventListener("app:authenticated", clearUserCache);
        window.addEventListener("app:logged-out", clearUserCache);

        return () => {
            window.removeEventListener("app:authenticated", clearUserCache);
            window.removeEventListener("app:logged-out", clearUserCache);
        };
    }, [queryClient]);

    return (
        <QueryClientProvider client={queryClient}>
            {children}

            {process.env.NODE_ENV === "development" && (
                <ReactQueryDevtools initialIsOpen={false} />
            )}
        </QueryClientProvider>
    );
}