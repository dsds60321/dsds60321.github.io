import type { PostSource } from '@/app/lib/types';

const dbLock: PostSource = {
    slug: 'db-lock', // URL ROUTER 에 사용
    topic: 'ETC',
    title: 'DB LOCK',
    description: 'DB LOCK',
    publishedAt: '2025-02-15',
    tags: ['java', 'DB'],
    featured: true,
    contentPath: 'etc/dbLock.md',
};

export default dbLock;
