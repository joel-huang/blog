import { inconsolata } from "@/app/fonts";

interface FilterPostsProps {
  uniqueTags: string[];
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
}

const FilterPosts: React.FC<FilterPostsProps> = ({
  uniqueTags,
  selectedTag,
  setSelectedTag,
}) => {
  return (
    <div className="flex justify-end gap-2 mb-6 text-xs">
      <h2 className="text-neutral-600 dark:text-neutral-300">Filter tagged</h2>
      <div className="flex gap-1">
        {uniqueTags.map((tag) => (
          <button
            key={tag}
            onClick={setSelectedTag.bind(null, tag)}
            className={`${
              tag === selectedTag
                ? "dark:bg-neutral-400 dark:text-neutral-800 bg-neutral-200"
                : "dark:bg-neutral-800 dark:text-neutral-400 bg-neutral-100"
            } elevated rounded-sm px-1 ${inconsolata.className}`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterPosts;
