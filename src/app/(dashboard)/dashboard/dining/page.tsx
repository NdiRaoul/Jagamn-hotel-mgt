"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  UtensilsCrossed,
  Clock,
  Search,
  ChevronRight,
  Plus,
  Info,
  Clock3,
  CheckCircle2,
  Package,
  Soup,
  Coffee,
  Beer,
  Sparkles,
  ArrowRight,
  User,
  CreditCard,
  Phone,
  Smartphone,
  ChevronDown,
  Trash2,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ORDER_HISTORY = [
  {
    id: "RD-8821",
    date: "Today, 12:45 PM",
    items: "Gourmet Truffle Risotto, Sparkling Water",
    note: "Special Request: No extra salt, extra parmesan on side.",
    price: "$48.00",
    status: "In Preparation",
    statusColor: "bg-[#FFF7F0] text-[#BA722E]",
    image: "/images/food1.png",
  },
  {
    id: "RD-8794",
    date: "Today, 08:30 AM",
    items: "Continental Breakfast Suite Selection",
    note: "Items: Pain au chocolat, Avocado toast, Fresh berry parfait.",
    price: "$32.50",
    status: "Ready for Delivery",
    statusColor: "bg-[#E8EAF6] text-[#3F51B5]",
    image: "/images/food2.png",
  },
  {
    id: "RD-8702",
    date: "Yesterday, 10:15 PM",
    items: "Midnight Negroni & Charcuterie Board",
    note: "Delivered to Regency Suite #402.",
    price: "$62.00",
    status: "Delivered",
    statusColor: "bg-gray-100 text-gray-500",
    image: "/images/food3.png",
  },
  {
    id: "RD-8901",
    date: "Pending Order",
    items: "Dry-Aged Ribeye Steak (Medium-Rare)",
    note: "Chef is selecting the prime cut for your order.",
    price: "$75.00",
    status: "Kitchen Acknowledged",
    statusColor: "bg-blue-50 text-blue-600",
    image: "/images/food4.png",
  },
];

const CATEGORIES = ["Breakfast", "Mains", "Beverages", "Specials"];

const MENU_ITEMS = [
  {
    id: "p1",
    title: "Palace Benedict",
    price: 32,
    desc: "Smoked salmon, hollandaise, caviar garnish.",
    tags: ["Eggs", "Fish"],
    image: "/images/food1.png",
    border: "border-l-jagamn-primary",
  },
  {
    id: "p2",
    title: "Organic Açaí Bowl",
    price: 28,
    desc: "Amazonian berries, artisan granola, manuka honey.",
    tags: ["Vegan", "Nuts"],
    image: "/images/food2.png",
    border: "border-l-jagamn-primary",
  },
  {
    id: "p3",
    title: "Palace Roast Latte",
    price: 14,
    desc: "Single origin Ethiopian beans, silky microfoam.",
    tags: ["Dairy"],
    image: "/images/food3.png",
    border: "border-l-jagamn-primary",
  },
];

const SPECIALS = [
  {
    id: "s1",
    title: "Wagyu Gold Ribeye",
    price: 124,
    desc: "Aged 45 days, served with truffle butter and charred asparagus.",
    tag: "Gluten Free",
    image: "/images/food4.png",
  },
  {
    id: "s2",
    title: "Citrus Atlantic Salmon",
    price: 78,
    desc: "Pan-seared crisp skin with lemon caper emulsion and microgreens.",
    tag: "Omega 3",
    image: "/images/food1.png",
  },
];

interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  note?: string;
}

export default function DiningPage() {
  const [view, setView] = useState<"overview" | "menu">("overview");
  const [selectedCategory, setSelectedCategory] = useState("Breakfast");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [recentOrder, setRecentOrder] = useState<CartItem[] | null>(null);

  const subtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cart],
  );
  const serviceCharge = subtotal * 0.15;
  const grandTotal = subtotal + serviceCharge;

  const addToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing && existing.quantity > 1) {
        return prev.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity - 1 } : i,
        );
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleConfirmOrder = () => {
    if (cart.length === 0) return;
    setRecentOrder(cart);
    setCart([]);
    setView("overview");
  };

  const recentOrderText = useMemo(() => {
    if (!recentOrder || recentOrder.length === 0) return "Fufu and Eru";
    if (recentOrder.length === 1) return recentOrder[0].title;
    return `${recentOrder[0].title} and ${recentOrder.length - 1} more items`;
  }, [recentOrder]);

  const recentOrderImage = useMemo(() => {
    if (!recentOrder || recentOrder.length === 0) return "/images/food4.png";
    return recentOrder[0].image;
  }, [recentOrder]);

  if (view === "menu") {
    return (
      <div className="space-y-10 max-w-6xl pb-20 relative animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* ── Menu Header ───────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">
              Gourmet Selection
            </p>
            <h1 className="manrope-bold text-5xl text-jagamn-primary">
              Palace Flavors
            </h1>
            <p className="text-sm text-gray-500 max-w-lg leading-relaxed">
              Indulge in artisanal culinary creations delivered directly to your
              imperial suite.
            </p>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-lg">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-6 py-2 rounded-md text-[11px] font-bold uppercase tracking-widest transition-all",
                  selectedCategory === cat
                    ? "bg-jagamn-primary text-white shadow-md"
                    : "text-gray-500 hover:text-jagamn-primary",
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 items-start">
          {/* ── Menu Section ────────────────────────── */}
          <div className="xl:col-span-2 space-y-12">
            {/* Royal Specials */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-jagamn-tertiary" />
                <h2 className="manrope-bold text-xl text-jagamn-primary">
                  Royal Specials
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {SPECIALS.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-md overflow-hidden flex shadow-sm border border-gray-100 group"
                  >
                    <div className="w-[140px] relative">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="manrope-bold text-lg text-jagamn-primary">
                            {item.title}
                          </h4>
                          <p className="text-[9px] text-gray-400 leading-relaxed line-clamp-2">
                            {item.desc}
                          </p>
                        </div>
                        <span className="text-jagamn-tertiary manrope-bold">
                          ${item.price}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-4">
                        <Badge
                          variant="outline"
                          className="text-[8px] border-gray-100 text-gray-400 px-2 uppercase"
                        >
                          {item.tag}
                        </Badge>
                        <button
                          onClick={() => addToCart(item)}
                          className="w-8 h-8 rounded-full bg-jagamn-tertiary text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-jagamn-tertiary/20"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* General Items */}
            <div className="space-y-6">
              <h2 className="manrope-bold text-xl text-jagamn-primary">
                Mornings at the Palace
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {MENU_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "bg-white rounded-md shadow-sm border border-gray-100 border-l-4 overflow-hidden flex flex-col group",
                      item.border,
                    )}
                  >
                    <div className="h-48 relative">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="manrope-bold text-base text-jagamn-primary leading-tight">
                            {item.title}
                          </h4>
                          <span className="text-gray-400 manrope-bold text-sm">
                            ${item.price}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex gap-2">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[8px] font-bold text-gray-400 uppercase tracking-widest"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={() => addToCart(item)}
                          className="w-8 h-8 rounded bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-jagamn-primary transition-colors border border-gray-100"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Selection Sidebar ─────────────────────── */}
          <div className="space-y-8 xl:sticky xl:top-10">
            {/* Active Order Progress (Only if there's a recent order) */}
            {recentOrder && (
              <div className="bg-jagamn-primary rounded-md p-8 text-white space-y-8 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="manrope-bold text-lg">Active Order</h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                      ID: #JGM-4092
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-jagamn-tertiary">
                    <Soup className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-6 relative">
                  <div className="absolute left-2.5 top-0 bottom-0 w-[1px] bg-white/10" />

                  <div className="flex items-center gap-4 relative">
                    <div className="w-5 h-5 rounded-full bg-jagamn-tertiary flex items-center justify-center z-10">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold">Order Received</p>
                      <p className="text-[9px] text-gray-500">Just now</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 relative">
                    <div className="w-5 h-5 rounded-full bg-jagamn-tertiary flex items-center justify-center z-10">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold">Preparing</p>
                      <p className="text-[9px] text-gray-500">
                        Chef is crafting your meal
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 relative opacity-30">
                    <div className="w-5 h-5 rounded-full bg-white/20 z-10" />
                    <div>
                      <p className="text-[11px] font-bold">Out for Delivery</p>
                      <p className="text-[9px] text-gray-500">
                        Estimated: 15-20 mins
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Checkout Form */}
            <div className="bg-white rounded-md shadow-sm border border-gray-100 p-8 space-y-10">
              <h4 className="manrope-bold text-xl text-jagamn-primary">
                Your Selection
              </h4>

              {/* Cart Items */}
              <div className="space-y-6 min-h-[100px]">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                      <Soup className="w-8 h-8 text-gray-200" />
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Your tray is empty
                    </p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 group"
                    >
                      <div className="w-12 h-12 rounded bg-gray-50 flex-shrink-0 relative overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h5 className="text-[11px] font-bold text-jagamn-primary">
                            {item.title}
                          </h5>
                          <span className="text-[11px] font-bold text-jagamn-primary">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[9px] text-gray-400 uppercase tracking-widest">
                            Qty: {item.quantity}
                          </p>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="w-5 h-5 rounded border border-gray-100 flex items-center justify-center hover:bg-gray-50"
                            >
                              <Minus className="w-3 h-3 text-gray-400" />
                            </button>
                            <button
                              onClick={() => addToCart(item)}
                              className="w-5 h-5 rounded border border-gray-100 flex items-center justify-center hover:bg-gray-50"
                            >
                              <Plus className="w-3 h-3 text-gray-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    Room Number
                  </label>
                  <div className="bg-gray-50 rounded h-10 px-4 flex items-center text-sm font-bold text-jagamn-primary">
                    804
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    Delivery Time
                  </label>
                  <div className="bg-gray-50 rounded h-10 px-4 flex items-center justify-between text-xs font-bold text-jagamn-primary">
                    ASAP <ChevronDown className="w-3 h-3 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  Special Instructions
                </label>
                <textarea
                  placeholder="Allergies, door codes, extra napkins..."
                  className="w-full bg-gray-50 border-0 rounded p-4 text-xs h-20 focus:ring-1 focus:ring-jagamn-primary transition-all resize-none placeholder:text-gray-300"
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-4">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button className="border-2 border-jagamn-tertiary bg-orange-50/30 rounded-md p-3 flex flex-col items-center gap-2 group transition-all">
                    <div className="w-4 h-4 rounded-full border-2 border-jagamn-tertiary bg-white flex items-center justify-center self-end">
                      <div className="w-2 h-2 rounded-full bg-jagamn-tertiary" />
                    </div>
                    <Smartphone className="w-4 h-4 text-jagamn-tertiary" />
                    <span className="text-[9px] font-bold text-jagamn-primary uppercase">
                      Charge to Room
                    </span>
                  </button>
                  {[
                    { icon: CreditCard, label: "Mastercard" },
                    { icon: User, label: "Visa" },
                    { icon: Smartphone, label: "Mobile Money" },
                  ].map((method) => (
                    <button
                      key={method.label}
                      className="border border-gray-100 hover:border-gray-300 rounded-md p-3 flex flex-col items-center gap-2 transition-all"
                    >
                      <div className="w-4 h-4 rounded-full border-2 border-gray-100 self-end" />
                      <method.icon className="w-4 h-4 text-gray-400" />
                      <span className="text-[9px] font-bold text-gray-400 uppercase">
                        {method.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="pt-8 border-t border-gray-100 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="font-bold text-jagamn-primary">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Service Charge (15%)</span>
                  <span className="font-bold text-jagamn-primary">
                    ${serviceCharge.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-4">
                  <span className="manrope-bold text-lg text-jagamn-primary">
                    Grand Total
                  </span>
                  <span className="manrope-bold text-xl text-jagamn-tertiary">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                disabled={cart.length === 0}
                onClick={handleConfirmOrder}
                className="w-full h-14 bg-jagamn-tertiary hover:bg-jagamn-tertiary/90 text-white font-bold rounded-md flex items-center justify-center gap-2 shadow-lg shadow-jagamn-tertiary/20 disabled:opacity-50 disabled:grayscale transition-all"
              >
                Confirm Order
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-6xl pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Top Summary Cards ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Card */}
        <div className="lg:col-span-2 bg-white rounded-md border-l-4 border-l-jagamn-tertiary overflow-hidden flex shadow-sm border-r border-t border-b border-gray-100 group">
          <div className="flex-1 p-10 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-jagamn-tertiary mb-2">
                  Recent Activity
                </p>
                <h3 className="manrope-bold text-4xl text-jagamn-primary leading-tight">
                  Your last order of{" "}
                  <span className="text-jagamn-primary italic">
                    {recentOrderText}
                  </span>{" "}
                  is currently in preparation.
                </h3>
              </div>

              <div className="flex items-center gap-8">
                <div className="bg-[#FFF7F0] text-jagamn-tertiary px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-jagamn-tertiary animate-pulse" />
                  In Preparation
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-[10px] font-medium">
                  <Clock className="w-4 h-4" />
                  Estimated delivery: 15 mins
                </div>
              </div>
            </div>
          </div>
          <div className="w-[35%] relative hidden md:block">
            <Image
              src={recentOrderImage}
              alt="Recent Order"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Total Spent Card */}
        <div className="bg-jagamn-primary rounded-md p-10 text-white flex flex-col justify-between shadow-lg shadow-jagamn-primary/20">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
              Total Spent Today
            </p>
            <h3 className="manrope-bold text-5xl text-white tracking-tighter">
              $
              {(
                142.5 +
                (recentOrder
                  ? recentOrder.reduce(
                      (acc, i) => acc + i.price * i.quantity,
                      0,
                    ) * 1.15
                  : 0)
              ).toFixed(2)}
            </h3>
          </div>

          <div className="flex items-center gap-3 pt-6 border-t border-white/10">
            <UtensilsCrossed className="w-5 h-5 text-jagamn-tertiary" />
            <span className="text-[11px] font-bold text-jagamn-tertiary uppercase tracking-widest">
              {3 + (recentOrder ? 1 : 0)} Dining Orders
            </span>
          </div>
        </div>
      </div>

      {/* ── Order History ──────────────────────────── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="manrope-bold text-xl text-jagamn-primary">
            Order History
          </h2>
          <div className="flex gap-6">
            <button className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-jagamn-primary transition-colors">
              Filter
            </button>
            <button className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-jagamn-primary transition-colors">
              Export PDF
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {recentOrder && (
            <div className="bg-white rounded-md border-l-4 border-l-jagamn-tertiary shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-8 border-r border-t border-b border-gray-100 hover:shadow-md transition-shadow animate-in slide-in-from-top-2 duration-500">
              <div className="flex items-center gap-8 w-full md:w-auto">
                <div className="w-20 h-20 relative rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={recentOrderImage}
                    alt="Meal"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Order #JGM-4092 • Just now
                  </p>
                  <h4 className="text-base font-bold text-jagamn-primary leading-tight">
                    {recentOrderText}
                  </h4>
                  <p className="text-[11px] text-gray-400">
                    Order successfully placed and currently being prepared.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                <p className="manrope-bold text-xl text-jagamn-primary">
                  $
                  {(
                    recentOrder.reduce(
                      (acc, i) => acc + i.price * i.quantity,
                      0,
                    ) * 1.15
                  ).toFixed(2)}
                </p>
                <Badge className="border-0 text-[8px] font-bold uppercase tracking-wider px-3 py-1 bg-[#FFF7F0] text-[#BA722E]">
                  In Preparation
                </Badge>
              </div>
            </div>
          )}
          {ORDER_HISTORY.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-md border-l-4 border-jagamn-primary shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-8 border-r border-t border-b border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-8 w-full md:w-auto">
                <div className="w-20 h-20 relative rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={order.image}
                    alt="Meal"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Order #{order.id} • {order.date}
                  </p>
                  <h4 className="text-base font-bold text-jagamn-primary leading-tight">
                    {order.items}
                  </h4>
                  <p className="text-[11px] text-gray-400">{order.note}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                <p className="manrope-bold text-xl text-jagamn-primary">
                  {order.price}
                </p>
                <Badge
                  className={cn(
                    "border-0 text-[8px] font-bold uppercase tracking-wider px-3 py-1",
                    order.statusColor,
                  )}
                >
                  {order.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Info Cards ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-jagamn-neutral rounded-md p-10 space-y-4">
          <UtensilsCrossed className="w-6 h-6 text-jagamn-tertiary" />
          <h4 className="manrope-bold text-lg text-jagamn-primary">
            Dining Hours
          </h4>
          <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
            Our gourmet in-room dining is available 24/7. Please note that the
            Chef&apos;s Signature menu is exclusive between 6:00 PM and 11:00
            PM.
          </p>
        </div>
        <div className="bg-jagamn-neutral rounded-md p-10 space-y-4">
          <Info className="w-6 h-6 text-jagamn-tertiary" />
          <h4 className="manrope-bold text-lg text-jagamn-primary">
            Order Tracking
          </h4>
          <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
            Once an order is &ldquo;Ready for Delivery&rdquo;, a butler will
            reach your suite within 5-7 minutes. You can also contact concierge
            for direct updates.
          </p>
        </div>
      </div>

      {/* ── Floating Action Button ────────────────── */}
      <button
        onClick={() => setView("menu")}
        className="fixed bottom-10 right-10 flex items-center gap-3 bg-jagamn-primary text-white rounded-xl shadow-2xl px-6 h-16 hover:scale-110 transition-all z-50 group"
      >
        <Plus className="w-6 h-6" />
        <span className="manrope-bold text-sm uppercase tracking-widest pr-2">
          New Order
        </span>
      </button>
    </div>
  );
}
