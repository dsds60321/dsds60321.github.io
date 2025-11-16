'use client';

import { useMemo, useState } from 'react';
import type { PostListItem, TopicDefinition } from '@/app/lib/types';
import { cn } from '@/app/lib/utils';
import { Input } from '@/app/components/ui/input';
import { buttonVariants } from '@/app/components/ui/button';
import { Separator } from '@/app/components/ui/separator';
import { PostCard } from './post-card';
import { useTopicFilter } from '@/app/context/topic-filter';

interface PostHubProps {
    posts: PostListItem[];
    topics: TopicDefinition[];
}

export function PostHub({ posts, topics }: PostHubProps) {
    const [query, setQuery] = useState('');
    const { topic, setTopic } = useTopicFilter();

    const filtered = useMemo(() => {
        return posts.filter((post) => {
            const matchesTopic = topic === 'all' ? true : post.topic === topic;
            const matchesQuery = query
                ? [post.title, post.description, post.tags.join(' ')].some((field) =>
                      field.toLowerCase().includes(query.toLowerCase()),
                  )
                : true;
            return matchesTopic && matchesQuery;
        });
    }, [posts, query, topic]);

    return (
        <section id="posts" className="mx-auto w-full max-w-5xl px-6 py-16">
            <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-6 rounded-3xl border border-border/70 bg-card/70 p-8">
                    <div className="flex flex-col gap-3 text-center md:text-left">
                        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Topics</p>
                        <h2 className="text-3xl font-semibold text-foreground">관심 있는 주제만 골라서 읽어 보세요</h2>
                        <p className="text-base text-muted-foreground">
                            {posts.length}개의 기록 중 {filtered.length}개가 현재 필터 조건과 일치합니다.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setTopic('all')}
                            className={cn(
                                buttonVariants({ variant: topic === 'all' ? 'secondary' : 'outline', size: 'sm' }),
                                'rounded-full',
                            )}
                        >
                            전체 보기
                        </button>
                        {topics.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setTopic(item.id)}
                                className={cn(
                                    buttonVariants({ variant: topic === item.id ? 'secondary' : 'outline', size: 'sm' }),
                                    'rounded-full capitalize',
                                )}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="search" className="text-sm font-medium text-muted-foreground">
                            검색
                        </label>
                        <Input
                            id="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="키워드나 태그로 검색해 보세요"
                        />
                    </div>
                </div>
                <Separator className="h-px w-full" />
                <div className="grid gap-6 md:grid-cols-2">
                    {filtered.length === 0 && (
                        <div className="rounded-3xl border border-dashed border-border/70 p-10 text-center text-muted-foreground md:col-span-2">
                            조건에 맞는 글이 없어요. 검색어를 수정하거나 다른 토픽을 선택해 보세요.
                        </div>
                    )}
                    {filtered.map((post, index) => (
                        <PostCard key={post.slug} post={post} index={index} />
                    ))}
                </div>
                <div className="rounded-3xl border bg-secondary/5 p-8 text-center text-sm text-muted-foreground">
                    개인적으로 공부한 내용이기에 잘못된 정보가 있을 수 있습니다.
                </div>
            </div>
        </section>
    );
}
