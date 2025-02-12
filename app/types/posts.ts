// Stored on the .mdx document itself
export type PostMetadata = {
  title: string;
  publishedAt: string;
  summary: string;
  tags?: string[];
  image?: string;
};

export type Post = {
  metadata: PostMetadata;
  slug: string;
  content: string;
};
