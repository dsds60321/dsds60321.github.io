import type { PostSource } from '@/app/lib/types';

const netty: PostSource = {
    slug: 'netty', // URL ROUTER 에 사용
    topic: 'netty',
    title: 'Netty란?',
    description: 'Netty란?',
    publishedAt: '2025-02-15',
    tags: ['Netty', 'Spring'],
    featured: true,
    contentPath: 'netty/netty.md',
};

export default netty;
