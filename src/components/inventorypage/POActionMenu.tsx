"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Eye, Pencil, PackageCheck, FileText, Trash2 } from "lucide-react";

type POStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "RECEIVED" | "RECONCILED";

interface POActionMenuProps {
  status: POStatus;
  onView: () => void;
  onEdit: () => void;
  onReceiveGoods: () => void;
  onViewGRN: () => void;
  onDelete: () => void;
}

export function POActionMenu({
  status,
  onView,
  onEdit,
  onReceiveGoods,
  onViewGRN,
  onDelete,
}: POActionMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-30 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-44">
          <button
            onClick={() => { onView(); setOpen(false); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> View Details
          </button>

          {status === "DRAFT" && (
            <button
              onClick={() => { onEdit(); setOpen(false); }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit PO
            </button>
          )}

          {status === "APPROVED" && (
            <button
              onClick={() => { onReceiveGoods(); setOpen(false); }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <PackageCheck className="w-3.5 h-3.5" /> Receive Goods
            </button>
          )}

          {(status === "RECEIVED" || status === "RECONCILED") && (
            <button
              onClick={() => { onViewGRN(); setOpen(false); }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" /> View GRN
            </button>
          )}

          {status === "DRAFT" && (
            <>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={() => { onDelete(); setOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Draft
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}