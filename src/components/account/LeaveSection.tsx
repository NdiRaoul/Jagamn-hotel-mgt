"use client";

import React, { useState, useEffect } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, X, Calendar } from "lucide-react";

interface LeaveType {
  id: string;
  name: string;
  code: string;
  color: string;
}

interface LeaveBalance {
  leave_type_id: string;
  leave_type_name: string;
  balance_days: number;
}

interface LeaveRequest {
  id: string;
  leave_type_id: string;
  leave_type_name: string;
  start_date: string;
  end_date: string;
  days: number;
  reason: string | null;
  status: string;
  created_at: string;
}

export function LeaveSection() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    loadLeaveData();
  }, []);

  async function loadLeaveData() {
    try {
      setLoading(true);
      const res = await fetch("/api/account/leave");
      if (!res.ok) throw new Error("Failed to load leave data");
      const data = await res.json();
      setRequests(data.requests || []);
      setBalances(data.balances || []);
      setLeaveTypes(data.leaveTypes || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitRequest() {
    if (!leaveTypeId || !startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/account/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leave_type_id: leaveTypeId,
          start_date: startDate,
          end_date: endDate,
          reason: reason || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit request");
      }

      toast({
        title: "Success",
        description: "Leave request submitted",
      });

      // Reset form
      setLeaveTypeId("");
      setStartDate("");
      setEndDate("");
      setReason("");
      setDialogOpen(false);

      // Reload data
      loadLeaveData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancelRequest(requestId: string) {
    if (!confirm("Are you sure you want to cancel this leave request?")) return;

    try {
      const res = await fetch(`/api/account/leave?id=${requestId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to cancel request");

      toast({
        title: "Success",
        description: "Leave request cancelled",
      });

      loadLeaveData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-jagamn-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Leave Balances */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-jagamn-primary">
            Leave Balances
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {balances.map((balance) => (
            <div
              key={balance.leave_type_id}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                {balance.leave_type_name}
              </p>
              <p className="text-2xl font-bold text-jagamn-primary mt-1">
                {balance.balance_days}
                <span className="text-sm text-gray-500 ml-1">days</span>
              </p>
            </div>
          ))}
          {balances.length === 0 && (
            <p className="text-sm text-gray-500 col-span-full">
              No leave balances available
            </p>
          )}
        </div>
      </div>

      {/* Leave Requests */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-jagamn-primary">My Requests</h3>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-jagamn-primary hover:bg-jagamn-tertiary">
                <Plus className="w-4 h-4 mr-2" />
                Request Leave
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Leave</DialogTitle>
                <DialogDescription>
                  Submit a new leave request for approval
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="leave-type">Leave Type *</Label>
                  <Select value={leaveTypeId} onValueChange={setLeaveTypeId}>
                    <SelectTrigger id="leave-type">
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      {leaveTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-date">Start Date *</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date">End Date *</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="reason">Reason (optional)</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Provide a reason for your leave request"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSubmitRequest}
                    disabled={submitting}
                    className="flex-1 bg-jagamn-primary hover:bg-jagamn-tertiary"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Submit Request"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {requests.map((request) => (
            <div
              key={request.id}
              className="p-4 bg-white rounded-lg border border-gray-200 hover:border-jagamn-primary transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-jagamn-primary">
                      {request.leave_type_name}
                    </h4>
                    <span
                      className={`px-2 py-1 text-xs font-bold uppercase tracking-wider rounded ${
                        request.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : request.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(request.start_date).toLocaleDateString()} -{" "}
                      {new Date(request.end_date).toLocaleDateString()}
                    </span>
                    <span className="font-medium">{request.days} days</span>
                  </div>
                  {request.reason && (
                    <p className="text-sm text-gray-500 mt-2">
                      {request.reason}
                    </p>
                  )}
                </div>
                {request.status === "pending" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancelRequest(request.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {requests.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-8">
              No leave requests yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
