import type { Metadata } from 'next';
import { CosmicHeroShell } from '@/app/components/blog/cosmic-hero-shell';
import { PostHub } from '@/app/components/blog/post-hub';
import { JsonLd } from '@/app/components/layout/json-ld';
import { siteConfig } from '@/app/constants/site';
import { topicDefinitions } from '@/app/constants/topics';
import { getAllPostListItems } from '@/app/lib/posts';

export const metadata: Metadata = {
    alternates: {
        canonical: siteConfig.url,
    },
};

export default async function HomePage() {
    const posts = await getAllPostListItems();
    const language = siteConfig.locale.replace('_', '-');

    const homeJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteConfig.title,
        url: siteConfig.url,
        description: siteConfig.description,
        inLanguage: language,
        author: {
            '@type': 'Person',
            name: siteConfig.author,
        },
        potentialAction: {
            '@type': 'SearchAction',
            target: `${siteConfig.url}/?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
        },
    };

    return (
        <>
            <div className="min-h-screen">
                <CosmicHeroShell posts={posts} topics={topicDefinitions} />
                <PostHub posts={posts} topics={topicDefinitions} />
            </div>
            <JsonLd id="homepage-jsonld" data={homeJsonLd} />
        </>
    );
}
