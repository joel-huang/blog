import { AllPosts } from "@/app/components/posts-client";
import { getBlogPosts, getMDXData } from "@/app/blog/utils";
import { CustomMDX } from "@/app/components/mdx";
import path from "path";

const foundBios = getMDXData(path.join(process.cwd(), "app", "bio"));

export default function Home() {
  const bio = foundBios.find((post) => post.slug === "bio");
  if (!bio) {
    return <></>;
  }

  let posts = getBlogPosts();
  let tags = posts
    .flatMap((post) => post.metadata.tags)
    .filter((tag): tag is string => tag !== undefined);
  let finalTags = ["all"];
  finalTags = [...finalTags, ...Array.from(new Set(tags))];

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl tracking-tighter flex gap-1">Joel Huang</h1>
      <article className="prose">
        <CustomMDX source={bio.content} />
      </article>
      <AllPosts posts={posts} tags={finalTags} />
    </section>
  );
}
