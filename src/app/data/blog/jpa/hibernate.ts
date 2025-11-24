import type { PostSource } from '@/app/lib/types';

const hibernate: PostSource = {
    slug: 'hibernate', // URL ROUTER 에 사용
    topic: 'JPA',
    title: 'hibernate 란?',
    description: 'hibernate 란?',
    publishedAt: '2025-02-15',
    tags: ['JPA', 'hibernate'],
    featured: true,
    contentPath: 'jpa/hibernate.md',
};

export default hibernate;
