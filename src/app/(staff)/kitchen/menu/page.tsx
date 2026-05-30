"use client";

import React, { useState, useMemo, useEffect } from "react";
import { MENU_ITEMS, type MenuItem } from "@/lib/kitchen-mock-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Star, Download, Plus, Edit3, X, Search, Trash2, Camera, Upload } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// ── Toggle Switch ──────────────────────────────────────────────────────────
function ToggleSwitch({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={cn(
        "relative w-11 h-6 rounded-full transition-colors duration-200 flex items-center flex-shrink-0",
        enabled ? "bg-[#BA722E]" : "bg-gray-300",
      )}
    >
      <span
        className={cn(
          "absolute w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200",
          enabled ? "left-[26px]" : "left-[4px]",
        )}
      />
    </button>
  );
}

// ── Large Card ─────────────────────────────────────────────────────────────
function LargeMenuCard({
  item,
  onToggle,
  onEdit,
}: {
  item: MenuItem;
  onToggle: (id: string) => void;
  onEdit: (item: MenuItem) => void;
}) {
  const isAvailable = item.available;

  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-sm flex flex-col md:flex-row transition-all duration-300 p-5 gap-6 group relative",
        isAvailable
          ? "border-l-4 border-l-[#BA722E]"
          : "border-l-4 border-l-[#94A3B8]",
      )}
    >
      {/* Edit button overlay on hover */}
      <button
        onClick={() => onEdit(item)}
        className="absolute top-4 right-16 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-lg md:opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-gray-100 text-[#00152A] hover:bg-white"
      >
        <Edit3 className="w-4 h-4" />
      </button>

      {/* Image Container with Padding */}
      <div className="relative w-full md:w-44 h-44 flex-shrink-0">
        <div className="w-full h-full rounded-xl overflow-hidden relative shadow-inner bg-gray-50">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className={cn(
              "object-cover transition-all duration-300",
              !isAvailable && "grayscale opacity-60",
            )}
          />
          {/* Out of Stock overlay */}
          {!isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/5">
              <span className="bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex-1 flex flex-col justify-between transition-opacity duration-300 py-1",
          !isAvailable && "opacity-60",
        )}
      >
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-[#BA722E] uppercase tracking-widest mb-1">
                {item.category}
              </p>
              <h3 className="manrope-bold text-3xl text-[#00152A]">
                {item.name}
              </h3>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <ToggleSwitch
                enabled={isAvailable}
                onChange={() => onToggle(item.id)}
              />
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                {isAvailable ? "Available" : "Unavailable"}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed max-w-md">
            {item.description}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {item.ingredients.map((ing, i) => (
            <span
              key={i}
              className="bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-gray-200"
            >
              {ing.label} {ing.amount && `(INVENTORY: ${ing.amount})`}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Small Card ─────────────────────────────────────────────────────────────
function SmallMenuCard({
  item,
  onToggle,
  onEdit,
}: {
  item: MenuItem;
  onToggle: (id: string) => void;
  onEdit: (item: MenuItem) => void;
}) {
  const isAvailable = item.available;

  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-sm flex gap-4 p-4 items-start transition-all duration-300 group relative",
        item.inventoryOk !== false
          ? "border-l-[4px] border-l-[#BA722E]"
          : "border-l-[4px] border-l-[#EA580C]",
        !isAvailable && "opacity-60",
      )}
    >
      <button
        onClick={() => onEdit(item)}
        className="absolute top-2 right-12 z-10 p-1.5 bg-white/80 backdrop-blur-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-gray-100 text-[#00152A] hover:bg-white"
      >
        <Edit3 className="w-3.5 h-3.5" />
      </button>

      {/* Image */}
      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-gray-50">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className={cn(
            "object-cover transition-all duration-300",
            !isAvailable && "grayscale",
          )}
        />
      </div>

      <div className="flex-1 space-y-2 min-w-0">
        <h3 className="manrope-bold text-lg text-[#00152A]">
          {item.name}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
          {item.description}
        </p>
        <div className="flex items-center justify-between pt-1">
          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              INVENTORY CHECK
            </p>
            <p
              className={cn(
                "text-xs font-bold",
                item.inventoryOk !== false ? "text-[#BA722E]" : "text-[#EA580C]",
              )}
            >
              {item.inventoryStatus || (item.inventoryOk !== false ? "High Stock" : "Low Stock")}
            </p>
          </div>
          <ToggleSwitch
            enabled={isAvailable}
            onChange={() => onToggle(item.id)}
          />
        </div>
      </div>
    </div>
  );
}

// ── INVENTORY KITCHEN SUGGESTIONS ───────────────────
const INVENTORY_SUGGESTIONS = [
  "WAGYU BEEF",
  "ATLANTIC SALMON",
  "TRUFFLE OIL",
  "FOIE GRAS",
  "CHAMPAGNE",
  "VALRHONA CHOCOLATE",
  "SAFFRON",
  "CAVIAR",
  "SEA SALT",
  "BEEF PRIME CUT",
  "AVOCADO",
  "GOAT CHEESE",
  "WALNUTS",
  "GOLDEN BERRIES",
  "VANILLA BEAN",
  "Clarified Cherry Wood",
  "GINGER",
  "BLACK PEPPER",
  "OLIVE OIL",
  "BUTTER"
];

function MenuModal({ open, item, onSave, onDiscard }: any) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("main");
  const [description, setDescription] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [ingredientInput, setIngredientInput] = useState("");
  const [dietary, setDietary] = useState({
    glutenFree: false,
    containsNuts: false,
    dairyFree: false,
    vegan: false,
  });

  // Populate data when editing
  useEffect(() => {
    if (item) {
      setName(item.name || "");
      setPrice(item.price ? String(item.price) : "");

      const cat = item.category.toLowerCase();
      if (cat.includes("breakfast")) setCategory("breakfast");
      else if (cat.includes("wine") || cat.includes("spirits")) setCategory("wine");
      else if (cat.includes("dessert")) setCategory("desserts");
      else if (cat.includes("room")) setCategory("room");
      else setCategory("main");

      setDescription(item.description || "");
      setPreviewUrl(item.image || null);

      // Adapt existing ingredients format
      if (item.ingredients && Array.isArray(item.ingredients)) {
        if (typeof item.ingredients[0] === 'string') {
          setIngredients(item.ingredients);
        } else {
          setIngredients(item.ingredients.map((ing: any) => ing.label));
        }
      } else {
        setIngredients(["BEEF PRIME CUT", "SEA SALT"]);
      }

      setDietary(item.dietary || {
        glutenFree: false,
        containsNuts: false,
        dairyFree: false,
        vegan: false,
      });
    } else {
      setName("");
      setPrice("");
      setCategory("main");
      setDescription("");
      setPreviewUrl(null);
      setIngredients(["BEEF PRIME CUT", "SEA SALT"]);
      setDietary({
        glutenFree: false,
        containsNuts: false,
        dairyFree: false,
        vegan: false,
      });
    }
    setIngredientInput("");
  }, [item, open]);

  // Dynamic Suggestion Search list
  const filteredSuggestions = useMemo(() => {
    if (!ingredientInput.trim()) return [];
    const query = ingredientInput.toUpperCase();
    return INVENTORY_SUGGESTIONS.filter(sug =>
      sug.toUpperCase().includes(query) && !ingredients.includes(sug.toUpperCase())
    );
  }, [ingredientInput, ingredients]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addIngredient = () => {
    const cleaned = ingredientInput.trim().toUpperCase();
    if (cleaned && !ingredients.includes(cleaned)) {
      setIngredients([...ingredients, cleaned]);
      setIngredientInput("");
    }
  };

  const removeIngredient = (tag: string) => {
    setIngredients(ingredients.filter((t) => t !== tag));
  };

  const handleFormSave = () => {
    if (!name.trim()) {
      toast.error("Please enter a menu item name.");
      return;
    }
    const catMap: Record<string, string> = {
      breakfast: "Breakfast",
      main: "Main Course",
      wine: "Wine & Spirits",
      desserts: "Desserts",
      room: "Room Service Only"
    };

    onSave({
      id: item?.id || "",
      name,
      price: parseFloat(price) || 0,
      category: catMap[category] || "Main Course",
      description,
      image: previewUrl || "/images/food1.png",
      ingredients: ingredients.map(ing => ({ label: ing, amount: "" })),
      dietary,
      available: item ? item.available : true,
      size: item ? item.size : "large"
    });
  };

  return (
    <DialogContent className="sm:max-w-[1000px] p-0 border-0 overflow-hidden bg-white rounded-3xl flex flex-col h-[90vh]">
      <div className="p-8 md:p-12 space-y-12 flex-1 overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-[#BA722E] uppercase tracking-[0.3em]">
            Culinary Administration
          </p>
          <DialogTitle className="manrope-bold text-4xl text-[#00152A] tracking-tight">
            {item ? `Edit Menu Item: ${item.id}` : "Add New Menu Item"}
          </DialogTitle>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-4 space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                Item Presentation
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "aspect-square rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center gap-4 text-center p-8 group transition-all cursor-pointer relative overflow-hidden",
                  previewUrl
                    ? "border-solid border-gray-100 bg-white"
                    : "border-gray-200 bg-[#F1F5F9] hover:border-[#BA722E]/40",
                )}
              >
                {previewUrl ? (
                  <>
                    <img
                      src={previewUrl}
                      className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-500"
                      alt="Preview"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-white" />
                        <p className="text-white text-[10px] font-black uppercase tracking-widest">
                          Replace Photo
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-xl shadow-lg z-20 text-red-500 transition-all hover:scale-110"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-white flex flex-col items-center justify-center shadow-sm group-hover:scale-110 transition-all duration-500 relative">
                      <Camera className="w-6 h-6 text-slate-300 group-hover:text-[#BA722E] transition-colors" />
                      <Plus className="w-3 h-3 text-slate-300 absolute bottom-4 right-4 group-hover:text-[#BA722E]" />
                    </div>
                    <p className="manrope-bold text-xs text-slate-400">
                      Drag photo here or click to upload
                    </p>
                  </>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-normal">
                High-resolution PNG or JPG recommended. Minimum 1080x1080px for premium digital menu display.
              </p>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                Pricing & Revenue
              </label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl manrope-bold text-slate-400">
                  $
                </span>
                <Input
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="h-20 bg-[#F1F5F9] border-0 rounded-2xl pl-12 text-3xl manrope-bold text-[#00152A] placeholder:text-slate-300 focus-visible:ring-0"
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                  Item Name
                </label>
                <Input
                  placeholder="e.g. Wagyu Beef Tartare"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="h-16 bg-[#F1F5F9] border-0 rounded-2xl px-6 text-sm font-semibold text-[#00152A] placeholder:text-slate-300 focus-visible:ring-0"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                  Category
                </label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-16 bg-[#F1F5F9] border-0 rounded-2xl px-6 text-sm font-semibold text-[#00152A] placeholder:text-slate-300 focus:ring-0">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="main">Main Course</SelectItem>
                    <SelectItem value="wine">Wine & Spirits</SelectItem>
                    <SelectItem value="desserts">Desserts</SelectItem>
                    <SelectItem value="room">Room Service Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                Description
              </label>
              <textarea
                placeholder="Craft a compelling story for this dish..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full h-40 bg-[#F1F5F9] border-0 rounded-2xl p-6 text-sm font-semibold text-[#00152A] resize-none outline-none focus:ring-0 focus:ring-offset-0 placeholder:text-slate-300"
              />
            </div>

            {/* Bottom side-by-side section: Ingredients vs Dietary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Inventory Integration */}
              <div className="space-y-4 relative">
                <label className="text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                  Inventory Integration (Ingredients)
                </label>
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={ingredientInput}
                    onChange={(e) => setIngredientInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addIngredient();
                      }
                    }}
                    placeholder="Search inventory..."
                    className="h-14 bg-[#F1F5F9] border-0 rounded-2xl pl-12 text-sm font-semibold text-[#00152A] placeholder:text-slate-400 focus-visible:ring-0"
                  />
                </div>

                {/* Suggestions Dropdown */}
                {filteredSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-[85px] bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-300 max-h-48 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {filteredSuggestions.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => {
                          setIngredients([...ingredients, sug.toUpperCase()]);
                          setIngredientInput("");
                        }}
                        className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-xs font-semibold text-[#00152A] flex items-center justify-between transition-colors group"
                      >
                        <span>{sug}</span>
                        <span className="text-[9px] font-black text-[#BA722E] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">+ Add</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {ingredients.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0369A1] font-black text-[9px] uppercase tracking-widest px-4 py-2 rounded-xl flex items-center gap-2 border-0 animate-in fade-in"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeIngredient(tag);
                        }}
                        className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-sky-200 text-[#0369A1]/60 hover:text-[#0369A1] transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Dietary & Allergens */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                  Dietary & Allergens
                </label>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 pt-2">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="gluten-free"
                      checked={dietary.glutenFree}
                      onCheckedChange={(checked) =>
                        setDietary({ ...dietary, glutenFree: !!checked })
                      }
                      className="w-5 h-5 rounded-full border-gray-300 text-[#00152A] focus:ring-0 data-[state=checked]:bg-[#00152A]"
                    />
                    <label
                      htmlFor="gluten-free"
                      className="text-xs font-semibold text-slate-500 cursor-pointer select-none"
                    >
                      Gluten Free
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="contains-nuts"
                      checked={dietary.containsNuts}
                      onCheckedChange={(checked) =>
                        setDietary({ ...dietary, containsNuts: !!checked })
                      }
                      className="w-5 h-5 rounded-full border-gray-300 text-[#00152A] focus:ring-0 data-[state=checked]:bg-[#00152A]"
                    />
                    <label
                      htmlFor="contains-nuts"
                      className="text-xs font-semibold text-slate-500 cursor-pointer select-none"
                    >
                      Contains Nuts
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="dairy-free"
                      checked={dietary.dairyFree}
                      onCheckedChange={(checked) =>
                        setDietary({ ...dietary, dairyFree: !!checked })
                      }
                      className="w-5 h-5 rounded-full border-gray-300 text-[#00152A] focus:ring-0 data-[state=checked]:bg-[#00152A]"
                    />
                    <label
                      htmlFor="dairy-free"
                      className="text-xs font-semibold text-slate-500 cursor-pointer select-none"
                    >
                      Dairy Free
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="vegan"
                      checked={dietary.vegan}
                      onCheckedChange={(checked) =>
                        setDietary({ ...dietary, vegan: !!checked })
                      }
                      className="w-5 h-5 rounded-full border-gray-300 text-[#00152A] focus:ring-0 data-[state=checked]:bg-[#00152A]"
                    />
                    <label
                      htmlFor="vegan"
                      className="text-xs font-semibold text-slate-500 cursor-pointer select-none"
                    >
                      Vegan
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-8 md:p-12 border-t border-gray-100 bg-[#F8FAFC] flex items-center justify-end gap-6">
        <button type="button" onClick={onDiscard} className="text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-red-500 transition-colors">
          DISCARD DRAFT
        </button>
        <Button onClick={handleFormSave} className="h-[56px] px-10 bg-[#BA722E] hover:bg-[#A06127] text-white manrope-bold rounded-xl shadow-xl shadow-orange-500/5 transition-all hover:scale-[1.02]">
          SAVE TO MENU
        </Button>
      </div>
    </DialogContent>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MenuManagementPage() {
  const [items, setItems] = useState<MenuItem[]>(MENU_ITEMS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const handleToggle = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              available: !item.available,
              outOfStock: item.available ? true : false,
            }
          : item,
      ),
    );
    toast.success("Menu item availability updated");
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSaveMenuItem = (savedItem: any) => {
    if (editingItem) {
      // Update
      setItems(prev => prev.map(x => x.id === savedItem.id ? { ...x, ...savedItem } : x));
      toast.success("Menu item updated successfully");
    } else {
      // Create
      const newId = `JGM-${Math.floor(1000 + Math.random() * 9000)}`;
      setItems(prev => [...prev, { ...savedItem, id: newId }]);
      toast.success("New menu item added to catalog");
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleExportMenu = () => {
    toast.info("Exporting menu catalog...");

    // Prepare CSV data
    const headers = ["ID", "Name", "Category", "Description", "Available", "Ingredients"];
    const rows = items.map(item => [
      item.id,
      item.name,
      item.category,
      `"${item.description.replace(/"/g, '""')}"`,
      item.available ? "Yes" : "No",
      `"${item.ingredients.map(ing => ing.label).join('; ')}"`
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `menu_catalog_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      toast.success("Menu catalog exported as .CSV");
    }, 1000);
  };

  const largeItems = items.filter((i) => i.size === "large");
  const smallItems = items.filter((i) => i.size === "small");
  const mostRequested = items[0];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 relative">
      {/* ── Header ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="manrope-bold text-3xl sm:text-4xl text-[#00152A]">
            Menu Management
          </h1>
          <p className="text-gray-500 text-sm mt-1 max-w-md">
            Curating the season's finest ingredients for the Palace's signature
            dining experience.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={handleExportMenu}
            variant="outline"
            className="h-11 px-6 border-gray-200 text-[#00152A] font-bold hover:bg-gray-50 flex items-center justify-center gap-2 rounded-2xl"
          >
            <Download className="w-4 h-4" />
            Export Menu
          </Button>
          <Button
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="h-11 px-6 bg-[#00152A] hover:bg-[#0A2038] text-white font-bold shadow-md flex items-center justify-center gap-2 rounded-2xl"
          >
            <Plus className="w-4 h-4" />
            Add New Item
          </Button>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) setEditingItem(null); }}>
        <MenuModal
          open={isModalOpen}
          item={editingItem}
          onSave={handleSaveMenuItem}
          onDiscard={() => { setIsModalOpen(false); setEditingItem(null); }}
        />
      </Dialog>

      {/* ── Main Grid ─────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* Left: Menu List */}
        <div className="xl:col-span-2 space-y-6">
          {largeItems.map((item) => (
            <LargeMenuCard key={item.id} item={item} onToggle={handleToggle} onEdit={handleEditItem} />
          ))}
          {smallItems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {smallItems.map((item) => (
                <SmallMenuCard
                  key={item.id}
                  item={item}
                  onToggle={handleToggle}
                  onEdit={handleEditItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Most Requested */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center space-y-4 sticky top-0">
            <Star className="w-8 h-8 text-[#BA722E] fill-[#BA722E] mx-auto" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Most Requested
            </p>
            <h2 className="manrope-bold text-3xl text-[#00152A] leading-tight">
              {mostRequested.name}
            </h2>
            {/* 85% satisfaction progress bar */}
            <div className="space-y-2 pt-1">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#BA722E] rounded-full"
                  style={{ width: "85%" }}
                />
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                85% Guest Satisfaction Score
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Floating Action Button ─────────────── */}
      <button
        onClick={() => {
          setEditingItem(null);
          setIsModalOpen(true);
        }}
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#00152A] hover:bg-[#0A2038] text-white rounded-2xl shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-50"
      >
        <Edit3 className="w-5 h-5" />
      </button>
    </div>
  );
}
