"use client";

import React, { useState, useEffect } from "react";
import {
  WalletCards,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building2,
  Phone,
  CreditCard,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { PayoutAccount } from "@/lib/data/self-service";

const PAYOUT_METHODS = [
  { id: "mtn_momo", label: "MTN Mobile Money", icon: Phone, color: "text-yellow-600", bg: "bg-yellow-50" },
  { id: "orange_money", label: "Orange Money", icon: Phone, color: "text-orange-600", bg: "bg-orange-50" },
  { id: "bank", label: "Bank Transfer", icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
  { id: "stripe", label: "Stripe", icon: CreditCard, color: "text-indigo-600", bg: "bg-indigo-50" },
];

export function PayoutSection() {
  const [accounts, setAccounts] = useState<PayoutAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("mtn_momo");
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [provider, setProvider] = useState("");

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/account/payout");
      if (!res.ok) throw new Error("Failed to fetch accounts");
      const data = await res.json();
      setAccounts(data.accounts || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAddAccount = async () => {
    if (selectedMethod !== "stripe" && (!accountHolder || !accountNumber)) {
      alert("Please fill in all required fields");
      return;
    }
    setIsAdding(true);
    try {
      const res = await fetch("/api/account/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: selectedMethod,
          provider: provider || undefined,
          account_number: accountNumber,
          account_holder_name: accountHolder,
        }),
      });
      if (res.ok) {
        setIsAddOpen(false);
        setAccountHolder("");
        setAccountNumber("");
        setProvider("");
        setSelectedMethod("mtn_momo");
        fetchAccounts();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAdding(false);
    }
  };

  const handleSetDefault = async (accountId: string) => {
    try {
      const res = await fetch("/api/account/payout", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_id: accountId }),
      });
      if (res.ok) {
        setAccounts((prev) => prev.map((a) => ({ ...a, is_default: a.id === accountId })));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm("Delete this payout account?")) return;
    try {
      const res = await fetch(`/api/account/payout?id=${accountId}`, { method: "DELETE" });
      if (res.ok) {
        setAccounts((prev) => prev.filter((a) => a.id !== accountId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="manrope-bold text-lg text-[#0D2137]">Payout Methods</h2>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Method
        </Button>
      </div>

      {accounts.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
          <WalletCards className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-sm">No payout methods added yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((account) => {
            const methodConfig = PAYOUT_METHODS.find((m) => m.id === account.method) || PAYOUT_METHODS[0];
            const Icon = methodConfig.icon;
            return (
              <div
                key={account.id}
                className={`p-6 rounded-2xl border-2 transition-all ${
                  account.is_default
                    ? "border-[#E8924A] bg-[#E8924A]/5"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${methodConfig.bg}`}>
                    <Icon className={`w-6 h-6 ${methodConfig.color}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    {account.is_default && (
                      <Badge className="bg-[#E8924A] text-white text-[10px] uppercase font-black">
                        Default
                      </Badge>
                    )}
                    {account.is_verified ? (
                      <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        <span className="text-[10px] uppercase font-black">Verified</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-yellow-200 bg-yellow-50 text-yellow-700">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        <span className="text-[10px] uppercase font-black">Pending</span>
                      </Badge>
                    )}
                  </div>
                </div>

                <h3 className="manrope-bold text-[#0D2137]">{methodConfig.label}</h3>
                {account.method === "stripe" ? (
                  <p className="text-sm text-slate-500 mt-1">Stripe Connect Account</p>
                ) : (
                  <div className="space-y-1 mt-2">
                    <p className="text-sm text-slate-600 font-medium">{account.account_holder_name}</p>
                    <p className="text-xs text-slate-500 font-mono">
                      •••• {account.account_last4 || account.account_number?.slice(-4)}
                    </p>
                    {account.provider && <p className="text-xs text-slate-400">{account.provider}</p>}
                  </div>
                )}

                <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-100">
                  {!account.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(account.id)}
                      className="flex-1 text-xs font-bold"
                    >
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAccount(account.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 px-3"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payout Method</DialogTitle>
            <DialogDescription>Add a new way to receive your salary</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Method *</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {PAYOUT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-3 rounded-lg border text-left text-sm font-medium transition-colors ${
                      selectedMethod === method.id
                        ? "border-[#0D2137] bg-[#0D2137] text-white"
                        : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            {selectedMethod !== "stripe" && (
              <>
                <div>
                  <Label>Account Holder Name *</Label>
                  <Input
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    placeholder="Full name on account"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Account Number *</Label>
                  <Input
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder={selectedMethod === "bank" ? "IBAN / Account Number" : "Phone number"}
                    className="mt-1"
                  />
                </div>
                {selectedMethod === "bank" && (
                  <div>
                    <Label>Bank Name</Label>
                    <Input
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      placeholder="e.g. UBA, Ecobank"
                      className="mt-1"
                    />
                  </div>
                )}
              </>
            )}
            {selectedMethod === "stripe" && (
              <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-lg">
                You will be redirected to Stripe to securely connect your bank account for payouts.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddOpen(false)} disabled={isAdding}>
              Cancel
            </Button>
            <Button onClick={handleAddAccount} disabled={isAdding}>
              {isAdding ? "Adding..." : "Add Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
