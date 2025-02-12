import fs from "fs";
import path from "path";
import { Post, PostMetadata } from "@/app/types/posts";

function parseFrontmatter(fileContent: string) {
  let frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
  let match = frontmatterRegex.exec(fileContent);
  let frontMatterBlock = match![1];
  let content = fileContent.replace(frontmatterRegex, "").trim();
  let frontMatterLines = frontMatterBlock.trim().split("\n");
  let metadata: Partial<PostMetadata> = {};

  frontMatterLines.forEach((line) => {
    let [key, ...valueArr] = line.split(": ");
    let value = valueArr.join(": ").trim();
    value = value.replace(/^['"](.*)['"]$/, "$1"); // Remove quotes
    switch (key) {
      case "tags":
        value = value.slice(1, -1);
        metadata.tags = value.split(", ");
        break;
      default:
        metadata[key] = value;
    }
  });

  return { metadata: metadata as PostMetadata, content };
}

function readMDXFile(filePath) {
  let rawContent = fs.readFileSync(filePath, "utf-8");
  return parseFrontmatter(rawContent);
}

export function getMDXData(dir) {
  let mdxFiles: Post[] = [];
  let items = fs.readdirSync(dir);

  items.forEach((item) => {
    let fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      mdxFiles = mdxFiles.concat(getMDXData(fullPath));
    } else if (path.extname(item) === ".mdx") {
      let { metadata, content } = readMDXFile(fullPath);
      let slug = path.basename(fullPath, path.extname(fullPath));
      mdxFiles.push({ metadata, slug, content });
    }
  });

  return mdxFiles;
}

export function getBlogPosts() {
  return getMDXData(path.join(process.cwd(), "app", "blog", "posts"));
}

export function formatDate(date: string, includeRelative = false) {
  let currentDate = new Date();
  if (!date.includes("T")) {
    date = `${date}T00:00:00`;
  }
  let targetDate = new Date(date);

  let yearsAgo = currentDate.getFullYear() - targetDate.getFullYear();
  let monthsAgo = currentDate.getMonth() - targetDate.getMonth();
  let daysAgo = currentDate.getDate() - targetDate.getDate();

  let formattedDate = "";

  if (yearsAgo > 0) {
    formattedDate = `${yearsAgo}y ago`;
  } else if (monthsAgo > 0) {
    formattedDate = `${monthsAgo}mo ago`;
  } else if (daysAgo > 0) {
    formattedDate = `${daysAgo}d ago`;
  } else {
    formattedDate = "Today";
  }

  let fullDate = targetDate.toLocaleString("en-us", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (!includeRelative) {
    return fullDate;
  }

  return `${fullDate} (${formattedDate})`;
}
