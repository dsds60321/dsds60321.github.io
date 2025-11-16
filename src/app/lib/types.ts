export type PostTopic = 'netty' | 'java' | 'spring' | 'JPA';

export interface PostSource {
    slug: string;
    topic: PostTopic;
    title: string;
    description: string;
    publishedAt: string; // ISO date string
    updatedAt?: string;
    tags: string[];
    featured?: boolean;
    contentPath: string; // relative to /contents
    coverImage?: string;
}

export interface PostListItem extends PostSource {
    readingMinutes: number;
    wordCount: number;
}

export interface Post extends PostListItem {
    html: string;
}

export interface TopicDefinition {
    id: PostTopic;
    label: string;
    description: string;
}
