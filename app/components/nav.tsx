import Link from "next/link";
import { ThemeToggle } from "@/app/components/theme-toggle";

type NavItem = {
  name: string;
  badge?: string;
};

const navItems: Record<string, NavItem> = {
  "/": {
    name: "about",
  },
  "/blog": {
    name: "blog",
  },
  "/divelog": {
    name: "divelog",
    badge: "New",
  },
};

export function Navbar() {
  return (
    <aside className="-ml-[8px] mb-16 tracking-tight">
      <div className="lg:sticky lg:top-20">
        <nav
          className="flex flex-row items-start relative px-0 pb-0 fade md:overflow-auto scroll-pr-6 md:relative"
          id="nav"
        >
          <div className="flex flex-row space-x-0 items-center w-full justify-between">
            <div className="flex flex-row space-x-0">
              {Object.entries(navItems).map(([path, item]) => {
                return (
                  <Link
                    key={path}
                    href={path}
                    className="transition-all hover:text-foreground-highlight dark:hover:text-foreground-highlight flex align-middle relative py-1 px-2 m-1"
                  >
                    {item.name}
                    {item.badge && (
                      <span className="ml-1 -mt-2 h-4 px-1 flex items-center justify-center text-[0.75rem] font-medium rounded-md bg-green-500 border border-green-300">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
            <div>
              <ThemeToggle />
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
}
