import type { MetadataRoute } from 'next';
import { siteConfig } from '@/app/constants/site';

export const revalidate = false;

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
            },
        ],
        sitemap: [`${siteConfig.url}/sitemap.xml`],
        host: siteConfig.url,
    };
}
