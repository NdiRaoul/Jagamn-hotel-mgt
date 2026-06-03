"use client";

import React, { useState, useMemo } from "react";
import {
  History,
  User,
  FileText,
  Calendar,
  MapPin,
  Filter,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

interface AuditLogEntry {
  id: number;
  actor_id: string | null;
  actor_role: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  payload: Record<string, unknown> | null;
  ip: string | null;
  created_at: string;
}

const ITEMS_PER_PAGE = 20;

export default function AuditClient({ logs }: { logs: AuditLogEntry[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  // Extract unique actions and roles for filters
  const uniqueActions = useMemo(() => {
    const actions = new Set(logs.map((log) => log.action));
    return Array.from(actions).sort();
  }, [logs]);

  const uniqueRoles = useMemo(() => {
    const roles = new Set(
      logs.map((log) => log.actor_role).filter((role) => role !== null),
    );
    return Array.from(roles).sort();
  }, [logs]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        log.action.toLowerCase().includes(q) ||
        log.actor_role?.toLowerCase().includes(q) ||
        log.target_type?.toLowerCase().includes(q) ||
        log.target_id?.toLowerCase().includes(q) ||
        log.ip?.toLowerCase().includes(q);

      const matchesAction =
        actionFilter === "all" || log.action === actionFilter;
      const matchesRole = roleFilter === "all" || log.actor_role === roleFilter;

      return matchesSearch && matchesAction && matchesRole;
    });
  }, [logs, searchQuery, actionFilter, roleFilter]);

  // Pagination - automatically reset to page 1 if current page exceeds total pages
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const safePage = currentPage > totalPages ? 1 : currentPage;

  const paginatedLogs = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredLogs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLogs, safePage]);

  const getActionColor = (action: string) => {
    if (action.includes("create") || action.includes("insert"))
      return "bg-green-100 text-green-700 border-green-200";
    if (action.includes("update") || action.includes("edit"))
      return "bg-blue-100 text-blue-700 border-blue-200";
    if (action.includes("delete") || action.includes("remove"))
      return "bg-red-100 text-red-700 border-red-200";
    if (action.includes("login") || action.includes("auth"))
      return "bg-purple-100 text-purple-700 border-purple-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  const handleExport = () => {
    const csv = [
      [
        "Timestamp",
        "Action",
        "Actor Role",
        "Actor ID",
        "Target Type",
        "Target ID",
        "IP Address",
      ],
      ...filteredLogs.map((log) => [
        new Date(log.created_at).toISOString(),
        log.action,
        log.actor_role || "",
        log.actor_id || "",
        log.target_type || "",
        log.target_id || "",
        log.ip || "",
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setActionFilter("all");
    setRoleFilter("all");
  };

  const hasActiveFilters =
    searchQuery || actionFilter !== "all" || roleFilter !== "all";

  return (
    <div className="p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="manrope-bold text-4xl text-jagamn-primary mb-2">
            Audit Logs
          </h1>
          <p className="text-gray-500 text-sm">
            Complete system activity trail for compliance and security
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
            <History className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">
              {filteredLogs.length}{" "}
              {filteredLogs.length === 1 ? "entry" : "entries"}
            </span>
          </div>
          <Button
            onClick={handleExport}
            variant="outline"
            className="gap-2 border-jagamn-primary text-jagamn-primary hover:bg-jagamn-primary hover:text-white"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-jagamn-primary" />
            <h3 className="font-bold text-jagamn-primary">Filters</h3>
          </div>
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs..."
              className="pl-10 h-11 bg-gray-50 border-gray-200"
            />
          </div>

          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="h-11 bg-gray-50 border-gray-200">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {uniqueActions.map((action) => (
                <SelectItem key={action} value={action}>
                  {action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="h-11 bg-gray-50 border-gray-200">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {uniqueRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/80 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Timestamp
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Action
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Actor
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Target
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  IP Address
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 font-medium mb-1">
                      {hasActiveFilters
                        ? "No matching logs found"
                        : "No audit logs yet"}
                    </p>
                    {hasActiveFilters && (
                      <Button
                        onClick={clearFilters}
                        variant="link"
                        className="text-jagamn-primary"
                      >
                        Clear filters
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                        <div>
                          <div className="text-gray-900 font-medium">
                            {new Date(log.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(log.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        className={cn(
                          "text-[9px] font-bold uppercase tracking-wider border",
                          getActionColor(log.action),
                        )}
                      >
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {log.actor_role || "System"}
                          </p>
                          {log.actor_id && (
                            <p className="text-xs text-gray-500 font-mono">
                              {log.actor_id.slice(0, 8)}...
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {log.target_type ? (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {log.target_type}
                            </p>
                            {log.target_id && (
                              <p className="text-xs text-gray-500 font-mono">
                                {log.target_id.slice(0, 12)}...
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {log.ip ? (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="text-gray-600 font-mono">
                            {log.ip}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        onClick={() => setSelectedLog(log)}
                        variant="ghost"
                        size="sm"
                        className="text-jagamn-primary hover:text-jagamn-tertiary hover:bg-jagamn-primary/10"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredLogs.length)} of{" "}
              {filteredLogs.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "w-9 h-9",
                        currentPage === pageNum &&
                          "bg-jagamn-primary hover:bg-jagamn-tertiary",
                      )}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
                className="gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-jagamn-primary">
              Audit Log Details
            </DialogTitle>
            <DialogDescription>
              Complete information about this audit entry
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(selectedLog.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Action
                  </label>
                  <div className="mt-1">
                    <Badge
                      className={cn(
                        "border",
                        getActionColor(selectedLog.action),
                      )}
                    >
                      {selectedLog.action}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Actor Role
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedLog.actor_role || "System"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Actor ID
                  </label>
                  <p className="text-sm text-gray-900 mt-1 font-mono">
                    {selectedLog.actor_id || "—"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Target Type
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedLog.target_type || "—"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Target ID
                  </label>
                  <p className="text-sm text-gray-900 mt-1 font-mono">
                    {selectedLog.target_id || "—"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    IP Address
                  </label>
                  <p className="text-sm text-gray-900 mt-1 font-mono">
                    {selectedLog.ip || "—"}
                  </p>
                </div>
              </div>

              {selectedLog.payload && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Payload
                  </label>
                  <pre className="mt-2 p-4 bg-gray-50 rounded-lg text-xs overflow-x-auto border border-gray-200">
                    {JSON.stringify(selectedLog.payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
            <History className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-blue-900 mb-1">
              Audit Log Retention Policy
            </h3>
            <p className="text-sm text-blue-700">
              All system actions are logged for compliance and security
              purposes. Logs are retained for 90 days and automatically
              archived. Critical security events are flagged for immediate
              review by system administrators.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
