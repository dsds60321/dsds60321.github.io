import type { TopicDefinition } from '@/app/lib/types';

export const topicDefinitions: TopicDefinition[] = [
    {
        id: 'netty',
        label: 'Netty',
        description: 'Netty 관련',
    },
    {
        id: 'java',
        label: 'Java',
        description: 'Java 관련',
    },
    {
        id: 'spring',
        label: 'spring',
        description: 'Spring 관련',
    },
    {
        id: 'JPA',
        label: 'JPA',
        description: 'JPA 관련',
    },
];

export const topicMap = topicDefinitions.reduce<Record<string, TopicDefinition>>(
    (acc, topic) => ({ ...acc, [topic.id]: topic }),
    {},
);
