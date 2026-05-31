import React from "react";
import { HelpCircle, Book, Phone, Mail } from "lucide-react";

export default function KitchenHelpPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 max-w-4xl">
      <div>
        <h1 className="manrope-bold text-4xl text-[#00152A]">
          Kitchen Help & Support
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Quick reference guide for kitchen operations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Orders Management */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#FFF4E8] flex items-center justify-center">
            <Book className="w-6 h-6 text-[#BA722E]" />
          </div>
          <h3 className="manrope-bold text-xl text-[#00152A]">
            Orders Management
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              • <strong>New Orders:</strong> Click "Acknowledge" to move to
              preparation
            </li>
            <li>
              • <strong>In Preparation:</strong> Click "Mark as Ready" when
              complete
            </li>
            <li>
              • <strong>Ready Orders:</strong> Automatically notifies guests
            </li>
            <li>
              • <strong>Stock Issues:</strong> Submit request to store keeper
            </li>
          </ul>
        </div>

        {/* Menu Management */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#E6F4EA] flex items-center justify-center">
            <Book className="w-6 h-6 text-[#1B7F34]" />
          </div>
          <h3 className="manrope-bold text-xl text-[#00152A]">
            Menu Management
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              • Toggle availability switches to mark items in/out of stock
            </li>
            <li>• Click "Add New Item" to create menu items</li>
            <li>• Select category and add optional image URL</li>
            <li>• Changes reflect immediately on guest menus</li>
          </ul>
        </div>

        {/* Inventory Requests */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#FEF2F0] flex items-center justify-center">
            <Book className="w-6 h-6 text-[#EA580C]" />
          </div>
          <h3 className="manrope-bold text-xl text-[#00152A]">
            Inventory Requests
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Submit requests for low-stock items</li>
            <li>• Store keeper will confirm availability</li>
            <li>• Green badge = stock confirmed, proceed with order</li>
            <li>• Red badge = unavailable, notify guest</li>
          </ul>
        </div>

        {/* Reporting */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#F4F6F8] flex items-center justify-center">
            <Book className="w-6 h-6 text-[#00152A]" />
          </div>
          <h3 className="manrope-bold text-xl text-[#00152A]">Reporting</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• View daily order volume and trends</li>
            <li>• Track unavailability incidents</li>
            <li>• Monitor top-selling items</li>
            <li>• Export reports for management review</li>
          </ul>
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-[#00152A] rounded-xl p-8 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="manrope-bold text-xl mb-2">Need Additional Help?</h3>
            <p className="text-gray-400 text-sm mb-4">
              Contact the IT support team or your manager for technical
              assistance.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-[#BA722E]" />
                <span>Ext. 2100</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-[#BA722E]" />
                <span>support@jagamnpalace.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
