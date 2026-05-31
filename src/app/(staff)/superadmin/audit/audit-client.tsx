"use client";

import React, { useState } from "react";
import { History, User, FileText, Calendar, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AuditLogEntry {
  id: number;
  actor_id: string | null;
  actor_role: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  payload: any;
  ip: string | null;
  created_at: string;
}

export default function AuditClient({ logs }: { logs: AuditLogEntry[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.actor_role?.toLowerCase().includes(q) ||
      log.target_type?.toLowerCase().includes(q) ||
      log.target_id?.toLowerCase().includes(q)
    );
  });

  const getActionColor = (action: string) => {
    if (action.includes("create") || action.includes("insert"))
      return "bg-green-100 text-green-700";
    if (action.includes("update") || action.includes("edit"))
      return "bg-blue-100 text-blue-700";
    if (action.includes("delete") || action.includes("remove"))
      return "bg-red-100 text-red-700";
    if (action.includes("login") || action.includes("auth"))
      return "bg-purple-100 text-purple-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="manrope-bold text-4xl text-jagamn-primary">
            Audit Logs
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Complete system activity trail for compliance and security
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <History className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600 font-medium">
            {logs.length} entries
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by action, role, target type, or ID..."
          className="h-12 bg-gray-50 border-0"
        />
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Timestamp
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Action
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Actor
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Target
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 font-medium">
                      {searchQuery
                        ? "No matching logs found"
                        : "No audit logs yet"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        className={cn(
                          "text-[9px] font-bold uppercase tracking-wider",
                          getActionColor(log.action),
                        )}
                      >
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
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
                          <FileText className="w-4 h-4 text-gray-400" />
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
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 font-mono">
                            {log.ip}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
            <History className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-blue-900 mb-1">
              Audit Log Retention
            </h3>
            <p className="text-sm text-blue-700">
              All system actions are logged for compliance. Logs are retained
              for 90 days and automatically archived. Critical security events
              are flagged for immediate review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
