import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { cache } from 'react';
import { allPosts } from '@/app/data/blog';
import { markdownToHtml } from './markdown';
import type { Post, PostListItem, PostSource, PostTopic } from './types';

const CONTENT_ROOT = path.join(process.cwd(), 'contents');

const computeMetrics = (markdown: string) => {
    const words = markdown.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const readingMinutes = Math.max(1, Math.round(wordCount / 200));
    return { wordCount, readingMinutes };
};

const hydratePost = async (source: PostSource): Promise<Post> => {
    const filePath = path.join(CONTENT_ROOT, source.contentPath);
    const raw = await fs.readFile(filePath, 'utf8');
    const { content } = matter(raw);
    const html = await markdownToHtml(content);
    const metrics = computeMetrics(content);

    return {
        ...source,
        html,
        ...metrics,
    };
};

const summarize = (post: Post): PostListItem => ({
    slug: post.slug,
    topic: post.topic,
    title: post.title,
    description: post.description,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    tags: post.tags,
    featured: post.featured,
    contentPath: post.contentPath,
    coverImage: post.coverImage,
    readingMinutes: post.readingMinutes,
    wordCount: post.wordCount,
});

const sortByDate = <T extends { publishedAt: string }>(data: T[]): T[] =>
    [...data].sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );

export const getAllPosts = cache(async (): Promise<Post[]> => {
    const posts = await Promise.all(allPosts.map((source) => hydratePost(source)));
    return sortByDate(posts);
});

export const getAllPostListItems = cache(async (): Promise<PostListItem[]> => {
    const posts = await getAllPosts();
    return posts.map(summarize);
});

export const getPostBySlug = cache(async (slug: string): Promise<Post> => {
    const source = allPosts.find((post) => post.slug === slug);
    if (!source) {
        throw new Error(`Post not found for slug: ${slug}`);
    }
    return hydratePost(source);
});

export const getPostsByTopic = cache(async (topic: PostTopic): Promise<PostListItem[]> => {
    const posts = await getAllPosts();
    return posts.filter((post) => post.topic === topic).map(summarize);
});
