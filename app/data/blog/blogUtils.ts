// @data/blog/blogUtils.ts
import { BlogPost } from '@/app/types/blog';
import { kafkaPosts } from '@data/blog/kafka/kafka';
import { javaPosts } from '@data/blog/lang/java/java';
import {jpaPosts} from "@data/blog/spring/jpa/jpa";
import {memoPosts} from "@data/blog/etc/memo/memo";
import {springPosts} from "@data/blog/spring/default/spring";
import {webfluxPosts} from "@data/blog/spring/webflux/webflux";
import {reactPosts} from "@data/blog/js/react/react";
import {nettyPosts} from "@data/blog/netty/netty";
import {codingPosts} from "@data/blog/coding/coding";

/**
 * 모든 블로그 포스트를 카테고리별로 모아놓은 객체
 */
export const allPosts: Record<string, BlogPost[]> = {
    'kafka': kafkaPosts,
    'jpa': jpaPosts,
    'spring': springPosts,
    'webflux': webfluxPosts,
    'netty': nettyPosts,
    'java': javaPosts,
    'memo': memoPosts,
    'react' : reactPosts,
    'coding' : codingPosts,
};

/**
 * ID로 포스트 찾기
 */
export const getPostById = (id: string): BlogPost | undefined => {
    for (const category in allPosts) {
        const post = allPosts[category].find(p => p.id === id);
        if (post) return post;
    }
    return undefined;
};

/**
 * 모든 포스트 가져오기
 */
export const getAllPosts = (): BlogPost[] => {
    return Object.values(allPosts).flat();
};

/**
 * 카테고리별 포스트 가져오기
 */
export const getPostsByCategory = (category: string): BlogPost[] => {
    return allPosts[category] || [];
};

/**
 * 모든 카테고리 가져오기
 */
export const getAllCategories = (): string[] => {
    return Object.keys(allPosts);
};

/**
 * 최근 게시물 가져오기
 * @param count 가져올 게시물 수
 */
export const getRecentPosts = (count: number = 3): BlogPost[] => {
    // 모든 게시물을 가져와서 날짜 기준으로 정렬
    return getAllPosts()
        .sort((a, b) => {
            // 날짜 형식이 'YYYY-MM-DD'라고 가정
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        })
        .slice(0, count); // 요청한 수만큼 자르기
};
