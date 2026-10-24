import Link from "next/link";

export default function EmptyState() {
    return (
        <div className="mt-10 rounded-xl bg-white px-5 py-12 text-center shadow-sm sm:px-10 dark:bg-[#181818]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl dark:bg-[#303030]">
                📹
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-900 dark:text-gray-100">
                No videos yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
                You haven't uploaded any videos yet. Upload your first video
                and it will appear here.
            </p>

            <Link
                href="/dashboard/upload"
                className="mt-6 inline-block rounded-lg bg-red-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-800"
            >
                Upload Your First Video
            </Link>
        </div>
    );
}