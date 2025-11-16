import Link from 'next/link';
import { siteConfig } from '@/app/constants/site';

export function SiteFooter() {
    const year = new Date().getFullYear();
    return (
        <footer className="border-t border-border/70 bg-background/90">
            <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                <p>
                    © {year} {siteConfig.author}. All rights reserved.
                </p>
                <div className="flex items-center gap-4">
                    <Link href={siteConfig.social.github} className="transition hover:text-foreground" target="_blank" rel="noreferrer">
                        GitHub
                    </Link>
                    <Link href={`mailto:${siteConfig.contactEmail}`} className="transition hover:text-foreground">
                        Contact
                    </Link>
                </div>
            </div>
        </footer>
    );
}
