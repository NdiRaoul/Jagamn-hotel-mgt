"use client";

import React from "react";
import { Settings, Database, Activity, Server, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SystemInfo {
  database: {
    staff: number;
    bookings: number;
    payments: number;
    rooms: number;
  };
  lastActivity: string;
  version: string;
  environment: string;
}

export default function SettingsClient({
  systemInfo,
}: {
  systemInfo: SystemInfo;
}) {
  const timeSinceActivity = () => {
    const now = new Date();
    const activity = new Date(systemInfo.lastActivity);
    const diffMs = now.getTime() - activity.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="manrope-bold text-4xl text-jagamn-primary">
            System Settings
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Read-only system information and configuration overview
          </p>
        </div>
        <Badge className="bg-green-100 text-green-700 text-xs font-bold px-4 py-2">
          <Activity className="w-4 h-4 mr-2" />
          System Healthy
        </Badge>
      </div>

      {/* System Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Version Info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-jagamn-primary">System Version</h3>
              <p className="text-sm text-gray-500">Application build info</p>
            </div>
          </div>
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Version</span>
              <span className="text-sm font-bold text-jagamn-primary">
                {systemInfo.version}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Environment</span>
              <Badge
                className={
                  systemInfo.environment === "production"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }
              >
                {systemInfo.environment}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Last Activity</span>
              <span className="text-sm font-medium text-gray-900">
                {timeSinceActivity()}
              </span>
            </div>
          </div>
        </div>

        {/* Database Stats */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Database className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-jagamn-primary">Database</h3>
              <p className="text-sm text-gray-500">Record counts</p>
            </div>
          </div>
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Staff Members</span>
              <span className="text-sm font-bold text-jagamn-primary">
                {systemInfo.database.staff}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Bookings</span>
              <span className="text-sm font-bold text-jagamn-primary">
                {systemInfo.database.bookings}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Payments</span>
              <span className="text-sm font-bold text-jagamn-primary">
                {systemInfo.database.payments}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Rooms</span>
              <span className="text-sm font-bold text-jagamn-primary">
                {systemInfo.database.rooms}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Server Status */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <Server className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-jagamn-primary">Server Status</h3>
            <p className="text-sm text-gray-500">All systems operational</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs font-bold text-green-700">Online</span>
              </div>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 w-full" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs font-bold text-green-700">
                  Connected
                </span>
              </div>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 w-full" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Payment Gateway</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs font-bold text-green-700">Active</span>
              </div>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Info Notice */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
            <Settings className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-blue-900 mb-1">Read-Only View</h3>
            <p className="text-sm text-blue-700">
              This is a read-only overview of system settings. Configuration
              changes must be made through environment variables or the admin
              portal. Contact your system administrator for write access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
