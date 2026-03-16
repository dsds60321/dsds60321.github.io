'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { topicDefinitions } from '@/app/constants/topics';
import { Button } from '@/app/components/ui/button';
import { useTopicFilter, type TopicFilterValue } from '@/app/context/topic-filter';

export function SiteHeader() {
    const { setTopic } = useTopicFilter();

    const scrollToPosts = () => {
        const section = document.getElementById('posts');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleTopicSelect = (topicId: TopicFilterValue) => {
        setTopic(topicId);
        scrollToPosts();
    };

    return (
        <header className="sticky top-0 z-40 border-b border-white/6 bg-background/55 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <Link href="/" className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em]">
                    <span className="font-display rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-[0.78rem] text-white shadow-[0_0_22px_rgba(98,240,255,0.16)]">
                        KG
                    </span>
                    <span className="hidden font-display text-foreground/78 sm:inline">개발 노트</span>
                </Link>
                <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
                    {topicDefinitions.map((topic) => (
                        <button
                            key={topic.id}
                            type="button"
                            onClick={() => handleTopicSelect(topic.id)}
                            className="transition hover:text-white"
                        >
                            {topic.label}
                        </button>
                    ))}
                </nav>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleTopicSelect('all')}
                    className="flex items-center gap-1 border-white/12 bg-white/[0.03] text-white hover:bg-white/[0.08]"
                >
                    글 목록
                    <ArrowUpRight size={16} />
                </Button>
            </div>
        </header>
    );
}
