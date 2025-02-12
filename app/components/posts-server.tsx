import React from "react";
import { getBlogPosts } from "@/app/blog/utils";
import { AllPosts } from "@/app/components/posts-client";

export default function BlogPosts() {
  let posts = getBlogPosts();
  let tags = posts
    .flatMap((post) => post.metadata.tags)
    .filter((tag): tag is string => tag !== undefined);
  let finalTags = ["all"];
  finalTags = [...finalTags, ...Array.from(new Set(tags))];
  return <AllPosts posts={posts} tags={finalTags} />;
}
