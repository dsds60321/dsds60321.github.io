import type { PostSource } from '@/app/lib/types';

const asciidoc: PostSource = {
    slug: 'asciidoc', // URL ROUTER 에 사용
    topic: 'ETC',
    title: '아스키독스 설정',
    description: 'asciidoc',
    publishedAt: '2025-02-15',
    tags: ['asciidoc'],
    featured: true,
    contentPath: 'etc/asciidoc.md',
};

export default asciidoc;
