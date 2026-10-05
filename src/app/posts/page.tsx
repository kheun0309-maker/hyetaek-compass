import { getAllPosts } from "@/lib/posts";
import { PostList } from "@/components/PostCard";
import Pagination from "@/components/Pagination";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "../../../site.config";

export const dynamic = "force-static";
export const metadata = pageMetadata({ title: "전체 글", path: "/posts", index: false });

export default function AllPostsPage() {
  const posts = getAllPosts();
  return <section className="section"><div className="wrap">
    <div className="section__head"><h1>전체 글</h1><span>총 {posts.length}개</span></div>
    <PostList posts={posts.slice(0, siteConfig.postsPerPage)} />
    <Pagination page={1} totalPages={Math.max(1, Math.ceil(posts.length / siteConfig.postsPerPage))} basePath="" />
  </div></section>;
}
