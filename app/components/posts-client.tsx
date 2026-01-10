"use client";

import { formatDate } from "@/app/utils/formatDate";
import React from "react";
import { Post } from "@/app/types/posts";
import FilterPosts from "@/app/components/filter-posts";

export function AllPosts({ posts, tags }: { posts: Post[]; tags: string[] }) {
  const [selectedTag, setSelectedTag] = React.useState("all");
  const [isShort, setIsShort] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(max-width: 480px)");
      setIsShort(mediaQuery.matches);

      const listener = (event: MediaQueryListEvent) => {
        setIsShort(event.matches);
      };

      mediaQuery.addEventListener("change", listener);

      return () => {
        mediaQuery.removeEventListener("change", listener);
      };
    }
  }, []);

  // Add error handling for posts filtering
  const filteredPosts = React.useMemo(() => {
    try {
      return selectedTag === "all"
        ? posts
        : posts.filter((post) => post.metadata.tags?.includes(selectedTag));
    } catch (error) {
      console.error("Error filtering posts:", error);
      return [];
    }
  }, [posts, selectedTag]);

  // Add error handling for date sorting
  const sortedPosts = React.useMemo(() => {
    try {
      return [...filteredPosts].sort((a, b) => {
        const dateA = new Date(a.metadata.publishedAt);
        const dateB = new Date(b.metadata.publishedAt);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error("Error sorting posts:", error);
      return filteredPosts;
    }
  }, [filteredPosts]);

  return (
    <div>
      <FilterPosts
        uniqueTags={tags}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
      />
      <div className="w-full flex flex-col gap-2 bg-background-muted rounded-lg overflow-x-auto elevated p-4 pb-6">
        <h2 className="text-lg font-semibold tracking-tight text-foreground-highlight">Articles</h2>
        {sortedPosts.map((post) => (
          <a
            key={post.slug}
            className="flex flex-col space-y-1"
            href={`/blog/${post.slug}`}
          >
            <div className="grid grid-cols-3 gap-2">
              <p className="text-foreground-muted">
                {formatDate(post.metadata.publishedAt, false, isShort)}
              </p>
              <p className="col-span-2 text-foreground-highlight hover:text-foreground-highlight tracking-tight">
                {post.metadata.title}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
