// post1.ts
import type { BlogPost } from '@/app/types/blog';
import {GLOBAL} from "@/app/constants";

export const post1: BlogPost = {
    id: 'coding-1',
    title: '문제1?',
    date: '2025-05-29',
    md: `
    
`,
    excerpt: 'coding',
    tags: ['coding'],
    author: GLOBAL.NAME,
    coverImage: '/images/coding.png',
};
