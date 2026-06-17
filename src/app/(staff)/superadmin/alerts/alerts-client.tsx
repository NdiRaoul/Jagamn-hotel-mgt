"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  RefreshCcw,
  ShieldAlert,
  CheckCircle,
  Clock,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { SystemAlert } from "@/lib/data/alerts";
import type { Staff } from "@/types/database";
import { cn } from "@/lib/utils";

interface AlertsClientProps {
  alerts: SystemAlert[];
  stats: { urgent: number; pending: number; resolved: number };
  staff: Staff[];
}

export default function AlertsClient({
  alerts: initialAlerts,
  stats,
  staff,
}: AlertsClientProps) {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState(initialAlerts);
  const [selectedAlert, setSelectedAlert] = useState<SystemAlert | null>(null);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [assignedSpecialist, setAssignedSpecialist] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "critical":
        return <AlertCircle className="w-5 h-5" />;
      case "high":
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "text-red-500 bg-red-50 border-red-500";
      case "high":
        return "text-orange-500 bg-orange-50 border-orange-500";
      case "medium":
        return "text-yellow-500 bg-yellow-50 border-yellow-500";
      default:
        return "text-gray-500 bg-gray-50 border-gray-500";
    }
  };

  const getAlertTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      urgent: "Urgent",
      guest_complaint: "Guest Complaint",
      sync_failure: "Sync Failure",
      security: "Security Alert",
      procurement: "Procurement",
    };
    return labels[type] || type;
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (activeTab === "all") return true;
    if (activeTab === "urgent") return alert.priority === "critical";
    if (activeTab === "guest_complaints")
      return alert.alert_type === "guest_complaint";
    if (activeTab === "sync_failures")
      return alert.alert_type === "sync_failure";
    if (activeTab === "resolved") return alert.status === "resolved";
    return true;
  });

  const handleTakeAction = (alert: SystemAlert) => {
    setSelectedAlert(alert);
    setIsResolveDialogOpen(true);
  };

  const handleResolve = async () => {
    if (!selectedAlert) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/alerts/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alert_id: selectedAlert.id,
          resolution_notes: resolutionNotes,
          assigned_to: assignedSpecialist || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to resolve alert");
      }

      const updatedAlert = await response.json();

      setAlerts(
        alerts.map((a) => (a.id === updatedAlert.id ? updatedAlert : a)),
      );
      setIsResolveDialogOpen(false);
      setSelectedAlert(null);
      setResolutionNotes("");
      setAssignedSpecialist("");

      toast({
        title: "Success",
        description: "Alert resolved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve alert",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-2">
            Real-Time Operations
          </p>
          <h1 className="manrope-bold text-2xl sm:text-4xl text-jagamn-primary mb-2">
            System Alert Center
          </h1>
        </div>
        <div className="flex items-center gap-6 sm:shrink-0">
          <div className="text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              Active Urgent
            </p>
            <p className="manrope-bold text-3xl text-red-600">{stats.urgent}</p>
          </div>
          <div className="w-px h-12 bg-gray-200" />
          <div className="text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              Pending Actions
            </p>
            <p className="manrope-bold text-3xl text-orange-600">
              {stats.pending}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex w-full bg-white p-1 rounded-xl shadow-sm h-auto overflow-x-auto no-scrollbar gap-1">
          <TabsTrigger
            value="all"
            className="ml-4 data-[state=active]:bg-jagamn-primary data-[state=active]:text-white rounded-lg font-bold text-sm whitespace-nowrap flex-1 min-w-fit"
          >
            All Alerts
          </TabsTrigger>
          <TabsTrigger
            value="urgent"
            className="data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg font-bold text-sm whitespace-nowrap flex-1 min-w-fit"
          >
            Urgent
          </TabsTrigger>
          <TabsTrigger
            value="guest_complaints"
            className="data-[state=active]:bg-orange-600 data-[state=active]:text-white rounded-lg font-bold text-sm whitespace-nowrap flex-1 min-w-fit"
          >
            Complaints
          </TabsTrigger>
          <TabsTrigger
            value="sync_failures"
            className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white rounded-lg font-bold text-sm whitespace-nowrap flex-1 min-w-fit"
          >
            Failures
          </TabsTrigger>
          <TabsTrigger
            value="resolved"
            className="data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg font-bold text-sm whitespace-nowrap flex-1 min-w-fit"
          >
            Resolved
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-8">
          <div className="space-y-4">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 font-medium">
                  No alerts in this category
                </p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "bg-white p-6 rounded-2xl shadow-sm border-l-4 hover:shadow-md transition-all",
                    getPriorityColor(alert.priority),
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4 flex-1">
                      <div
                        className={cn(
                          "shrink-0 mt-0.5",
                          getPriorityColor(alert.priority).split(" ")[0],
                        )}
                      >
                        {getPriorityIcon(alert.priority)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge
                                className={cn(
                                  "text-[9px] font-bold uppercase",
                                  getPriorityColor(alert.priority),
                                )}
                              >
                                {alert.priority}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                ID: {alert.id.slice(0, 8)}... •{" "}
                                {alert.module || "System"}
                              </span>
                            </div>
                            <h4 className="manrope-bold text-base text-jagamn-primary mb-2">
                              {alert.title}
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {alert.description}
                            </p>
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                            {new Date(alert.created_at).toLocaleString()}
                          </span>
                        </div>

                        {alert.assigned_staff && (
                          <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                            <User className="w-3 h-3" />
                            <span>
                              Assigned to: {alert.assigned_staff.full_name}
                            </span>
                          </div>
                        )}

                        {alert.status === "resolved" &&
                          alert.resolution_notes && (
                            <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                              <p className="text-xs font-bold text-green-800 mb-1">
                                Resolution Notes:
                              </p>
                              <p className="text-xs text-green-700">
                                {alert.resolution_notes}
                              </p>
                            </div>
                          )}
                      </div>
                    </div>

                    {alert.status !== "resolved" && (
                      <Button
                        onClick={() => handleTakeAction(alert)}
                        className="bg-jagamn-primary hover:bg-jagamn-tertiary text-white font-bold whitespace-nowrap"
                      >
                        Take Action
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination placeholder */}
          {filteredAlerts.length > 20 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button variant="outline" size="sm">
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-jagamn-primary text-white"
              >
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <span className="text-gray-400">...</span>
              <Button variant="outline" size="sm">
                72
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Resolve Alert Dialog */}
      <Dialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-jagamn-primary">
              Resolve Alert
            </DialogTitle>
            <DialogDescription>{selectedAlert?.title}</DialogDescription>
          </DialogHeader>

          {selectedAlert && (
            <div className="space-y-6 pt-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    className={cn(
                      "text-[9px] font-bold uppercase",
                      getPriorityColor(selectedAlert.priority),
                    )}
                  >
                    {selectedAlert.priority}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {getAlertTypeLabel(selectedAlert.alert_type)}
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  {selectedAlert.description}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold">Assign Specialist</Label>
                <Select
                  value={assignedSpecialist}
                  onValueChange={setAssignedSpecialist}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select a specialist..." />
                  </SelectTrigger>
                  <SelectContent>
                    {staff
                      .filter((s) =>
                        ["owner", "admin", "manager"].includes(s.role),
                      )
                      .map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.full_name} - {s.role}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold">Resolution Notes</Label>
                <Textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Enter resolution details or escalation steps..."
                  className="min-h-[120px] resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleResolve}
                  disabled={isSubmitting || !resolutionNotes}
                  className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-bold"
                >
                  {isSubmitting ? "Resolving..." : "Complete Resolution"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsResolveDialogOpen(false);
                    setSelectedAlert(null);
                    setResolutionNotes("");
                    setAssignedSpecialist("");
                  }}
                  disabled={isSubmitting}
                  className="h-12"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
