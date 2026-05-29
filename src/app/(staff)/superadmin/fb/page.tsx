"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Trash2,
  EyeOff,
  Eye,
  Utensils,
  ChefHat,
  Wine,
  Coffee,
  IceCream,
  AlertTriangle,
  ArrowRight,
  Upload,
  X,
  Info,
  Camera,
  Edit2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

// --- Mock Data ---
const MENU_ITEMS = [
  {
    id: "M-001",
    name: "Imperial Garden Salad",
    category: "Main Course",
    price: 32.0,
    description: "Hand-picked seasonal greens, goat cheese croquette, walnut...",
    image: "/images/food1.png",
    status: "Available",
    ingredients: ["GOAT CHEESE", "WALNUTS", "SEASONAL GREENS"],
    dietary: { glutenFree: true, containsNuts: true, dairyFree: false, vegan: false }
  },
  {
    id: "M-002",
    name: "Palace Reserve Ribeye",
    category: "Main Course",
    price: 85.0,
    description: "45-day dry-aged wagyu, smoked bone marrow butter...",
    image: "/images/food2.png",
    status: "Available",
    ingredients: ["WAGYU BEEF", "SEA SALT", "BUTTER"],
    dietary: { glutenFree: true, containsNuts: false, dairyFree: false, vegan: false }
  },
  {
    id: "M-003",
    name: "Golden Berry Tart",
    category: "Desserts",
    price: 18.0,
    description: "Crisp shortcrust, vanilla bean custard, macerated seasonal...",
    image: "/images/food3.png",
    status: "Out of Stock",
    ingredients: ["GOLDEN BERRIES", "VANILLA BEAN", "BUTTER"],
    dietary: { glutenFree: false, containsNuts: false, dairyFree: false, vegan: false }
  },
  {
    id: "M-004",
    name: "Palace Signature Old Fashioned",
    category: "Wine & Spirits",
    price: 24.0,
    description: "Private barrel selection bourbon, clarified cherry wood...",
    image: "/images/food4.png",
    status: "Available",
    ingredients: ["CHAMPAGNE", "Clarified Cherry Wood"],
    dietary: { glutenFree: true, containsNuts: false, dairyFree: true, vegan: true }
  },
];

const CATEGORIES = [
  "All Items",
  "Breakfast",
  "Main Course",
  "Wine & Spirits",
  "Desserts",
  "Room Service Only",
];

const StatCard = ({ title, value, change, accentColor, changeColor }: any) => (
  <div className={cn("bg-white p-8 rounded-2xl border border-gray-100 shadow-sm border-l-4", accentColor)}>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{title}</p>
    <div className="flex items-baseline gap-2">
      <h3 className="manrope-bold text-4xl text-[#0D2137] tracking-tight">{value}</h3>
    </div>
    {change && (
      <p className={cn("text-xs font-semibold mt-2", changeColor || "text-slate-400")}>{change}</p>
    )}
  </div>
);

export default function FBManagementPage() {
  const [activeCategory, setActiveCategory] = useState("All Items");
  const [items, setItems] = useState(MENU_ITEMS);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog & Edit states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Global Search Integration
  useEffect(() => {
    const handleGlobalSearch = (e: any) => {
      setSearchQuery(e.detail || "");
    };
    window.addEventListener('jagamn-global-search', handleGlobalSearch);
    return () => window.removeEventListener('jagamn-global-search', handleGlobalSearch);
  }, []);

  const toggleStatus = (id: string) => {
    setItems(items.map(item => 
      item.id === id 
        ? { ...item, status: item.status === "Available" ? "Out of Stock" : "Available" }
        : item
    ));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleEditClick = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSaveMenuItem = (savedItem: any) => {
    if (editingItem) {
      // Update
      setItems(prev => prev.map(x => x.id === savedItem.id ? { ...x, ...savedItem } : x));
    } else {
      // Create
      const newId = `M-${String(items.length + 1).padStart(3, '0')}`;
      setItems(prev => [...prev, { ...savedItem, id: newId }]);
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        item.name.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q);

      const matchesCategory = activeCategory === "All Items" || item.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, activeCategory]);

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-700">
      {/* ── Header ───────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-2">
          <p className="text-[10px] font-black text-[#E8924A] uppercase tracking-[0.4em]">F&B Operations</p>
          <h1 className="manrope-bold text-4xl md:text-6xl text-[#0D2137] tracking-tight">Menu Management</h1>
          <p className="text-slate-400 font-medium max-w-2xl text-sm md:text-base leading-relaxed">
            Refine the culinary offerings of the Palace. Curate seasonal specialties and manage real-time availability.
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) setEditingItem(null); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingItem(null)} className="h-16 px-10 bg-[#E8924A] hover:bg-[#E8924A]/90 text-white manrope-bold rounded-2xl flex items-center gap-3 shadow-xl shadow-orange-500/20 transition-all hover:scale-[1.02]">
              <Plus className="w-5 h-5" /> Add Menu Item
            </Button>
          </DialogTrigger>
          <MenuModal 
            open={isModalOpen} 
            item={editingItem} 
            onSave={handleSaveMenuItem}
            onDiscard={() => { setIsModalOpen(false); setEditingItem(null); }}
          />
        </Dialog>
      </div>

      {/* ── Quick Stats ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
          title="Live Items" 
          value={items.length.toString()} 
          change="+3 since last week" 
          accentColor="border-l-[#0D2137]" 
          changeColor="text-emerald-600" 
        />
        <StatCard 
          title="Daily Orders" 
          value="186" 
          change="84% peak capacity" 
          accentColor="border-l-[#E8924A]" 
          changeColor="text-slate-400" 
        />
        <StatCard 
          title="Avg. Ticket" 
          value="$74.50" 
          change="Main Dining Hall" 
          accentColor="border-l-[#5F738C]" 
          changeColor="text-slate-400" 
        />
      </div>

      {/* ── Toolbar: Categories & Search ─────────────── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-12 overflow-x-auto no-scrollbar w-full xl:w-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "relative pb-2 text-sm font-bold transition-all whitespace-nowrap",
                activeCategory === cat ? "text-[#E8924A]" : "text-slate-400 hover:text-[#0D2137]"
              )}
            >
              {cat}
              {activeCategory === cat && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#E8924A] rounded-full animate-in slide-in-from-left-full duration-300" />
              )}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalog..." 
            className="h-12 bg-white border-gray-100 rounded-xl pl-12 text-[10px] font-black uppercase tracking-widest shadow-sm" 
          />
        </div>
      </div>

      {/* ── Menu Grid ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {filteredItems.map((item) => (
          <div key={item.id} className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col sm:flex-row h-full relative">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#E8924A] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 z-30" />
            <div className="relative w-full sm:w-[240px] aspect-square sm:aspect-auto overflow-hidden shrink-0 bg-gray-100">
              {item.image ? (
                <img src={item.image} alt={item.name} className={cn("w-full h-full object-cover transition-transform duration-700 group-hover:scale-110", item.status === "Out of Stock" && "grayscale opacity-50")} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300"><Utensils className="w-12 h-12" /></div>
              )}
              {item.status === "Out of Stock" && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-6"><span className="manrope-bold text-[10px] text-white bg-[#0D2137] px-6 py-3 rounded-xl uppercase tracking-[0.2em]">Out of Stock</span></div>
              )}
            </div>
            
            <div className="flex-1 p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-gray-200 text-slate-400 rounded-lg px-3 py-1">
                    {item.category}
                  </Badge>
                  <span className="manrope-bold text-2xl text-[#0D2137]">${item.price.toFixed(2)}</span>
                </div>
                <div>
                  <h4 className="manrope-bold text-2xl md:text-3xl text-[#0D2137] leading-tight mb-2">{item.name}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ID: {item.id}</p>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed line-clamp-2">{item.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-8">
                <Button onClick={() => toggleStatus(item.id)} variant="outline" className={cn("flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 border-gray-100", item.status === "Available" ? "text-slate-400 hover:bg-gray-50 hover:text-[#0D2137]" : "bg-[#4B5E71] text-white border-0 hover:bg-[#3A4A5A] shadow-lg")}>
                  {item.status === "Available" ? <><EyeOff className="w-4 h-4" /> Mark Unavailable</> : <><Eye className="w-4 h-4" /> Restore Item</>}
                </Button>
                <Button onClick={() => handleEditClick(item)} variant="outline" className="w-14 h-14 rounded-2xl border-gray-100 text-amber-500 hover:bg-amber-50 hover:border-amber-100 hover:text-amber-600 p-0 shrink-0 flex items-center justify-center"><Edit2 className="w-5 h-5" /></Button>
                <Button onClick={() => deleteItem(item.id)} variant="outline" className="w-14 h-14 rounded-2xl border-gray-100 text-red-400 hover:bg-red-50 hover:border-red-100 hover:text-red-500 p-0 shrink-0 flex items-center justify-center"><Trash2 className="w-5 h-5" /></Button>
              </div>
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center py-20 text-slate-400 manrope-bold italic">No catalog items found matching your current search parameters.</div>
        )}
      </div>

      {/* ── Smart Inventory Alert ────────────────────── */}
      <div className="bg-[#0D2137] rounded-[2.5rem] p-10 md:p-14 text-white relative overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
          <div className="max-w-xl space-y-6">
            <div className="flex items-center gap-4"><div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20"><AlertTriangle className="w-8 h-8 text-[#E8924A]" /></div><h3 className="manrope-bold text-3xl md:text-4xl tracking-tight">Smart Inventory Integration</h3></div>
            <p className="text-[#94A3B8] text-lg font-medium leading-relaxed">Our AI-driven system has detected low stock levels for <span className="text-[#E8924A] underline decoration-[#E8924A] underline-offset-4 font-bold">Atlantic Salmon</span>. Consider updating your daily specials.</p>
            <div className="flex flex-wrap items-center gap-4 pt-4"><Button className="h-14 px-8 bg-white text-[#0D2137] manrope-bold rounded-xl hover:bg-slate-100 transition-all">VIEW ALERT DETAILS</Button><Button variant="ghost" className="h-14 px-8 text-white/60 hover:text-white manrope-bold uppercase tracking-widest text-[11px]">DISMISS</Button></div>
          </div>
          <div className="w-full md:w-64 aspect-square rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 group-hover:border-[#E8924A]/40 transition-all duration-700">
            <div className="w-20 h-20 rounded-full bg-[#E8924A]/10 flex items-center justify-center animate-pulse"><AlertTriangle className="w-10 h-10 text-[#E8924A]" /></div><p className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center px-8">Critical Stock Warning</p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E8924A]/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-[#E8924A]/10 transition-all duration-1000" /><div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-3xl" />
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
      setCategory(item.category === "Breakfast" ? "breakfast" : 
                  item.category === "Wine & Spirits" ? "wine" : 
                  item.category === "Desserts" ? "desserts" : 
                  item.category === "Room Service Only" ? "room" : "main");
      setDescription(item.description || "");
      setPreviewUrl(item.image || null);
      setIngredients(item.ingredients || ["BEEF PRIME CUT", "SEA SALT"]);
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
    return INVENTORY_SUGGESTIONS.filter(item => 
      item.toUpperCase().includes(query) && !ingredients.includes(item.toUpperCase())
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
      alert("Please enter a menu item name.");
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
      image: previewUrl,
      ingredients,
      dietary,
      status: item?.status || "Available"
    });
  };

  return (
    <DialogContent className="sm:max-w-[1000px] p-0 border-0 overflow-hidden bg-white rounded-3xl flex flex-col h-[90vh]">
      <div className="p-8 md:p-12 space-y-12 flex-1 overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-[#E8924A] uppercase tracking-[0.3em]">
            Culinary Administration
          </p>
          <DialogTitle className="manrope-bold text-4xl text-[#0D2137] tracking-tight">
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
                    : "border-gray-200 bg-[#F1F5F9] hover:border-[#E8924A]/40",
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
                      <Camera className="w-6 h-6 text-slate-300 group-hover:text-[#E8924A] transition-colors" />
                      <Plus className="w-3 h-3 text-slate-300 absolute bottom-4 right-4 group-hover:text-[#E8924A]" />
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
                  className="h-20 bg-[#F1F5F9] border-0 rounded-2xl pl-12 text-3xl manrope-bold text-[#0D2137] placeholder:text-slate-300 focus-visible:ring-0"
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
                  className="h-16 bg-[#F1F5F9] border-0 rounded-2xl px-6 text-sm font-semibold text-[#0D2137] placeholder:text-slate-300 focus-visible:ring-0"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-[#43474D] uppercase tracking-widest">
                  Category
                </label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-16 bg-[#F1F5F9] border-0 rounded-2xl px-6 text-sm font-semibold text-[#0D2137] placeholder:text-slate-300 focus:ring-0">
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
                className="w-full h-40 bg-[#F1F5F9] border-0 rounded-2xl p-6 text-sm font-semibold text-[#0D2137] resize-none outline-none focus:ring-0 focus:ring-offset-0 placeholder:text-slate-300"
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
                    className="h-14 bg-[#F1F5F9] border-0 rounded-2xl pl-12 text-sm font-semibold text-[#0D2137] placeholder:text-slate-400 focus-visible:ring-0"
                  />
                </div>

                {/* Suggestions Dropdown */}
                {filteredSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-[85px] bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-300 max-h-48 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {filteredSuggestions.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setIngredients([...ingredients, item.toUpperCase()]);
                          setIngredientInput("");
                        }}
                        className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-xs font-semibold text-[#0D2137] flex items-center justify-between transition-colors group"
                      >
                        <span>{item}</span>
                        <span className="text-[9px] font-black text-[#E8924A] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">+ Add</span>
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
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      addIngredient();
                    }}
                    className="h-[30px] px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-[#BA722E] text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                  >
                    + ADD
                  </button>
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
                      className="w-5 h-5 rounded-full border-gray-300 text-[#0D2137] focus:ring-0 data-[state=checked]:bg-[#0D2137]"
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
                      className="w-5 h-5 rounded-full border-gray-300 text-[#0D2137] focus:ring-0 data-[state=checked]:bg-[#0D2137]"
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
                      className="w-5 h-5 rounded-full border-gray-300 text-[#0D2137] focus:ring-0 data-[state=checked]:bg-[#0D2137]"
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
                      className="w-5 h-5 rounded-full border-gray-300 text-[#0D2137] focus:ring-0 data-[state=checked]:bg-[#0D2137]"
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
        <Button onClick={handleFormSave} className="h-[56px] px-10 bg-[#E8924A] hover:bg-[#D4813B] text-white manrope-bold rounded-xl shadow-xl shadow-orange-500/5 transition-all hover:scale-[1.02]">
          SAVE TO MENU
        </Button>
      </div>
    </DialogContent>
  );
}
