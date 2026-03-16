import Link from 'next/link';
import { siteConfig } from '@/app/constants/site';

export function SiteFooter() {
    const year = new Date().getFullYear();
    return (
        <footer className="border-t border-white/6 bg-background/70">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                <p>
                    © {year} {siteConfig.author}. Orbital archive online.
                </p>
                <div className="flex items-center gap-4">
                    <Link href={siteConfig.social.github} className="transition hover:text-white" target="_blank" rel="noreferrer">
                        GitHub
                    </Link>
                    <Link href={`mailto:${siteConfig.contactEmail}`} className="transition hover:text-white">
                        Contact
                    </Link>
                </div>
            </div>
        </footer>
    );
}
