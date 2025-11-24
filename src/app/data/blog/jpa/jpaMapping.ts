import type { PostSource } from '@/app/lib/types';

const jpaMapping: PostSource = {
    slug: 'jpaMapping', // URL ROUTER 에 사용
    topic: 'JPA',
    title: 'JPA 매핑',
    description: 'JPA 매핑',
    publishedAt: '2025-02-15',
    tags: ['JPA'],
    featured: true,
    contentPath: 'jpa/jpaMapping.md',
};

export default jpaMapping;
