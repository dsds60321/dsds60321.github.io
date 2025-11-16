import type { MetadataRoute } from 'next';
import { siteConfig } from '@/app/constants/site';
import { getAllPostListItems } from '@/app/lib/posts';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const posts = await getAllPostListItems();
    const baseUrl = siteConfig.url;

    const postEntries = posts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.updatedAt ?? post.publishedAt,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date().toISOString(),
        },
        ...postEntries,
    ];
}
