import type { PostSource } from '@/app/lib/types';

const executorService: PostSource = {
    slug: 'redis-monitor-executor-service',
    topic: 'spring',
    title: 'RedisMonitorSvc ExecutorService 리팩토링',
    description: '단일 Thread 전략을 ExecutorService 기반 스레드 풀로 치환한 경험 정리',
    publishedAt: '2025-12-02',
    tags: ['Spring', 'ExecutorService', 'Reactor'],
    featured: false,
    contentPath: 'spring/ExecutorService.md',
};

export default executorService;
