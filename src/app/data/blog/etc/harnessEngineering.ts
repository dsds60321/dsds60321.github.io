import type { PostSource } from '@/app/lib/types';

const harnessEngineering: PostSource = {
    slug: 'harness-engineering', // URL ROUTER 에 사용
    topic: 'ETC',
    title: '하네스 엔지니어링',
    description: 'AI 에이전트가 실제 개발 업무를 끝까지 수행하도록 만드는 하네스 엔지니어링 개념 정리',
    publishedAt: '2026-04-01',
    tags: ['AI', 'Agent', 'Codex', 'Harness Engineering'],
    featured: true,
    contentPath: 'etc/하네스엔지니어링.md',
};

export default harnessEngineering;
