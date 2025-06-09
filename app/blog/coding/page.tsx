import { BlogList } from '@components/Blog/BlogList';
import Layout from "@components/layout/Layout";
import {codingPosts} from "@data/blog/coding/coding";

export default function CodingPage() {
    return (
        <Layout>
            <div className="container mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold mb-8">코딩테스트</h1>
                <BlogList posts={codingPosts} className="md:grid-cols-2 lg:grid-cols-3" />
            </div>
        </Layout>
    );
}
