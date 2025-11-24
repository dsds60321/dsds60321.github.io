import type { PostSource } from '@/app/lib/types';

const persistenceContext: PostSource = {
    slug: 'persistence-context', // URL ROUTER 에 사용
    topic: 'JPA',
    title: '영속성 컨텍스트',
    description: '영속성 컨텍스트 란?',
    publishedAt: '2025-02-15',
    tags: ['JPA', '영속성 컨텍스트'],
    featured: true,
    contentPath: 'jpa/persistence-context.md',
};

export default persistenceContext;
