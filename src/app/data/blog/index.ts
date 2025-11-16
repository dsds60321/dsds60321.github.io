import type { PostSource } from '@/app/lib/types';
import {nettyPosts} from "./netty";
import {javaPosts} from "@/app/data/blog/java";
import {springPosts} from "@/app/data/blog/spring";
import {jpaPosts} from "@/app/data/jpa";

export const postsByTopic = {
    netty: nettyPosts,
    java : javaPosts,
    spring : springPosts,
    jpa : jpaPosts
};

export const allPosts: PostSource[] = [
    ...postsByTopic.netty,
    ...postsByTopic.java,
    ...postsByTopic.spring,
    ...postsByTopic.jpa
];
