"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

interface SearchFilterProps {
  placeholder?: string;
  categories?: string[];
  onSearch?: (query: string) => void;
  onFilter?: (filters: Record<string, string>) => void;
}

export default function SearchFilter({
  placeholder = "بحث...",
  categories = [],
  onSearch,
  onFilter,
}: SearchFilterProps) {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const handleSearch = () => {
    onSearch?.(query);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder={placeholder}
            className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                onSearch?.("");
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <SlidersHorizontal className="w-4 h-4" />
          تصفية
        </button>
        <button
          onClick={handleSearch}
          className="px-6 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors"
        >
          بحث
        </button>
      </div>

      {showFilters && (
        <div className="bg-gray-50 rounded-xl p-4 flex flex-wrap gap-4 items-end">
          {categories.length > 0 && (
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                التصنيف
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  onFilter?.({ category: e.target.value, sortBy });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value="">الكل</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="min-w-[200px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              ترتيب حسب
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                onFilter?.({ category: selectedCategory, sortBy: e.target.value });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value="newest">الأحدث</option>
              <option value="oldest">الأقدم</option>
              <option value="price-high">السعر: من الأعلى</option>
              <option value="price-low">السعر: من الأقل</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
