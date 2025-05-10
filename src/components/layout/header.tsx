import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import * as React from "react";

interface HeaderProps {
  onSearch?: (value: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const [search, setSearch] = React.useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <a href="/" className="mr-10 flex items-center space-x-2">
            <span className="text-xl font-bold">AI News Reader</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="hidden w-full max-w-sm md:flex">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search documents..."
                className="w-full bg-background rounded-md border border-input pl-8 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={search}
                onChange={handleChange}
              />
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
