import { Package, AlertCircle, UserCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabaseAdmin } from "@/lib/supabase-server";
import { AccountButton } from "@/components/account/AccountPanel";

export const dynamic = "force-dynamic";

export default async function StorekeeperPage() {
  // Get open inventory requests for visibility
  const { data: openRequests } = await supabaseAdmin
    .from("inventory_requests")
    .select("id, item_name, quantity, status, created_at")
    .in("status", ["requested", "approved"])
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="manrope-bold text-4xl text-[#00152A]">
            Storekeeper Portal
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Inventory management and stock fulfillment
          </p>
        </div>
        <AccountButton isSidebarOpen={false} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-md text-[#00152A] hover:bg-gray-50 transition-colors shadow-sm font-medium text-sm" />
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-amber-50 border-l-4 border-amber-400 rounded-md p-8">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
          <div className="space-y-2">
            <h3 className="manrope-bold text-lg text-amber-900">
              Portal Under Development
            </h3>
            <p className="text-sm text-amber-800 leading-relaxed">
              The full storekeeper portal is currently being developed. Stock
              request notifications are active, but the fulfillment workflow and
              inventory management features will be added in the next phase.
            </p>
            <p className="text-xs text-amber-700 mt-4">
              <strong>Note:</strong> Kitchen orders can proceed to
              ready/delivered status without waiting for stock fulfillment.
            </p>
          </div>
        </div>
      </div>

      {/* Open Requests Preview */}
      {openRequests && openRequests.length > 0 && (
        <div className="bg-white rounded-md border border-gray-100 shadow-sm p-8 space-y-6">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-jagamn-primary" />
            <h2 className="manrope-bold text-xl text-jagamn-primary">
              Open Stock Requests
            </h2>
            <Badge className="bg-amber-100 text-amber-800 border-0">
              {openRequests.length}
            </Badge>
          </div>

          <div className="space-y-3">
            {openRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-md"
              >
                <div>
                  <p className="font-bold text-[#00152A]">
                    {request.quantity}x {request.item_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(request.created_at).toLocaleString()}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-[9px] uppercase tracking-wider"
                >
                  {request.status}
                </Badge>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500 italic">
            Full request management and fulfillment actions will be available
            when the portal is completed.
          </p>
        </div>
      )}

      {/* Placeholder Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-md border border-gray-100 shadow-sm p-8 space-y-4 opacity-50">
          <h3 className="manrope-bold text-lg text-[#00152A]">
            Inventory Management
          </h3>
          <p className="text-sm text-gray-500">
            Track stock levels, set reorder points, and manage inventory items.
          </p>
          <Badge variant="outline" className="text-[9px]">
            Coming Soon
          </Badge>
        </div>

        <div className="bg-white rounded-md border border-gray-100 shadow-sm p-8 space-y-4 opacity-50">
          <h3 className="manrope-bold text-lg text-[#00152A]">
            Request Fulfillment
          </h3>
          <p className="text-sm text-gray-500">
            Approve, fulfill, or reject stock requests from kitchen and other
            departments.
          </p>
          <Badge variant="outline" className="text-[9px]">
            Coming Soon
          </Badge>
        </div>

        <div className="bg-white rounded-md border border-gray-100 shadow-sm p-8 space-y-4 opacity-50">
          <h3 className="manrope-bold text-lg text-[#00152A]">
            Purchase Orders
          </h3>
          <p className="text-sm text-gray-500">
            Create and track purchase orders for restocking inventory.
          </p>
          <Badge variant="outline" className="text-[9px]">
            Coming Soon
          </Badge>
        </div>

        <div className="bg-white rounded-md border border-gray-100 shadow-sm p-8 space-y-4 opacity-50">
          <h3 className="manrope-bold text-lg text-[#00152A]">Stock Reports</h3>
          <p className="text-sm text-gray-500">
            View inventory reports, usage trends, and low-stock alerts.
          </p>
          <Badge variant="outline" className="text-[9px]">
            Coming Soon
          </Badge>
        </div>
      </div>

      {/* TODO Marker */}
      <div className="bg-gray-50 rounded-md p-6 border border-dashed border-gray-300">
        <p className="text-xs text-gray-500 font-mono">
          // TODO(storekeeper): Build full portal + fulfillment workflow
          <br />
          // - Stock request approval/rejection
          <br />
          // - Inventory item CRUD
          <br />
          // - Stock level adjustments
          <br />
          // - Purchase order management
          <br />
          // - Low-stock alerts dashboard
          <br />
          // - Usage reports and analytics
        </p>
      </div>
    </div>
  );
}
