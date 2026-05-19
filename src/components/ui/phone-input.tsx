"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import countries from "@/constants/countries.json";

export type Country = {
  code: string;
  name: string;
  dial: string;
  flag: string;
};

type Props = {
  value: string;                        // full value e.g. "+237 670000000"
  onChange: (full: string) => void;     // called with dial + " " + local number
  placeholder?: string;
  className?: string;
  required?: boolean;
  defaultCountryCode?: string;          // ISO code e.g. "CM"
};

export function PhoneInput({
  value,
  onChange,
  placeholder = "Enter number",
  className,
  required,
  defaultCountryCode = "CM",
}: Props) {
  // Parse initial value into dial + local parts
  const parseValue = (v: string): { dial: string; local: string } => {
    const country = countries.find((c) => v.startsWith(c.dial + " "));
    if (country) {
      return { dial: country.dial, local: v.slice(country.dial.length + 1) };
    }
    // Try matching just the dial code without space
    const byDial = countries.find((c) => v.startsWith(c.dial));
    if (byDial) {
      return { dial: byDial.dial, local: v.slice(byDial.dial.length).trim() };
    }
    const def = countries.find((c) => c.code === defaultCountryCode) ?? countries[0];
    return { dial: def.dial, local: v };
  };

  const { dial: initDial, local: initLocal } = parseValue(value);
  const [selectedDial, setSelectedDial] = useState(initDial);
  const [localNumber, setLocalNumber] = useState(initLocal);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedCountry = useMemo(
    () => countries.find((c) => c.dial === selectedDial) ?? countries.find((c) => c.code === defaultCountryCode) ?? countries[0],
    [selectedDial, defaultCountryCode]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.includes(q) ||
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

  function selectCountry(c: Country) {
    setSelectedDial(c.dial);
    setOpen(false);
    setSearch("");
    onChange(`${c.dial} ${localNumber}`);
  }

  function handleLocalChange(e: React.ChangeEvent<HTMLInputElement>) {
    const local = e.target.value.replace(/[^\d\s\-]/g, ""); // digits, spaces, hyphens only
    setLocalNumber(local);
    onChange(`${selectedDial} ${local}`);
  }

  return (
    <div ref={dropdownRef} className={cn("relative flex items-stretch", className)}>
      {/* Dial code selector */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-gray-50 border border-r-0 border-gray-200 rounded-l-md px-3 h-12 hover:bg-gray-100 transition-colors flex-shrink-0 min-w-[90px]"
      >
        <span className="text-lg leading-none">{selectedCountry.flag}</span>
        <span className="text-sm font-bold text-jagamn-primary">{selectedDial}</span>
        <ChevronDown className={cn("w-3 h-3 text-gray-400 transition-transform", open && "rotate-180")} />
      </button>

      {/* Number input */}
      <input
        type="tel"
        value={localNumber}
        onChange={handleLocalChange}
        placeholder={placeholder}
        required={required}
        className="flex-1 h-12 bg-gray-50 border border-gray-200 rounded-r-md px-3 text-sm text-jagamn-primary focus:outline-none focus:border-jagamn-primary transition-colors placeholder:text-gray-400"
      />

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-72 bg-white border border-gray-200 rounded-md shadow-xl overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country or code…"
                className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-jagamn-primary"
              />
            </div>
          </div>

          {/* List */}
          <ul className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-xs text-gray-400 text-center">No results</li>
            ) : (
              filtered.map((c) => (
                <li key={c.code}>
                  <button
                    type="button"
                    onClick={() => selectCountry(c)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors",
                      c.dial === selectedDial && "bg-jagamn-neutral"
                    )}
                  >
                    <span className="text-lg leading-none w-6 flex-shrink-0">{c.flag}</span>
                    <span className="flex-1 text-xs font-medium text-jagamn-primary truncate">{c.name}</span>
                    <span className="text-xs font-bold text-jagamn-secondary flex-shrink-0">{c.dial}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
