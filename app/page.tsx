import { AllPosts } from "@/app/components/posts-client";
import { getBlogPosts, getMDXData } from "@/app/blog/utils";
import { CustomMDX } from "@/app/components/mdx";
import { Navbar } from "@/app/components/nav";
import Footer from "@/app/components/footer";
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
    <div className="max-w-xl mx-4 mt-8 sm:mx-auto">
      <main className="flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0">
        <Navbar />
        <section className="flex flex-col gap-4">
          <h1 className="text-2xl tracking-tighter flex gap-1">Joel Huang</h1>
          <article className="prose">
            <CustomMDX source={bio.content} />
          </article>
          <AllPosts posts={posts} tags={finalTags} />
        </section>
        <Footer />
      </main>
    </div>
  );
}
