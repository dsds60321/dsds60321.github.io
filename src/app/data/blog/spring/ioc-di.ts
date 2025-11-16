import type { PostSource } from '@/app/lib/types';

const iocDi: PostSource = {
    slug: 'iocDi', // URL ROUTER 에 사용
    topic: 'spring',
    title: 'IOC DI 란?',
    description: 'IOC DI 란?',
    publishedAt: '2025-02-15',
    tags: ['Spring'],
    featured: true,
    contentPath: 'spring/iocDi.md',
};

export default iocDi;
