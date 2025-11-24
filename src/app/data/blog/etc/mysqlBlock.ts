import type { PostSource } from '@/app/lib/types';

const mysqlBlock: PostSource = {
    slug: 'mysql-block', // URL ROUTER 에 사용
    topic: 'ETC',
    title: 'MySQL 외부 접속 불가',
    description: 'MySQL 외부 접속 불가',
    publishedAt: '2025-02-15',
    tags: ['java', 'mysql'],
    featured: true,
    contentPath: 'etc/mysqlBlock.md',
};

export default mysqlBlock;
