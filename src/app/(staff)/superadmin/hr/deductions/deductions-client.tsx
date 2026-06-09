"use client";

import React, { useState } from "react";
import { TrendingDown, DollarSign, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { StaffDeduction } from "@/lib/data/deductions";
import type { Staff } from "@/types/database";

interface DeductionsClientProps {
  deductions: StaffDeduction[];
  monthlyTotal: number;
  stats: { pending: number; resolved: number };
  staff: Staff[];
}

export default function DeductionsClient({
  deductions: initialDeductions,
  monthlyTotal,
  stats,
  staff,
}: DeductionsClientProps) {
  const { toast } = useToast();
  const [deductions, setDeductions] = useState(initialDeductions);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDeduction, setSelectedDeduction] =
    useState<StaffDeduction | null>(null);

  // The owner may only apply deductions to admin/manager staff. Everyone else
  // is view-only here, so they're excluded from the target dropdown.
  const eligibleStaff = staff.filter((s) =>
    ["admin", "manager"].includes(s.role),
  );

  // Form state
  const [selectedStaff, setSelectedStaff] = useState("");
  const [deductionType, setDeductionType] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const formatCurrency = (amountMinor: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amountMinor / 100);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      absence: "bg-red-100 text-red-700",
      damage: "bg-orange-100 text-orange-700",
      equipment: "bg-yellow-100 text-yellow-700",
      late: "bg-blue-100 text-blue-700",
      unexcused: "bg-purple-100 text-purple-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  const handleSubmit = async () => {
    if (!selectedStaff || !deductionType || !amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/hr/deductions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staff_id: selectedStaff,
          type: deductionType,
          amount_minor: Math.round(parseFloat(amount) * 100),
          reason: reason || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create deduction");
      }

      const newDeduction = await response.json();

      setDeductions([newDeduction, ...deductions]);
      setSelectedStaff("");
      setDeductionType("");
      setAmount("");
      setReason("");

      toast({
        title: "Success",
        description: "Deduction applied successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply deduction",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="manrope-bold text-4xl text-jagamn-primary mb-2">
            Deductions & Penalties
          </h1>
          <p className="text-gray-500 text-sm">
            Enforce professional standards through precise financial
            adjustments. Manage disciplinary actions and resource recovery with
            editorial clarity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Monthly Impact
            </p>
            <p className="manrope-bold text-2xl text-jagamn-primary flex items-center gap-2">
              {formatCurrency(monthlyTotal)}
              <TrendingDown className="w-5 h-5 text-orange-500" />
            </p>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Add New Deduction Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-jagamn-primary/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-jagamn-primary" />
            </div>
            <h3 className="manrope-bold text-lg text-jagamn-primary">
              Add New Deduction
            </h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Staff Member
              </Label>
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select an employee..." />
                </SelectTrigger>
                <SelectContent>
                  {eligibleStaff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.full_name} - {s.staff_code}
                    </SelectItem>
                  ))}
                  {eligibleStaff.length === 0 && (
                    <div className="px-3 py-2 text-xs text-gray-400">
                      No admin/manager staff available.
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Type
                </Label>
                <Select value={deductionType} onValueChange={setDeductionType}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="absence">Absence</SelectItem>
                    <SelectItem value="damage">Damage</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                    <SelectItem value="unexcused">Unexcused</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Amount (XAF)
                </Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="h-12"
                  step="0.01"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Reason Field
              </Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Provide detailed context for the penalty..."
                className="min-h-[100px] resize-none"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting || !selectedStaff || !deductionType || !amount
              }
              className="w-full h-12 bg-jagamn-primary hover:bg-jagamn-tertiary manrope-bold"
            >
              {isSubmitting ? "Applying..." : "Apply Penalty →"}
            </Button>
          </div>
        </div>

        {/* Right: Recent Deductions & Stats */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Deductions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="manrope-bold text-lg text-jagamn-primary">
                Recent Deductions Applied
              </h3>
              <button className="text-sm text-jagamn-primary hover:text-jagamn-tertiary font-bold">
                View Full History ↗
              </button>
            </div>

            <div className="space-y-4">
              {deductions.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 font-medium">
                    No deductions applied yet
                  </p>
                </div>
              ) : (
                deductions.map((deduction) => (
                  <div
                    key={deduction.id}
                    className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <Avatar className="w-12 h-12 border-2 border-white">
                      {deduction.staff?.avatar_url && (
                        <AvatarImage src={deduction.staff.avatar_url} />
                      )}
                      <AvatarFallback className="bg-jagamn-tertiary text-white text-sm font-bold">
                        {deduction.staff?.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-bold text-jagamn-primary">
                            {deduction.staff?.full_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {deduction.staff?.department} •{" "}
                            {deduction.staff?.position}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="manrope-bold text-lg text-red-600">
                            -{formatCurrency(deduction.amount_minor)}
                          </p>
                          <button
                            type="button"
                            onClick={() => setSelectedDeduction(deduction)}
                            title="View details"
                            className="text-slate-400 hover:text-jagamn-primary transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          className={`text-[9px] font-bold uppercase ${getTypeColor(deduction.type)}`}
                        >
                          {deduction.type}
                        </Badge>
                        <Badge className="bg-gray-100 text-gray-600 text-[9px] font-bold uppercase">
                          {deduction.type === "absence" ? "Unexcused" : ""}
                        </Badge>
                      </div>

                      {deduction.reason && (
                        <p className="text-sm text-gray-600 italic">
                          "{deduction.reason}"
                        </p>
                      )}

                      <p className="text-xs text-gray-400 mt-2">
                        Applied{" "}
                        {new Date(deduction.applied_date).toLocaleDateString()},{" "}
                        {new Date(deduction.applied_date).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Policy Compliance Card */}
          <div className="bg-gradient-to-br from-[#0D2137] to-[#1a3a5c] rounded-2xl p-8 text-white">
            <h3 className="manrope-bold text-xl mb-2">Policy Compliance</h3>
            <p className="text-white/80 text-sm mb-6">
              94% of deductions were successfully resolved through the employee
              grievance portal this Quarter.
            </p>

            <div className="flex items-center gap-8">
              <div>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">
                  Pending
                </p>
                <p className="manrope-bold text-4xl text-orange-400">
                  {stats.pending}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">
                  Resolved
                </p>
                <p className="manrope-bold text-4xl text-green-400">
                  {stats.resolved}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Read-only deduction details modal */}
      <Dialog
        open={!!selectedDeduction}
        onOpenChange={(open) => !open && setSelectedDeduction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deduction Details</DialogTitle>
            <DialogDescription>
              {selectedDeduction?.staff?.full_name}
            </DialogDescription>
          </DialogHeader>
          {selectedDeduction && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Amount</span>
                <span className="font-bold text-red-600">
                  -{formatCurrency(selectedDeduction.amount_minor)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Type</span>
                <Badge
                  className={`text-[9px] font-bold uppercase ${getTypeColor(selectedDeduction.type)}`}
                >
                  {selectedDeduction.type}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Applied</span>
                <span className="font-semibold text-jagamn-primary">
                  {new Date(
                    selectedDeduction.applied_date,
                  ).toLocaleString()}
                </span>
              </div>
              {selectedDeduction.staff?.department && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Department</span>
                  <span className="font-semibold text-jagamn-primary">
                    {selectedDeduction.staff.department}
                  </span>
                </div>
              )}
              {selectedDeduction.reason && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-gray-400 block mb-1">Reason</span>
                  <p className="text-jagamn-primary italic">
                    "{selectedDeduction.reason}"
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
