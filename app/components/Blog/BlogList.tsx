// components/Blog/BlogList.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/app/types/blog';

interface BlogListProps {
    posts: BlogPost[];
    className?: string;
}

export const BlogList: React.FC<BlogListProps> = ({ posts, className = '' }) => {
    return (
        <div className={`grid grid-cols-1 gap-6 sm:gap-8 ${className}`}>
            {posts.map(post => (
                <div key={post.id} className="border-b pb-6 sm:pb-8 last:border-b-0">
                    {post.coverImage && (
                        <div className="mb-3 sm:mb-4">
                            <Link href={`/blog/${post.id}`}>
                                <Image
                                    src={post.coverImage}
                                    alt={post.title}
                                    width={800}
                                    height={400}
                                    className="w-full h-40 sm:h-48 object-cover rounded-lg shadow-sm"
                                />
                            </Link>
                        </div>
                    )}

                    <h2 className="text-xl sm:text-2xl font-bold mb-2">
                        <Link href={`/blog/${post.id}`} className="hover:text-blue-600 transition">
                            {post.title}
                        </Link>
                    </h2>

                    <div className="flex items-center text-gray-500 text-xs sm:text-sm mb-2 sm:mb-3">
                        <time dateTime={post.date}>{new Date(post.date).toLocaleDateString('ko-KR')}</time>
                        {post.author && (
                            <>
                                <span className="mx-2">•</span>
                                <span>{post.author}</span>
                            </>
                        )}
                    </div>

                    {post.excerpt && (
                        <p className="text-gray-700 text-sm sm:text-base mb-3 sm:mb-4 line-clamp-3">{post.excerpt}</p>
                    )}

                    {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {post.tags.map(tag => (
                                <span key={tag} className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-primary text-white text-xs rounded-md">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};