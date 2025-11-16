import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock3, Tag } from 'lucide-react';
import { JsonLd } from '@/app/components/layout/json-ld';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { siteConfig } from '@/app/constants/site';
import { getAllPostListItems, getPostBySlug } from '@/app/lib/posts';
import { formatDate } from '@/app/lib/date';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const posts = await getAllPostListItems();
    return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug).catch(() => null);
    if (!post) {
        return {
            title: siteConfig.title,
            description: siteConfig.description,
        };
    }

    const canonicalUrl = `${siteConfig.url}/blog/${post.slug}`;
    const ogImage = post.coverImage ?? siteConfig.ogImage;
    const updatedAt = post.updatedAt ?? post.publishedAt;

    return {
        title: `${post.title} · ${siteConfig.title}`,
        description: post.description,
        keywords: post.tags,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title: post.title,
            description: post.description,
            type: 'article',
            url: canonicalUrl,
            publishedTime: post.publishedAt,
            modifiedTime: updatedAt,
            authors: [siteConfig.author],
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.description,
            images: [ogImage],
            creator: siteConfig.social.twitter,
        },
    };
}

export default async function BlogPostPage({ params }: PageProps) {
    const { slug } = await params;
    const post = await getPostBySlug(slug).catch(() => null);

    if (!post) {
        notFound();
    }

    const canonicalUrl = `${siteConfig.url}/blog/${post.slug}`;
    const ogImage = post.coverImage ?? siteConfig.ogImage;
    const updatedAt = post.updatedAt ?? post.publishedAt;

    const articleJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.description,
        image: ogImage,
        datePublished: post.publishedAt,
        dateModified: updatedAt,
        author: {
            '@type': 'Person',
            name: siteConfig.author,
        },
        publisher: {
            '@type': 'Organization',
            name: siteConfig.title,
            logo: {
                '@type': 'ImageObject',
                url: `${siteConfig.url}/favicon.ico`,
            },
        },
        mainEntityOfPage: canonicalUrl,
        url: canonicalUrl,
    };

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: '홈',
                item: siteConfig.url,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: '블로그',
                item: `${siteConfig.url}/#posts`,
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: post.title,
                item: canonicalUrl,
            },
        ],
    };

    return (
        <>
            <article className="mx-auto max-w-3xl px-6 py-16">
                <div className="space-y-6">
                    <Button asChild variant="ghost" className="w-fit px-0 text-muted-foreground">
                        <Link href="/" className="flex items-center gap-2">
                            <ArrowLeft size={16} />
                            목록으로 돌아가기
                        </Link>
                    </Button>
                    <div className="space-y-4">
                        <Badge variant="outline" className="capitalize">
                            {post.topic}
                        </Badge>
                        <h1 className="text-4xl font-semibold text-foreground">{post.title}</h1>
                        <p className="text-lg text-muted-foreground">{post.description}</p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span>{formatDate(post.publishedAt)}</span>
                            <span className="flex items-center gap-1">
                                <Clock3 size={16} /> {post.readingMinutes}분 읽기
                            </span>
                            <span>{post.wordCount} 단어</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                                <Badge key={tag} variant="subtle" className="flex items-center gap-1">
                                    <Tag size={14} />
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="post-body mt-10" dangerouslySetInnerHTML={{ __html: post.html }} />
            </article>
            <JsonLd id={`post-${post.slug}-jsonld`} data={articleJsonLd} />
            <JsonLd id={`post-${post.slug}-breadcrumb`} data={breadcrumbJsonLd} />
        </>
    );
}
