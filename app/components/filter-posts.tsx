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
      <h2 className="text-foreground-muted">Filter tagged</h2>
      <div className="flex gap-1">
        {uniqueTags.map((tag) => (
          <button
            key={tag}
            onClick={setSelectedTag.bind(null, tag)}
            className={`${
              tag === selectedTag
                ? "bg-background-highlight text-foreground-highlight"
                : "bg-background-muted text-foreground-muted"
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
