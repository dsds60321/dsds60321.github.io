import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { siteConfig } from '@/app/constants/site';

export function HeroSection() {
    return (
        <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-24">
            <Badge className="w-fit" variant="subtle">
                매일 기록하고 실험하는 {siteConfig.author}
            </Badge>
            <div className="space-y-6">
                <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                    기록 습관으로 만드는 개발 블로그
                </h1>
                <p className="text-lg text-muted-foreground">
                    공부하면서 정리한 내용을 보관하는 블로그입니다.
                </p>
            </div>
            <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                    <Link href="#posts" className="flex items-center gap-2">
                        최신 글 보기
                        <ArrowUpRight size={18} />
                    </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                    <Link href={siteConfig.social.github} target="_blank" rel="noreferrer">
                        GitHub 살펴보기
                    </Link>
                </Button>
            </div>
        </section>
    );
}
