"use client";

import { useState } from "react";
import { X, UtensilsCrossed, PackageCheck } from "lucide-react";
import { KitchenRequest } from "./data";
import Image from "next/image";
// ─── Status badge styles ──────────────────────────────────────────────────────
const statusStyles: Record<string, string> = {
  "NEEDS APPROVAL": "bg-amber-100 text-amber-700 border border-amber-300",
  "IN QUEUE": "bg-gray-100 text-gray-600 border border-gray-300",
  DISPATCHED: "bg-green-100 text-green-700 border border-green-300",
};

// ─── Confirmation Modal ───────────────────────────────────────────────────────
interface ConfirmModalProps {
  request: KitchenRequest;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDispatchModal({ request, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
      onClick={onCancel}
    >
      {/* Modal card */}
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-gray-800" />
            <h3 className="font-bold text-gray-900 text-base">Confirm Dispatch</h3>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-5 space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Order</span>
            <span className="font-semibold text-gray-900">#{request.orderNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Description</span>
            <span className="font-semibold text-gray-900">{request.title}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Requested by</span>
            <span className="font-semibold text-gray-900">{request.requestedBy}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Station</span>
            <span className="font-semibold text-gray-900">{request.station}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Items</span>
            <span className="font-semibold text-gray-900">{request.itemCount} items</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Priority</span>
            <span className="font-semibold text-gray-900">{request.priority}</span>
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-5">
          By confirming, you acknowledge that all {request.itemCount} items for{" "}
          <span className="font-medium text-gray-600">{request.title}</span> have been
          prepared and are ready for dispatch to{" "}
          <span className="font-medium text-gray-600">{request.station}</span>.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-300 text-gray-700 rounded-md py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-gray-900 text-white rounded-md py-2.5 text-sm font-bold hover:bg-gray-700 transition-colors active:scale-95"
          >
            Yes, Confirm Dispatch
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Single request card ──────────────────────────────────────────────────────
interface RequestCardProps {
  request: KitchenRequest;
  onConfirm: (id: string) => void;
  onDismiss: (id: string) => void;
}

function RequestCard({ request, onConfirm, onDismiss }: RequestCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  function handleConfirm() {
    setDispatched(true);
    setShowModal(false);
    // TODO: replace with → PATCH /kitchen-requests/:id { status: "DISPATCHED" }
    setTimeout(() => onConfirm(request.id), 800);
  }

  return (
    <>
      {/* Modal */}
      {showModal && (
        <ConfirmDispatchModal
          request={request}
          onConfirm={handleConfirm}
          onCancel={() => setShowModal(false)}
        />
      )}

      {/* Card */}
      <div className="bg-white border border-gray-200 rounded-lg flex items-center gap-4 p-3 shadow-sm">
        <Image
          src={request.image}
          alt={request.title}
          width={56}
          height={56}
          className="w-14 h-14 rounded-md object-cover shrink-0 bg-gray-100"
        />

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-tight">
            Order #{request.orderNumber}: {request.title}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Request from {request.requestedBy} &bull; {request.itemCount} Items &bull;{" "}
            {request.priority}
          </p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${statusStyles[request.status]}`}>
              {request.status}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide bg-gray-100 text-gray-600 border border-gray-300">
              {request.station}
            </span>
          </div>
        </div>

        {/* Dismiss */}
        <button
          onClick={() => onDismiss(request.id)}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 shrink-0"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Confirm trigger */}
        <button
          onClick={() => setShowModal(true)}
          disabled={dispatched}
          className={`shrink-0 px-4 py-3 rounded-md text-xs font-bold transition-all whitespace-pre-line ${
            dispatched
              ? "bg-green-600 text-white cursor-default"
              : "bg-gray-900 text-white hover:bg-gray-700 active:scale-95"
          }`}
        >
          {dispatched ? "Dispatched ✓" : "Confirm\nDispatch"}
        </button>
      </div>
    </>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────
interface PendingKitchenConfirmationsProps {
  requests: KitchenRequest[];
  onViewAll: () => void;
}

export function PendingKitchenConfirmations({ requests, onViewAll }: PendingKitchenConfirmationsProps) {
  const [items, setItems] = useState<KitchenRequest[]>(requests);

  function handleConfirm(id: string) {
    setItems((prev) => prev.filter((r) => r.id !== id));
  }

  function handleDismiss(id: string) {
    setItems((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <UtensilsCrossed className="w-4 h-4 text-amber-500" />
          Pending Kitchen Confirmations
        </h2>
        <button
          onClick={onViewAll}
          className="text-xs text-gray-500 hover:text-gray-800 transition-colors font-medium"
        >
          VIEW ALL REQUESTS
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {items.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-400 text-sm">
            No pending confirmations
          </div>
        ) : (
          items.map((r) => (
            <RequestCard
              key={r.id}
              request={r}
              onConfirm={handleConfirm}
              onDismiss={handleDismiss}
            />
          ))
        )}
      </div>
    </div>
  );
}