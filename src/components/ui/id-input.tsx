"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import idTypes from "@/constants/id-types.json";

export type IdType = (typeof idTypes)[number];

type Props = {
  idType: string;
  idNumber: string;
  onTypeChange: (value: string) => void;
  onNumberChange: (value: string) => void;
  className?: string;
  required?: boolean;
  /** Visual size variant */
  size?: "sm" | "md";
};

export function IdInput({
  idType,
  idNumber,
  onTypeChange,
  onNumberChange,
  className,
  required,
  size = "md",
}: Props) {
  const selected = useMemo(
    () => idTypes.find((t) => t.value === idType) ?? idTypes[0],
    [idType]
  );

  const h = size === "sm" ? "h-11" : "h-12";

  return (
    <div className={cn("space-y-3", className)}>
      {/* Type selector — pill tabs */}
      <div className="flex flex-wrap gap-2">
        {idTypes.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => onTypeChange(t.value)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all",
              idType === t.value
                ? "bg-jagamn-primary text-white border-jagamn-primary"
                : "bg-white text-jagamn-secondary border-gray-200 hover:border-jagamn-primary hover:text-jagamn-primary"
            )}
          >
            <span className="text-sm leading-none">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Number input */}
      <div className="relative">
        <input
          type="text"
          value={idNumber}
          onChange={(e) => onNumberChange(e.target.value)}
          placeholder={selected.placeholder}
          required={required}
          className={cn(
            "w-full bg-gray-50 border border-gray-200 rounded-md px-4 text-sm text-jagamn-primary focus:outline-none focus:border-jagamn-primary transition-colors placeholder:text-gray-400",
            h
          )}
        />
      </div>

      {/* Hint */}
      <p className="text-[10px] text-gray-400 leading-relaxed">
        <span className="font-bold text-jagamn-secondary">{selected.label}:</span>{" "}
        {selected.hint} — <span className="italic">{selected.format}</span>
      </p>
    </div>
  );
}
