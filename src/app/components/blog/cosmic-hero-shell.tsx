'use client';

import dynamic from 'next/dynamic';
import type { PostListItem, TopicDefinition } from '@/app/lib/types';

interface CosmicHeroShellProps {
    posts: PostListItem[];
    topics: TopicDefinition[];
}

const CosmicHeroClient = dynamic(
    () => import('@/app/components/blog/cosmic-hero').then((module) => module.CosmicHero),
    {
        ssr: false,
        loading: () => (
            <section className="relative overflow-hidden border-b border-border/40">
                <div className="pointer-events-none absolute inset-0 cosmic-stars opacity-80" />
                <div className="pointer-events-none absolute inset-0 cosmic-grid opacity-20" />
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#37e0ff]/16 blur-3xl sm:h-[28rem] sm:w-[28rem]" />
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#9b8cff]/12 blur-3xl sm:h-[34rem] sm:w-[34rem]" />
                <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4.5rem)] w-full max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:py-16">
                    <div className="aspect-square w-full max-w-[min(92vw,54rem)] rounded-full border border-white/8 bg-[radial-gradient(circle_at_35%_35%,rgba(144,243,255,0.28),rgba(59,132,255,0.14)_34%,rgba(8,14,28,0.78)_72%,rgba(5,9,20,0.92)_100%)] shadow-[0_0_90px_rgba(31,182,255,0.25)]" />
                </div>
            </section>
        ),
    },
);

export function CosmicHeroShell({ posts, topics }: CosmicHeroShellProps) {
    return <CosmicHeroClient posts={posts} topics={topics} />;
}
