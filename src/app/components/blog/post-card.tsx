'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { PostListItem } from '@/app/lib/types';
import { formatDate } from '@/app/lib/date';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent } from '@/app/components/ui/card';

interface PostCardProps {
    post: PostListItem;
    index: number;
}

export function PostCard({ post, index }: PostCardProps) {
    return (
        <Card className="group flex h-full flex-col justify-between border-border/70 bg-card/80 p-6">
            <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{String(index + 1).padStart(2, '0')}</p>
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{post.topic}</Badge>
                    <span className="text-sm text-muted-foreground">
                        {formatDate(post.publishedAt)} · {post.readingMinutes}분
                    </span>
                </div>
                <h3 className="text-2xl font-semibold text-foreground">{post.title}</h3>
                <p className="text-base text-muted-foreground">{post.description}</p>
                <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                        <Badge key={tag} variant="subtle" className="text-[0.7rem] uppercase">
                            {tag}
                        </Badge>
                    ))}
                </div>
            </div>
            <CardContent className="mt-8 flex items-center justify-between px-0">
                <Link
                    href={`/blog/${post.slug}`}
                    className="flex items-center gap-2 text-sm font-medium text-foreground transition group-hover:gap-3"
                >
                    글 읽기
                    <ArrowUpRight size={18} />
                </Link>
            </CardContent>
        </Card>
    );
}
