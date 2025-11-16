import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { siteConfig } from '@/app/constants/site';
import { SiteFooter } from '@/app/components/layout/site-footer';
import { SiteHeader } from '@/app/components/layout/site-header';
import { TopicFilterProvider } from '@/app/context/topic-filter';
import './globals.css';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    metadataBase: new URL(siteConfig.url),
    title: {
        default: siteConfig.title,
        template: `%s · ${siteConfig.title}`,
    },
    description: siteConfig.description,
    applicationName: siteConfig.shortTitle,
    keywords: siteConfig.keywords,
    category: 'technology',
    authors: [{ name: siteConfig.author }],
    creator: siteConfig.author,
    publisher: siteConfig.author,
    alternates: {
        canonical: siteConfig.url,
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
        },
    },
    themeColor: siteConfig.themeColor,
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        title: siteConfig.title,
        description: siteConfig.description,
        url: siteConfig.url,
        type: 'website',
        siteName: siteConfig.title,
        locale: siteConfig.locale,
        images: [
            {
                url: siteConfig.ogImage,
                width: 1200,
                height: 630,
                alt: siteConfig.title,
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: siteConfig.title,
        description: siteConfig.description,
        creator: siteConfig.social.twitter,
        images: [siteConfig.ogImage],
    },
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon.ico',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
            <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background text-foreground`}>
                <TopicFilterProvider>
                    <div className="flex min-h-screen flex-col">
                        <SiteHeader />
                        <main className="flex-1 pb-16">{children}</main>
                        <SiteFooter />
                    </div>
                </TopicFilterProvider>
            </body>
        </html>
    );
}
