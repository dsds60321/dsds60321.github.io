import type { PostSource } from '@/app/lib/types';

const harnessEngineeringReview: PostSource = {
    slug: 'harness-engineering-review', // URL ROUTER 에 사용
    topic: 'ETC',
    title: '하네스 엔지니어링 적용 후기',
    description: '프로젝트에 하네스 엔지니어링을 적용하면서 정리한 문서 흐름, 운영 방식, 실제 사용 후기',
    publishedAt: '2026-04-01',
    tags: ['AI', 'Agent', 'Harness Engineering', 'Retrospective'],
    featured: true,
    contentPath: 'etc/하네스엔지니어링_후기.md',
};

export default harnessEngineeringReview;
