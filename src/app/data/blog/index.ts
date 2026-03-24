import type { PostSource } from '@/app/lib/types';
import { etcPosts } from '@/app/data/blog/etc';
import { javaPosts } from '@/app/data/blog/java';
import { jpaPosts } from '@/app/data/blog/jpa';
import { nettyPosts } from './netty';
import { sideProjectPosts } from '@/app/data/blog/sideProject';
import { springPosts } from '@/app/data/blog/spring';

export const postsByTopic = {
    netty: nettyPosts,
    java: javaPosts,
    spring: springPosts,
    jpa: jpaPosts,
    etc: etcPosts,
    sideProject: sideProjectPosts,
};

export const allPosts: PostSource[] = [
    ...postsByTopic.netty,
    ...postsByTopic.java,
    ...postsByTopic.spring,
    ...postsByTopic.jpa,
    ...postsByTopic.etc,
    ...postsByTopic.sideProject,
];
