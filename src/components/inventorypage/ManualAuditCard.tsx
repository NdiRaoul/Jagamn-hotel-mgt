"use client";

import { useState } from "react";
import { X, ScanLine, CheckCircle2 } from "lucide-react";

// ─── Audit Mode Modal (simulated) ─────────────────────────────────────────────
function AuditModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"scanning" | "done">("scanning");

  function handleComplete() {
    setStep("done");
    // TODO: replace with → POST /inventory/audit { completedAt: new Date() }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-gray-800" />
            <h3 className="font-bold text-gray-900 text-base">
              {step === "scanning" ? "Manual Inventory Audit" : "Audit Complete"}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === "scanning" ? (
          <>
            <div className="bg-gray-50 rounded-lg p-5 mb-5 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center animate-pulse">
                <ScanLine className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm text-gray-500 text-center">
                Audit mode active. Scan or manually verify each item against the palace ledger.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5">
              <p className="text-xs text-amber-700 font-medium">
                Syncing with Palace Reserve ledger. Discrepancies will be flagged automatically.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 rounded-md py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 bg-amber-500 text-white rounded-md py-2.5 text-sm font-bold hover:bg-amber-600 active:scale-95 transition-all"
              >
                Mark as Complete
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 py-4">
            <CheckCircle2 className="w-14 h-14 text-green-500" />
            <p className="font-semibold text-gray-900 text-center">Audit synced successfully</p>
            <p className="text-sm text-gray-400 text-center">
              Stock levels have been updated in the palace ledger.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-gray-900 text-white rounded-md py-2.5 text-sm font-bold hover:bg-gray-700 active:scale-95 transition-all"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function ManualAuditCard() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {showModal && <AuditModal onClose={() => setShowModal(false)} />}

      <div className="w-72 shrink-0 bg-gray-900 rounded-xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
            Quick Action
          </p>
          <h2 className="text-xl font-bold text-white mb-3">Manual Inventory Audit</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Start a handheld digital audit to sync current physical stock with the palace ledger.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="mt-6 w-full bg-amber-500 hover:bg-amber-400 active:scale-95 text-white font-bold py-3 rounded-lg text-sm transition-all"
        >
          Launch Audit Mode
        </button>
      </div>
    </>
  );
}