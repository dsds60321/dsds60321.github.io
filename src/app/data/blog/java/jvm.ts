import type { PostSource } from '@/app/lib/types';

const jvm: PostSource = {
    slug: 'java', // URL ROUTER 에 사용
    topic: 'java',
    title: 'JVM 구성',
    description: 'JVM 구성',
    publishedAt: '2025-02-15',
    tags: ['Java', 'Jvm'],
    featured: true,
    contentPath: 'java/jvm.md',
};

export default jvm;
