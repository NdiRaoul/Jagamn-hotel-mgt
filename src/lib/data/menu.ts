import { supabaseAdmin } from "@/lib/supabase-server";

export interface MenuCategory {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
}

export interface MenuItem {
  id: string;
  category_id: string | null;
  category_name: string | null;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  image_url: string | null;
  is_special: boolean;
  is_available: boolean;
  sort_order: number;
}

export interface MenuCategoryWithItems extends MenuCategory {
  items: MenuItem[];
}

export async function getMenu(): Promise<MenuCategoryWithItems[]> {
  const [{ data: cats }, { data: items }] = await Promise.all([
    supabaseAdmin
      .from("menu_categories")
      .select("id,name,sort_order,is_active")
      .eq("is_active", true)
      .order("sort_order"),
    supabaseAdmin
      .from("menu_items")
      .select(
        "id,category_id,name,description,price,currency,image_url,is_special,is_available,sort_order,menu_categories(name)",
      )
      .eq("is_available", true)
      .order("sort_order"),
  ]);

  const catMap = new Map<string, MenuCategoryWithItems>();
  (cats || []).forEach((c: any) => {
    catMap.set(c.id, { ...c, items: [] });
  });

  (items || []).forEach((item: any) => {
    const mapped: MenuItem = {
      id: item.id,
      category_id: item.category_id,
      category_name: item.menu_categories?.name ?? null,
      name: item.name,
      description: item.description,
      price: item.price,
      currency: item.currency,
      image_url: item.image_url,
      is_special: item.is_special,
      is_available: item.is_available,
      sort_order: item.sort_order,
    };
    if (item.category_id && catMap.has(item.category_id)) {
      catMap.get(item.category_id)!.items.push(mapped);
    }
  });

  return Array.from(catMap.values()).filter((c) => c.items.length > 0);
}

export async function getMenuForKitchen(): Promise<MenuItem[]> {
  const { data, error } = await supabaseAdmin
    .from("menu_items")
    .select(
      "id,category_id,name,description,price,currency,image_url,is_special,is_available,sort_order,menu_categories(name)",
    )
    .order("sort_order");

  if (error) throw error;

  return (data || []).map((item: any) => ({
    id: item.id,
    category_id: item.category_id,
    category_name: item.menu_categories?.name ?? null,
    name: item.name,
    description: item.description,
    price: item.price,
    currency: item.currency,
    image_url: item.image_url,
    is_special: item.is_special,
    is_available: item.is_available,
    sort_order: item.sort_order,
  }));
}
