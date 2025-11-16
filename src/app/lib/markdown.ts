import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypePrism from 'rehype-prism-plus';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

export async function markdownToHtml(markdown: string): Promise<string> {
    const file = await remark()
        .use(remarkGfm)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeSlug)
        .use(rehypeAutolinkHeadings, {
            behavior: 'wrap',
            properties: {
                className: ['heading-link'],
            },
        })
        .use(rehypePrism, { ignoreMissing: true })
        .use(rehypeStringify, { allowDangerousHtml: true })
        .process(markdown);

    return String(file);
}
