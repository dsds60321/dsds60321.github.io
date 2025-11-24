import type { PostSource } from '@/app/lib/types';

const constantClass: PostSource = {
    slug: 'constantClass', // URL ROUTER 에 사용
    topic: 'ETC',
    title: '상수 클래스 설정',
    description: '상수 클래스',
    publishedAt: '2025-02-15',
    tags: ['java', 'constant'],
    featured: true,
    contentPath: 'etc/constantClass.md',
};

export default constantClass;
