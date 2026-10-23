'use client';

interface PageLoaderProps {
    message?: string;
}

export function PageLoader({ message = 'Loading...' }: Readonly<PageLoaderProps>) {
    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 text-sm">
            {message}
        </div>
    );
}
