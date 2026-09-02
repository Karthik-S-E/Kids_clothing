import { useState } from "react";
import { Search, X } from "lucide-react";

interface NavbarSearchProps {
  onSearch: (term: string) => void;
}

export function NavbarSearch({ onSearch }: NavbarSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onSearch(val);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
    setIsOpen(false);
  };

  return (
    <div className="relative flex items-center">
      {isOpen ? (
        <div className="flex items-center bg-black/60 border border-amber-500/40 rounded-full px-3 py-1 text-sm shadow-inner transition-all w-48 sm:w-64">
          <Search className="w-4 h-4 text-amber-400 shrink-0 mr-2" />
          <input
            type="text"
            value={query}
            onChange={handleChange}
            autoFocus
            placeholder="Search dresses, kurtas..."
            className="bg-transparent text-white placeholder-gray-400 text-xs sm:text-sm focus:outline-none w-full"
          />
          <button onClick={handleClear} className="text-gray-400 hover:text-white ml-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-gray-300 hover:text-amber-400 transition-colors"
          aria-label="Open search"
        >
          <Search className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      )}
    </div>
  );
}