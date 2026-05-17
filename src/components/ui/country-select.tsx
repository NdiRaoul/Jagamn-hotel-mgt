"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import countries from "@/constants/countries.json";

type Props = {
  value: string;                  // ISO country code e.g. "CM" or country name
  onChange: (code: string, name: string) => void;
  placeholder?: string;
  className?: string;
  /** If true, onChange receives the country name instead of ISO code */
  returnName?: boolean;
};

export function CountrySelect({
  value,
  onChange,
  placeholder = "Select country",
  className,
  returnName = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Resolve display from either ISO code or name
  const selected = useMemo(() => {
    if (!value) return null;
    return (
      countries.find((c) => c.code === value) ??
      countries.find((c) => c.name.toLowerCase() === value.toLowerCase()) ??
      null
    );
  }, [value]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return countries;
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [search]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Focus search when dropdown opens
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  function handleSelect(code: string, name: string) {
    onChange(code, name);
    setOpen(false);
    setSearch("");
  }

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 bg-gray-50 border border-gray-200 rounded-md px-3 h-12 hover:border-jagamn-primary transition-colors text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          {selected ? (
            <>
              <span className="text-lg leading-none flex-shrink-0">{selected.flag}</span>
              <span className="text-sm font-semibold text-jagamn-primary truncate">{selected.name}</span>
            </>
          ) : (
            <span className="text-sm text-gray-400">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={cn("w-4 h-4 text-gray-400 flex-shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-xl overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country…"
                className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-jagamn-primary"
              />
            </div>
          </div>

          {/* List */}
          <ul className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-xs text-gray-400 text-center">No results</li>
            ) : (
              filtered.map((c) => {
                const isSelected = selected?.code === c.code;
                return (
                  <li key={c.code}>
                    <button
                      type="button"
                      onClick={() => handleSelect(c.code, c.name)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors",
                        isSelected && "bg-jagamn-neutral"
                      )}
                    >
                      <span className="text-lg leading-none w-6 flex-shrink-0">{c.flag}</span>
                      <span className="flex-1 text-xs font-medium text-jagamn-primary truncate">{c.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-jagamn-primary flex-shrink-0" />}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
