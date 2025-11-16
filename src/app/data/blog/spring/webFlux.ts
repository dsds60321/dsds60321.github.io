import type { PostSource } from '@/app/lib/types';

const webFlux: PostSource = {
    slug: 'WebFlux', // URL ROUTER 에 사용
    topic: 'spring',
    title: 'WebFlux 란?',
    description: 'WebFlux 란?',
    publishedAt: '2025-02-15',
    tags: ['Spring', 'WebFlux'],
    featured: true,
    contentPath: 'spring/webFlux.md',
};

export default webFlux;
