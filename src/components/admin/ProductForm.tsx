"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2 } from "lucide-react";

interface ProductFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export function ProductForm({ initialData, isEditing }: ProductFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  // Convert images array (if exists) to an array of strings, default to one empty string
  const existingImages: string[] = Array.isArray(initialData?.images)
    ? initialData.images
    : initialData?.image
    ? [initialData.image]
    : [""];

  const [imageList, setImageList] = useState<string[]>(existingImages);

  const [form, setForm] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price?.toString() || "",
    badge: initialData?.badge || "",
    icon: initialData?.icon || "sparkles",
    is_active: initialData?.is_active ?? true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageChange = (index: number, value: string) => {
    const updated = [...imageList];
    updated[index] = value;
    setImageList(updated);
  };

  const addImageField = () => setImageList([...imageList, ""]);

  const removeImageField = (index: number) => {
    if (imageList.length <= 1) return;
    const updated = imageList.filter((_, i) => i !== index);
    setImageList(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      alert("Database not connected. Please run the Setup Wizard first.");
      return;
    }
    setLoading(true);

    // Filter out empty URLs
    const cleanedImages = imageList.map((url) => url.trim()).filter((url) => url.length > 0);
    const primaryImage = cleanedImages.length > 0 ? cleanedImages[0] : "";

    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price) || 0,
      image: primaryImage,
      images: cleanedImages,
      badge: form.badge,
      icon: form.icon,
      is_active: form.is_active,
    };

    if (isEditing && initialData) {
      await supabase.from("products").update(payload).eq("id", initialData.id);
    } else {
      await supabase.from("products").insert([payload]);
    }

    setLoading(false);
    router.push("/admin/products");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl bg-white border border-neutral-200 rounded-sm p-6 space-y-6">
      <h2 className="text-xl font-serif font-semibold">
        {isEditing ? "Edit Product" : "New Product"}
      </h2>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Price</label>
            <input type="number" name="price" value={form.price} onChange={handleChange} step="0.01" required className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Badge (optional)</label>
            <input type="text" name="badge" value={form.badge} onChange={handleChange} className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-sm" />
          </div>
        </div>

        {/* Multi‑image section */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Product Images (first is primary)
          </label>
          <div className="space-y-2">
            {imageList.map((url, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => handleImageChange(idx, e.target.value)}
                  placeholder="https://..."
                  className="flex-1 border border-neutral-300 rounded-sm px-3 py-2 text-sm"
                />
                {imageList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(idx)}
                    className="text-neutral-400 hover:text-red-500 transition p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addImageField}
            className="mt-2 inline-flex items-center gap-1 text-xs uppercase tracking-wider text-neutral-500 hover:text-black transition font-medium"
          >
            <Plus className="w-3.5 h-3.5" /> Add Image URL
          </button>
          <p className="text-xs text-neutral-400 mt-1">Leave empty if no images are needed.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Icon</label>
            <select name="icon" value={form.icon} onChange={handleChange} className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-sm">
              <option value="sparkles">Sparkles</option>
              <option value="wallet">Wallet</option>
              <option value="glasses">Glasses</option>
              <option value="watch">Watch</option>
            </select>
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="rounded" />
              Active (visible on site)
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="px-4 py-2 text-sm border border-neutral-300 rounded-sm hover:bg-neutral-50">Cancel</button>
        <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-black text-white rounded-sm hover:bg-neutral-800 disabled:opacity-50">
          {loading ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
    }
