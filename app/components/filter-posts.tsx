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
      <h2 className="text-neutral-300">Filter tagged</h2>
      <div className="flex gap-1">
        {uniqueTags.map((tag) => (
          <button
            key={tag}
            onClick={setSelectedTag.bind(null, tag)}
            className={`${
              tag === selectedTag
                ? "bg-neutral-400 text-neutral-800"
                : "bg-neutral-800 text-neutral-400"
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
