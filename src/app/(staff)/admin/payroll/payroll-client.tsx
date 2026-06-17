"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Filter,
  CheckCircle2,
  Search,
  Edit2,
  Banknote,
  Calendar,
  Plus,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { formatMoney } from "@/lib/currency";
import type { PayrollRun, PayrollItem } from "@/lib/data/payroll";

interface Props {
  runs: PayrollRun[];
  items: PayrollItem[];
  error: string | null;
}

export default function PayrollClient({
  runs,
  items: initialItems,
  error,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [sendingPayslipFor, setSendingPayslipFor] = useState<string | null>(
    null,
  );
  const [selectedRunId, setSelectedRunId] = useState(runs[0]?.id || "");
  const [items, setItems] = useState(initialItems);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [editingItem, setEditingItem] = useState<PayrollItem | null>(null);
  const [editGross, setEditGross] = useState("");
  const [editDeductions, setEditDeductions] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const selectedRun = runs.find((r) => r.id === selectedRunId);

  const paidCount = items.filter((i) => i.payment_status === "paid").length;

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const q = searchQuery.toLowerCase();
        return (
          !searchQuery ||
          item.staff?.full_name.toLowerCase().includes(q) ||
          item.staff?.email.toLowerCase().includes(q) ||
          item.staff?.role.toLowerCase().includes(q)
        );
      }),
    [items, searchQuery],
  );

  const handleRunChange = async (runId: string) => {
    setSelectedRunId(runId);
    setSelectedItems(new Set());

    // Fetch items for this run
    const res = await fetch(`/api/admin/payroll/runs/${runId}/items`);
    if (res.ok) {
      const data = await res.json();
      setItems(data.items || []);
    }
  };

  const handleGenerateRun = async () => {
    setIsGenerating(true);
    try {
      const now = new Date();
      const periodLabel = `${now.toLocaleString("default", { month: "long" })} ${now.getFullYear()}`;
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];

      const res = await fetch("/api/admin/payroll/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period_label: periodLabel,
          period_start: periodStart,
          period_end: periodEnd,
        }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApproveRun = async () => {
    if (!selectedRun) return;

    const res = await fetch(`/api/admin/payroll/runs/${selectedRun.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    });

    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      alert(`Error: ${data.error}`);
    }
  };

  const handleEditItem = (item: PayrollItem) => {
    setEditingItem(item);
    setEditGross((item.gross_minor / 100).toFixed(2));
    setEditDeductions((item.deductions_minor / 100).toFixed(2));
    setEditNotes(item.notes || "");
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    const gross_minor = Math.round(parseFloat(editGross) * 100);
    const deductions_minor = Math.round(parseFloat(editDeductions) * 100);

    const res = await fetch(`/api/admin/payroll/items/${editingItem.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gross_minor, deductions_minor, notes: editNotes }),
    });

    if (res.ok) {
      setEditingItem(null);
      router.refresh();
    } else {
      const data = await res.json();
      alert(`Error: ${data.error}`);
    }
  };

  const handleBulkPay = async () => {
    if (selectedItems.size === 0) return;

    setIsPaying(true);
    try {
      const res = await fetch("/api/admin/payroll/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemIds: Array.from(selectedItems),
          payment_date: paymentDate,
        }),
      });

      if (res.ok) {
        setSelectedItems(new Set());
        router.refresh();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } finally {
      setIsPaying(false);
    }
  };

  const handleSendPayslip = async (item: PayrollItem) => {
    if (!item.staff_id) return;
    setSendingPayslipFor(item.id);
    try {
      const res = await fetch("/api/admin/payroll/payslip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId: item.staff_id,
          periodLabel: selectedRun?.period_label,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Payslip sent",
          description: `${item.staff?.full_name ?? "Staff"} was notified${
            data.emailSent ? " by email" : ""
          } and can view it in their account.`,
        });
      } else {
        toast({
          title: "Could not send payslip",
          description: data.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({
        title: "Could not send payslip",
        description: e?.message || "Network error",
        variant: "destructive",
      });
    } finally {
      setSendingPayslipFor(null);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Name",
      "Role",
      "Department",
      "Gross (FCFA)",
      "Deductions (FCFA)",
      "Net (FCFA)",
      "Status",
      "Paid Date",
    ];
    const csvRows = filteredItems.map((item) => [
      item.staff?.full_name || "",
      item.staff?.role || "",
      item.staff?.department || "",
      (item.gross_minor / 100).toFixed(0),
      (item.deductions_minor / 100).toFixed(0),
      (item.net_minor / 100).toFixed(0),
      item.payment_status,
      item.paid_at || "",
    ]);
    const csv = [headers.join(","), ...csvRows.map((r) => r.join(","))].join(
      "\n",
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute(
      "download",
      `Jagamn_Payroll_${selectedRun?.period_label || "Export"}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map((i) => i.id)));
    }
  };

  const toggleSelectItem = (id: string) => {
    const newSet = new Set(selectedItems);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedItems(newSet);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      draft: { label: "Draft", className: "bg-gray-100 text-gray-700" },
      approved: { label: "Approved", className: "bg-green-100 text-green-700" },
      closed: { label: "Closed", className: "bg-blue-100 text-blue-700" },
    };
    const variant = variants[status] || variants.draft;
    return (
      <Badge
        className={cn("text-[10px] font-black uppercase", variant.className)}
      >
        {variant.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      unpaid: { label: "Unpaid", className: "bg-gray-100 text-gray-700" },
      processing: {
        label: "Processing",
        className: "bg-yellow-100 text-yellow-700",
      },
      paid: { label: "Paid", className: "bg-green-100 text-green-700" },
      failed: { label: "Failed", className: "bg-red-100 text-red-700" },
    };
    const variant = variants[status] || variants.unpaid;
    return (
      <Badge
        className={cn("text-[10px] font-black uppercase", variant.className)}
      >
        {variant.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 animate-in fade-in duration-700">
      <div className="mx-auto pt-8 md:pt-12 space-y-8 md:space-y-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-2 text-center lg:text-left">
            <p className="text-[10px] font-black text-[#0D2137]/40 uppercase tracking-[0.4em]">
              Financial Suite
            </p>
            <h1 className="manrope-bold text-3xl md:text-5xl text-[#0D2137] tracking-tight">
              Payroll Management
            </h1>
            {error && (
              <p className="text-red-500 text-sm font-medium">{error}</p>
            )}
          </div>

          <div className="flex flex-col gap-2 w-full lg:w-auto">
            <p className="text-[9px] font-black text-[#43474D] uppercase tracking-widest text-center lg:text-right">
              Payroll Run
            </p>
            <Select value={selectedRunId} onValueChange={handleRunChange}>
              <SelectTrigger className="w-full lg:w-[280px] h-12 bg-white border-gray-100 rounded-xl shadow-sm manrope-bold text-sm text-[#0D2137]">
                <SelectValue placeholder="Select Run" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100 shadow-2xl">
                {runs.map((run) => (
                  <SelectItem
                    key={run.id}
                    value={run.id}
                    className="manrope-bold"
                  >
                    {run.period_label} {getStatusBadge(run.status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-[#0D2137]">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
              Gross Total
            </p>
            <h3 className="manrope-bold text-3xl text-[#0D2137] tracking-tight">
              {selectedRun
                ? formatMoney(Math.round(selectedRun.gross_total_minor / 100))
                : "—"}
            </h3>
          </div>
          <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-[#E8924A]">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
              Net Total
            </p>
            <h3 className="manrope-bold text-3xl text-[#0D2137] tracking-tight">
              {selectedRun
                ? formatMoney(Math.round(selectedRun.net_total_minor / 100))
                : "—"}
            </h3>
          </div>
          <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-green-500">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
              Paid
            </p>
            <h3 className="manrope-bold text-2xl text-[#0D2137] tracking-tight">
              {paidCount} / {items.length}
            </h3>
          </div>
          <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-slate-400">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
              Run Status
            </p>
            <div className="mt-2">
              {selectedRun ? getStatusBadge(selectedRun.status) : "—"}
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="manrope-bold text-lg md:text-xl text-[#0D2137]">
              Payroll Items
            </h2>
            <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search staff..."
                  className="h-10 bg-gray-50 border-gray-100 rounded-xl pl-10 text-[10px] font-black uppercase tracking-widest shadow-sm"
                />
              </div>
              <Button
                onClick={handleExportCSV}
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-xl text-slate-400 hover:text-[#0D2137] hover:bg-gray-50 shrink-0"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left" style={{ minWidth: 1000 }}>
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-50">
                  <th className="px-6 md:px-8 py-5 w-12">
                    <Checkbox
                      checked={
                        selectedItems.size === filteredItems.length &&
                        filteredItems.length > 0
                      }
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                    Staff
                  </th>
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-[#43474D] uppercase tracking-widest text-right">
                    Gross
                  </th>
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-[#43474D] uppercase tracking-widest text-right">
                    Deductions
                  </th>
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-[#43474D] uppercase tracking-widest text-right">
                    Net
                  </th>
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-[#43474D] uppercase tracking-widest text-center">
                    Status
                  </th>
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-[#43474D] uppercase tracking-widest text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredItems.map((item) => {
                  return (
                    <tr
                      key={item.id}
                      className="group hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 md:px-8 py-5">
                        <Checkbox
                          checked={selectedItems.has(item.id)}
                          onCheckedChange={() => toggleSelectItem(item.id)}
                        />
                      </td>
                      <td className="px-6 md:px-8 py-5">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8 border border-gray-100">
                            {item.staff?.avatar_url && (
                              <AvatarImage src={item.staff.avatar_url} />
                            )}
                            <AvatarFallback className="text-[10px] font-black">
                              {item.staff?.full_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="manrope-bold text-sm text-[#0D2137] block">
                              {item.staff?.full_name}
                            </span>
                            <span className="text-[9px] font-black text-slate-400 uppercase">
                              {item.staff?.role}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 md:px-8 py-5 text-right">
                        <span className="manrope-bold text-sm text-[#0D2137]">
                          {formatMoney(Math.round(item.gross_minor / 100))}
                        </span>
                      </td>
                      <td className="px-6 md:px-8 py-5 text-right">
                        <span className="manrope-bold text-sm text-[#0D2137]">
                          {formatMoney(Math.round(item.deductions_minor / 100))}
                        </span>
                      </td>
                      <td className="px-6 md:px-8 py-5 text-right">
                        <span className="manrope-bold text-sm text-[#0D2137]">
                          {formatMoney(Math.round(item.net_minor / 100))}
                        </span>
                      </td>
                      <td className="px-6 md:px-8 py-5 text-center">
                        {getPaymentStatusBadge(item.payment_status)}
                      </td>
                      <td className="px-6 md:px-8 py-5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            onClick={() => handleEditItem(item)}
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 rounded-lg"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleSendPayslip(item)}
                            disabled={sendingPayslipFor === item.id}
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 rounded-lg text-[#0D2137] hover:text-[#E8924A]"
                            title="Send payslip"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredItems.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-8 py-20 text-center text-slate-400 manrope-bold italic"
                    >
                      {items.length === 0
                        ? "No payroll items for this run."
                        : "No items match your search."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-6 md:p-8 bg-gray-50/30 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs font-bold text-slate-400">
              Showing {filteredItems.length} of {items.length} items
            </p>
            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-auto flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <Input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="h-10 w-full sm:w-40 text-sm"
                />
              </div>
              <Button
                onClick={handleBulkPay}
                disabled={selectedItems.size === 0 || isPaying}
                className="w-full sm:w-auto h-10 px-6 bg-green-600 hover:bg-green-700 text-white"
              >
                <Banknote className="w-4 h-4 mr-2" />
                Pay Selected ({selectedItems.size})
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 md:gap-5">
          <Button
            onClick={handleGenerateRun}
            disabled={isGenerating}
            variant="ghost"
            className="w-full sm:w-auto h-14 md:h-16 px-8 md:px-10 rounded-2xl bg-[#0D2137]/5 text-[#0D2137] manrope-bold text-sm md:text-base"
          >
            <Plus className="w-5 h-5 mr-2" />
            {isGenerating ? "Generating..." : "Generate New Run"}
          </Button>
          {selectedRun?.status === "draft" && (
            <Button
              onClick={handleApproveRun}
              className="w-full sm:w-auto h-14 md:h-16 px-8 md:px-10 rounded-2xl bg-[#E8924A] hover:bg-[#E8924A]/90 text-white manrope-bold"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Approve Run
            </Button>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payroll Item</DialogTitle>
            <DialogDescription>
              Adjust gross, deductions, or add notes for{" "}
              {editingItem?.staff?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Gross (FCFA)</Label>
              <Input
                type="number"
                step="0.01"
                value={editGross}
                onChange={(e) => setEditGross(e.target.value)}
              />
            </div>
            <div>
              <Label>Deductions (FCFA)</Label>
              <Input
                type="number"
                step="0.01"
                value={editDeductions}
                onChange={(e) => setEditDeductions(e.target.value)}
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Input
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Optional notes"
              />
            </div>
            <div className="text-sm text-slate-500">
              Net:{" "}
              {formatMoney(
                Math.round(parseFloat(editGross) - parseFloat(editDeductions)),
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingItem(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
