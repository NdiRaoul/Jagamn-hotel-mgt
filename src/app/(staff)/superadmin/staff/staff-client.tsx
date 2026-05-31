"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Users, Download, Search, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Staff } from "@/types/database";

interface StaffClientProps {
  staff: Staff[];
}

const RoleBadge = ({ role }: { role: string }) => {
  const styles: Record<string, string> = {
    owner: "bg-purple-100 text-purple-700",
    admin: "bg-blue-100 text-blue-700",
    manager: "bg-green-100 text-green-700",
    reception: "bg-cyan-100 text-cyan-700",
    kitchen: "bg-orange-100 text-orange-700",
    storekeeper: "bg-gray-100 text-gray-700",
  };

  return (
    <Badge
      className={cn(
        "text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 border-0",
        styles[role] || "bg-gray-100 text-gray-600",
      )}
    >
      {role}
    </Badge>
  );
};

export default function StaffClient({ staff }: StaffClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const router = useRouter();

  const filteredStaff = useMemo(() => {
    return staff.filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        s.full_name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q) ||
        s.staff_code?.toLowerCase().includes(q) ||
        s.department?.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "all" || s.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [staff, searchQuery, statusFilter]);

  const handleExportCSV = () => {
    const headers = [
      "Staff Code",
      "Name",
      "Email",
      "Role",
      "Department",
      "Status",
      "Hire Date",
    ];
    const rows = filteredStaff.map((s) => [
      s.staff_code || "",
      s.full_name,
      s.email,
      s.role,
      s.department || "",
      s.status,
      s.hire_date || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Staff_Directory_${new Date().toLocaleDateString()}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="manrope-bold text-4xl text-jagamn-primary">
            Staff Directory
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Read-only view of all staff members
          </p>
        </div>
        <Button
          onClick={handleExportCSV}
          variant="outline"
          className="h-12 px-6 rounded-xl border-gray-100 bg-white gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            Total Staff
          </p>
          <p className="manrope-bold text-4xl text-jagamn-primary">
            {staff.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            Active
          </p>
          <p className="manrope-bold text-4xl text-green-600">
            {staff.filter((s) => s.status === "active").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            Suspended
          </p>
          <p className="manrope-bold text-4xl text-yellow-600">
            {staff.filter((s) => s.status === "suspended").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            Removed
          </p>
          <p className="manrope-bold text-4xl text-red-600">
            {staff.filter((s) => s.status === "removed").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff by name, email, role, or code..."
            className="h-12 bg-white border-gray-100 rounded-xl pl-12"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-12 px-4 bg-white border border-gray-100 rounded-xl text-sm font-medium"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="removed">Removed</option>
        </select>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Staff Member
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Code
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Department
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 font-medium">
                      {searchQuery
                        ? "No matching staff found"
                        : "No staff members yet"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border-2 border-gray-100">
                          {member.avatar_url && (
                            <AvatarImage src={member.avatar_url} />
                          )}
                          <AvatarFallback className="bg-jagamn-tertiary text-white text-xs font-bold">
                            {initials(member.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-sm text-jagamn-primary">
                            {member.full_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-gray-600">
                        {member.staff_code || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <RoleBadge role={member.role} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {member.department || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        className={cn(
                          "text-[9px] font-bold uppercase",
                          member.status === "active"
                            ? "bg-green-100 text-green-700"
                            : member.status === "suspended"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700",
                        )}
                      >
                        {member.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(`/superadmin/staff/${member.id}`)
                        }
                        className="h-8 px-3 gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Read-Only Notice */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-blue-900 mb-1">Read-Only View</h3>
            <p className="text-sm text-blue-700">
              This is a read-only overview of staff members. To add, edit, or
              manage staff, use the Admin portal at /admin/staff.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
