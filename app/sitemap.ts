import { getBlogPosts } from "app/blog/utils";

const isDevelopment = process.env.NODE_ENV !== "production";
export const baseUrl = isDevelopment
  ? "http://localhost:3000"
  : "https://joelhuang.dev";

export default async function sitemap() {
  let blogs = getBlogPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  let routes = ["", "/blog"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  return [...routes, ...blogs];
}
