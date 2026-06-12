"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  UtensilsCrossed,
  Clock,
  Plus,
  Info,
  ArrowRight,
  Smartphone,
  Minus,
  Sparkles,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MenuCategoryWithItems } from "@/lib/data/menu";
import type { DiningOrder } from "@/lib/data/dining";
import { toast } from "sonner";

interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

type MenuItemPayload = {
  id: string;
  name: string;
  price: number;
  image_url?: string | null;
};

interface DiningClientProps {
  menu: MenuCategoryWithItems[];
  orders: DiningOrder[];
  isAuthenticated?: boolean;
  roomInfo?: {
    roomId?: string;
    roomUnit?: string;
    roomType?: string;
  } | null;
}

export default function DiningClient({
  menu,
  orders,
  roomInfo,
  isAuthenticated = true,
}: DiningClientProps) {
  const [view, setView] = useState<"overview" | "menu">("overview");
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(
    menu[0]?.name || "Breakfast",
  );
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"charge_to_room" | "momo" | "card">("charge_to_room");

  const subtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cart],
  );

  const addToCart = (item: MenuItemPayload | CartItem) => {
    const itemId = item.id;
    const itemTitle = "name" in item ? item.name : item.title;
    const itemPrice = item.price;
    const itemImage = "image" in item ? item.image : item.image_url;

    setCart((prev) => {
      const existing = prev.find((i) => i.id === itemId);
      if (existing) {
        return prev.map((i) =>
          i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          title: itemTitle,
          price: itemPrice,
          image: itemImage || "/images/food1.png",
          quantity: 1,
        },
      ];
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

  const handleConfirmOrder = async () => {
    if (cart.length === 0) return;

    // Gate only the order action — guests can browse freely, but must sign in
    // to charge an in-room dining order to their stay.
    if (!isAuthenticated) {
      setShowSignInPrompt(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        items: cart,
        notes,
        payment_method: paymentMethod,
      };

      if (roomInfo?.roomType) payload.room_type = roomInfo.roomType;
      if (roomInfo?.roomUnit) payload.room_unit = roomInfo.roomUnit;
      if (roomInfo?.roomId) payload.room_id = roomInfo.roomId;

      const res = await fetch("/api/dining/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to create order");
      }

      toast.success("Order placed successfully!");
      setCart([]);
      setNotes("");
      setView("overview");

      // Refresh the page to show new order
      window.location.reload();
    } catch (error) {
      console.error("Order error:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const recentOrder = orders[0];
  const recentOrderText = recentOrder
    ? recentOrder.items.length === 1
      ? recentOrder.items[0].item_name
      : `${recentOrder.items[0].item_name} and ${recentOrder.items.length - 1} more items`
    : "Your recent order";

  const categories = useMemo(() => Array.from(new Set(menu.map((c) => c.name))), [menu]);
  const selectedCategoryData = useMemo(() => {
    const matchedCategories = menu.filter((c) => c.name === selectedCategory);
    if (matchedCategories.length === 0) return null;
    return {
      name: selectedCategory,
      items: matchedCategories.flatMap((c) => c.items),
    };
  }, [menu, selectedCategory]);
  const specialItems = menu
    .flatMap((c) => c.items)
    .filter((item) => item.is_special);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "placed":
        return "bg-[#FFF7F0] text-[#BA722E]";
      case "preparing":
        return "bg-[#E8EAF6] text-[#3F51B5]";
      case "ready":
        return "bg-[#E6F4EA] text-[#1B7F34]";
      case "delivered":
        return "bg-gray-100 text-gray-500";
      default:
        return "bg-gray-100 text-gray-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "placed":
        return "In Preparation";
      case "preparing":
        return "Being Prepared";
      case "ready":
        return "Ready for Delivery";
      case "delivered":
        return "Delivered";
      default:
        return status;
    }
  };

  if (view === "menu") {
    return (
      <div className="space-y-10 max-w-6xl pb-20 relative animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Inline sign-in prompt — shown when a guest tries to order */}
        {showSignInPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center space-y-4">
              <h3 className="manrope-bold text-2xl text-jagamn-primary">
                Sign in to order
              </h3>
              <p className="text-sm text-gray-500">
                Browsing is open to everyone. To charge in-room dining to your
                stay, please sign in or create an account.
              </p>
              <div className="flex flex-col gap-3 pt-2">
                <Link href="/login?redirect=/dashboard/dining">
                  <Button className="w-full h-12 bg-jagamn-primary text-white font-bold">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="outline" className="w-full h-12 font-bold">
                    Create Account
                  </Button>
                </Link>
                <button
                  onClick={() => setShowSignInPrompt(false)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Keep browsing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Menu Header */}
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

          <div className="flex bg-gray-100 p-1 rounded-lg flex-wrap gap-2 md:gap-1 items-center">
            {categories.map((cat) => (
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
          {/* Menu Section */}
          <div className="xl:col-span-2 space-y-12">
            {/* Royal Specials */}
            {specialItems.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-jagamn-tertiary" />
                  <h2 className="manrope-bold text-xl text-jagamn-primary">
                    Royal Specials
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {specialItems.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-md overflow-hidden flex shadow-sm border border-gray-100 group"
                    >
                      <div className="w-[140px] relative">
                        <Image
                          src={item.image_url || "/images/food1.png"}
                          alt={item.name}
                          fill
                          sizes="140px"
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h4 className="manrope-bold text-lg text-jagamn-primary">
                              {item.name}
                            </h4>
                            <p className="text-[9px] text-gray-400 leading-relaxed line-clamp-2">
                              {item.description}
                            </p>
                          </div>
                          <span className="text-jagamn-tertiary manrope-bold">
                            {item.price.toLocaleString("en-US")} XAF
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-4">
                          <Badge
                            variant="outline"
                            className="text-[8px] border-gray-100 text-gray-400 px-2 uppercase"
                          >
                            Special
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
            )}

            {/* Category Items */}
            {selectedCategoryData && (
              <div className="space-y-6">
                <h2 className="manrope-bold text-xl text-jagamn-primary">
                  {selectedCategoryData.name}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {selectedCategoryData.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-md shadow-sm border border-gray-100 border-l-4 border-l-jagamn-primary overflow-hidden flex flex-col group"
                    >
                      <div className="h-48 relative">
                        <Image
                          src={item.image_url || "/images/food1.png"}
                          alt={item.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <h4 className="manrope-bold text-base text-jagamn-primary leading-tight">
                              {item.name}
                            </h4>
                            <span className="text-gray-400 manrope-bold text-sm">
                              {item.price.toLocaleString("en-US")}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                        <div className="flex items-center justify-end pt-2">
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
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="space-y-8 xl:sticky xl:top-10">
            <div className="bg-white rounded-md shadow-sm border border-gray-100 p-8 space-y-10">
              <h4 className="manrope-bold text-xl text-jagamn-primary">
                Your Selection
              </h4>

              {/* Cart Items */}
              <div className="space-y-6 min-h-[100px]">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                      <UtensilsCrossed className="w-8 h-8 text-gray-200" />
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
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h5 className="text-[11px] font-bold text-jagamn-primary">
                            {item.title}
                          </h5>
                          <span className="text-[11px] font-bold text-jagamn-primary">
                            {(item.price * item.quantity).toLocaleString(
                              "en-US",
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[9px] text-gray-400 uppercase tracking-widest">
                            Qty: {item.quantity}
                          </p>
                          <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
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

              {/* Special Instructions */}
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  Special Instructions
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Allergies, preferences, extra napkins..."
                  className="w-full bg-gray-50 border-0 rounded p-4 text-xs h-20 focus:ring-1 focus:ring-jagamn-primary transition-all resize-none placeholder:text-gray-300"
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-4">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {/* Charge to Room */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("charge_to_room")}
                    className={cn(
                      "border-2 rounded-md p-2 flex flex-col items-center justify-between gap-2 transition-all text-center h-24",
                      paymentMethod === "charge_to_room"
                        ? "border-jagamn-tertiary bg-orange-50/30"
                        : "border-gray-100 bg-white hover:bg-gray-50"
                    )}
                  >
                    <div className={cn("w-3 h-3 rounded-full border border-gray-300 flex items-center justify-center self-end", paymentMethod === "charge_to_room" && "border-jagamn-tertiary")}>
                      {paymentMethod === "charge_to_room" && <div className="w-1.5 h-1.5 rounded-full bg-jagamn-tertiary" />}
                    </div>
                    <Smartphone className={cn("w-4 h-4", paymentMethod === "charge_to_room" ? "text-jagamn-tertiary" : "text-gray-400")} />
                    <span className="text-[8px] font-bold text-jagamn-primary uppercase leading-tight">
                      Charge to Room
                    </span>
                  </button>

                  {/* Mobile Money */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("momo")}
                    className={cn(
                      "border-2 rounded-md p-2 flex flex-col items-center justify-between gap-2 transition-all text-center h-24",
                      paymentMethod === "momo"
                        ? "border-jagamn-tertiary bg-orange-50/30"
                        : "border-gray-100 bg-white hover:bg-gray-50"
                    )}
                  >
                    <div className={cn("w-3 h-3 rounded-full border border-gray-300 flex items-center justify-center self-end", paymentMethod === "momo" && "border-jagamn-tertiary")}>
                      {paymentMethod === "momo" && <div className="w-1.5 h-1.5 rounded-full bg-jagamn-tertiary" />}
                    </div>
                    <div className="flex gap-0.5">
                      <span className="text-[7px] px-0.5 bg-yellow-400 text-black font-bold rounded-sm scale-90">MTN</span>
                      <span className="text-[7px] px-0.5 bg-orange-500 text-white font-bold rounded-sm scale-90">OM</span>
                    </div>
                    <span className="text-[8px] font-bold text-jagamn-primary uppercase leading-tight">
                      Mobile Money
                    </span>
                  </button>

                  {/* Credit Card */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={cn(
                      "border-2 rounded-md p-2 flex flex-col items-center justify-between gap-2 transition-all text-center h-24",
                      paymentMethod === "card"
                        ? "border-jagamn-tertiary bg-orange-50/30"
                        : "border-gray-100 bg-white hover:bg-gray-50"
                    )}
                  >
                    <div className={cn("w-3 h-3 rounded-full border border-gray-300 flex items-center justify-center self-end", paymentMethod === "card" && "border-jagamn-tertiary")}>
                      {paymentMethod === "card" && <div className="w-1.5 h-1.5 rounded-full bg-jagamn-tertiary" />}
                    </div>
                    <CreditCard className={cn("w-4 h-4", paymentMethod === "card" ? "text-jagamn-tertiary" : "text-gray-400")} />
                    <span className="text-[8px] font-bold text-jagamn-primary uppercase leading-tight">
                      Credit Card
                    </span>
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="pt-8 border-t border-gray-100 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="font-bold text-jagamn-primary">
                    {subtotal.toLocaleString("en-US")} XAF
                  </span>
                </div>
                <div className="flex justify-between pt-4">
                  <span className="manrope-bold text-lg text-jagamn-primary">
                    Total
                  </span>
                  <span className="manrope-bold text-xl text-jagamn-tertiary">
                    {subtotal.toLocaleString("en-US")} XAF
                  </span>
                </div>
              </div>

              <Button
                disabled={cart.length === 0 || isSubmitting}
                onClick={handleConfirmOrder}
                className="w-full h-14 bg-jagamn-tertiary hover:bg-jagamn-tertiary/90 text-white font-bold rounded-md flex items-center justify-center gap-2 shadow-lg shadow-jagamn-tertiary/20 disabled:opacity-50 disabled:grayscale transition-all"
              >
                {isSubmitting ? "Placing Order..." : "Confirm Order"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Overview view
  return (
    <div className="space-y-12 max-w-6xl pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Summary Cards */}
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
                  {recentOrder ? (
                    <>
                      Your last order of{" "}
                      <span className="text-jagamn-primary italic">
                        {recentOrderText}
                      </span>{" "}
                      is {getStatusLabel(recentOrder.status).toLowerCase()}.
                    </>
                  ) : (
                    "No recent orders. Start by browsing our menu!"
                  )}
                </h3>
              </div>

              {recentOrder && (
                <div className="flex items-center gap-8">
                  <div
                    className={cn(
                      "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2",
                      getStatusColor(recentOrder.status),
                    )}
                  >
                    {recentOrder.status === "placed" && (
                      <div className="w-2 h-2 rounded-full bg-jagamn-tertiary animate-pulse" />
                    )}
                    {getStatusLabel(recentOrder.status)}
                  </div>
                  {recentOrder.status === "placed" && (
                    <div className="flex items-center gap-2 text-gray-400 text-[10px] font-medium">
                      <Clock className="w-4 h-4" />
                      Estimated delivery: 15-20 mins
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="w-[35%] relative hidden md:block">
            <Image
              src="/images/food1.png"
              alt="Recent Order"
              fill
              sizes="35vw"
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
              {orders
                .filter((o) => {
                  const orderDate = new Date(o.created_at).toDateString();
                  const today = new Date().toDateString();
                  return orderDate === today;
                })
                .reduce((sum, o) => sum + o.total_amount, 0)
                .toLocaleString("en-US")}{" "}
              <span className="text-2xl">XAF</span>
            </h3>
          </div>

          <div className="flex items-center gap-3 pt-6 border-t border-white/10">
            <UtensilsCrossed className="w-5 h-5 text-jagamn-tertiary" />
            <span className="text-[11px] font-bold text-jagamn-tertiary uppercase tracking-widest">
              {
                orders.filter((o) => {
                  const orderDate = new Date(o.created_at).toDateString();
                  const today = new Date().toDateString();
                  return orderDate === today;
                }).length
              }{" "}
              Dining Orders
            </span>
          </div>
        </div>
      </div>

      {/* Order History */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="manrope-bold text-xl text-jagamn-primary">
            Order History
          </h2>
        </div>

        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-md border border-gray-100 shadow-sm p-10 text-center">
              <p className="text-gray-400 text-sm">
                No orders yet. Browse our menu to get started!
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-md border-l-4 border-jagamn-primary shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-8 border-r border-t border-b border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-8 w-full md:w-auto">
                  <div className="w-20 h-20 relative rounded overflow-hidden flex-shrink-0">
                    <Image
                      src="/images/food1.png"
                      alt="Meal"
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      {new Date(order.created_at).toLocaleString()}
                      {order.room_number && ` • Room ${order.room_number}`}
                    </p>
                    <h4 className="text-base font-bold text-jagamn-primary leading-tight">
                      {order.items.map((i) => i.item_name).join(", ")}
                    </h4>
                    {order.notes && (
                      <p className="text-[11px] text-gray-400">{order.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                  <p className="manrope-bold text-xl text-jagamn-primary">
                    {order.total_amount.toLocaleString("en-US")} XAF
                  </p>
                  <Badge
                    className={cn(
                      "border-0 text-[8px] font-bold uppercase tracking-wider px-3 py-1",
                      getStatusColor(order.status),
                    )}
                  >
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info Cards */}
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

      {/* Floating Action Button */}
      <button
        onClick={() => setView("menu")}
        className="fixed bottom-24 md:bottom-10 right-6 md:right-10 flex items-center gap-3 bg-jagamn-primary text-white rounded-xl shadow-2xl px-6 h-16 hover:scale-110 transition-all z-40 group"
      >
        <Plus className="w-6 h-6" />
        <span className="manrope-bold text-sm uppercase tracking-widest pr-2">
          New Order
        </span>
      </button>
    </div>
  );
}
