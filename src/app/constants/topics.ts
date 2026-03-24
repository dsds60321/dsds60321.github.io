import type { PostTopic, TopicDefinition } from '@/app/lib/types';

export const topicDefinitions: TopicDefinition[] = [
    {
        id: 'netty',
        label: 'Netty',
        description: 'Netty 관련',
        accent: '#62f0ff',
        orbitLatitude: 42,
    },
    {
        id: 'java',
        label: 'Java',
        description: 'Java 관련',
        accent: '#ffc857',
        orbitLatitude: 18,
    },
    {
        id: 'spring',
        label: 'Spring',
        description: 'Spring 관련',
        accent: '#6fffb0',
        orbitLatitude: -4,
    },
    {
        id: 'JPA',
        label: 'JPA',
        description: 'JPA 관련',
        accent: '#8ca0ff',
        orbitLatitude: -26,
    },
    {
        id: 'ETC',
        label: 'ETC',
        description: '기타등등',
        accent: '#ff8ad8',
        orbitLatitude: -48,
    },
    {
        id: 'sideProject',
        label: 'Side Project',
        description: '토이프로젝트 회고',
        accent: '#ffb86b',
        orbitLatitude: -64,
    },
];

export const topicMap = topicDefinitions.reduce<Record<PostTopic, TopicDefinition>>(
    (acc, topic) => {
        acc[topic.id] = topic;
        return acc;
    },
    {} as Record<PostTopic, TopicDefinition>,
);

export const getTopicLabel = (topic: PostTopic): string => topicMap[topic]?.label ?? topic;
