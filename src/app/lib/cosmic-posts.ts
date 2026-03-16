import type { CosmicPostNode, PostListItem, PostTopic, TopicDefinition } from './types';

const TOPIC_LONGITUDE_OFFSET: Record<PostTopic, number> = {
    netty: 18,
    java: 84,
    spring: 156,
    JPA: 228,
    ETC: 300,
};

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const normalizeLongitude = (value: number): number => {
    const normalized = ((value + 180) % 360 + 360) % 360 - 180;
    return normalized === -180 ? 180 : normalized;
};

const hashString = (value: string): number => {
    let hash = 2166136261;

    for (const character of value) {
        hash ^= character.charCodeAt(0);
        hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
};

const formatCoordinate = (value: number, positive: string, negative: string): string => {
    const direction = value >= 0 ? positive : negative;
    return `${Math.abs(value).toFixed(1)}° ${direction}`;
};

const formatSignalCode = (topic: TopicDefinition, hash: number): string => {
    const prefix = topic.label.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase().padEnd(3, 'X');
    return `${prefix}-${String((hash % 900) + 100)}`;
};

export const buildCosmicPostNodes = (
    posts: PostListItem[],
    topics: TopicDefinition[],
): CosmicPostNode[] => {
    const grouped = posts.reduce<Partial<Record<PostTopic, PostListItem[]>>>((acc, post) => {
        acc[post.topic] = [...(acc[post.topic] ?? []), post];
        return acc;
    }, {});

    return topics.flatMap((topic) => {
        const topicPosts = grouped[topic.id] ?? [];

        return topicPosts.map((post, index) => {
            const hash = hashString(`${post.slug}-${post.publishedAt}-${post.tags.join('-')}`);
            const spacing = 360 / Math.max(topicPosts.length, 1);
            const longitudeJitter = (((hash % 1000) / 1000) - 0.5) * 16;
            const latitudeJitter = ((((hash >> 7) % 1000) / 1000) - 0.5) * 8;
            const longitude = normalizeLongitude(TOPIC_LONGITUDE_OFFSET[topic.id] + spacing * index + longitudeJitter);
            const latitude = clamp(topic.orbitLatitude + latitudeJitter, -70, 70);

            return {
                ...post,
                href: `/blog/${post.slug}`,
                accent: topic.accent,
                orbitLatitude: topic.orbitLatitude,
                latitude,
                longitude,
                coordinateLabel: `${formatCoordinate(latitude, 'N', 'S')} / ${formatCoordinate(longitude, 'E', 'W')}`,
                signalCode: formatSignalCode(topic, hash),
            };
        });
    });
};
