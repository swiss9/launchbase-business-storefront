"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Star, X, Trash2 } from "lucide-react";
import { brandConfig } from "@/lib/brand";
import { revalidateHome } from "@/actions/revalidate";
import { AdminProductCard } from "@/components/admin/AdminProductCard"; // NEW

const supabase = createClient();

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({
    name: brandConfig.name,
    tagline: brandConfig.tagline,
    colors: { ...brandConfig.colors },
    hero: { ...brandConfig.hero },
    about: { ...brandConfig.about },
    contact: { ...brandConfig.contact },
    footer: {
      ...brandConfig.footer,
      socials: {
        instagram: brandConfig.footer?.socials?.instagram || "",
        facebook: brandConfig.footer?.socials?.facebook || "",
        x: brandConfig.footer?.socials?.x || "",
        youtube: brandConfig.footer?.socials?.youtube || "",
        whatsapp_channel: brandConfig.footer?.socials?.whatsapp_channel || "",
        telegram_channel: brandConfig.footer?.socials?.telegram_channel || "",
        discord_channel: brandConfig.footer?.socials?.discord_channel || "",
        viber_channel: brandConfig.footer?.socials?.viber_channel || "",
      },
    },
    nav: [...brandConfig.nav],
    chat: {
      whatsapp: brandConfig.chat?.whatsapp || "",
      telegram: brandConfig.chat?.telegram || "",
      discord: brandConfig.chat?.discord || "",
      viber: brandConfig.chat?.viber || "",
    },
    preferred_chat: brandConfig.preferred_chat || "whatsapp",
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    badge: "",
    icon: "sparkles",
  });
  const [imageList, setImageList] = useState<string[]>([""]);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = "/login";
      } else {
        setUser(data.user);
        fetchData();
      }
    });
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, revRes, settRes] = await Promise.all([
        supabase!.from("products").select("*").order("created_at", { ascending: false }),
        supabase!.from("reviews").select("*").order("created_at", { ascending: false }),
        supabase!.from("site_settings").select("*").single(),
      ]);
      setProducts(prodRes.data || []);
      setReviews(revRes.data || []);
      if (settRes.data) {
        const s = settRes.data;
        setSettings((prev: any) => ({
          name: s.name ?? prev.name,
          tagline: s.tagline ?? prev.tagline,
          colors: s.colors ?? prev.colors,
          hero: s.hero ?? prev.hero,
          about: s.about ?? prev.about,
          contact: s.contact ?? prev.contact,
          footer: s.footer ?? prev.footer,
          nav: s.nav ?? prev.nav,
          chat: s.chat ?? prev.chat,
          preferred_chat: s.preferred_chat ?? prev.preferred_chat,
        }));
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setForm({ name: "", description: "", price: "", badge: "", icon: "sparkles" });
    setImageList([""]);
    setModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      badge: product.badge || "",
      icon: product.icon || "sparkles",
    });
    const existingImages: string[] = Array.isArray(product.images)
      ? product.images
      : product.image
      ? [product.image]
      : [""];
    setImageList(existingImages);
    setModalOpen(true);
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

  const handleProductSubmit = async () => {
    if (!supabase) return;
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
      is_active: true,
    };
    if (editingProduct) {
      await supabase.from("products").update(payload).eq("id", editingProduct.id);
    } else {
      await supabase.from("products").insert([payload]);
    }
    setModalOpen(false);
    fetchData();
  };

  const handleDeleteProduct = async (id: string) => {
    if (!supabase) return;
    await supabase.from("products").delete().eq("id", id);
    fetchData();
  };

  const toggleReviewApproval = async (review: any) => {
    if (!supabase) return;
    await supabase.from("reviews").update({ approved: !review.approved }).eq("id", review.id);
    fetchData();
  };

  const handleDeleteReview = async (id: string) => {
    if (!supabase) return;
    await supabase.from("reviews").delete().eq("id", id);
    fetchData();
  };

  const handleSettingsChange = (section: string, field: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleSettingsSave = async () => {
    if (!supabase) return;
    const { error } = await supabase.from("site_settings").upsert({ id: 1, ...settings });
    if (!error) {
      await revalidateHome();
      alert("Settings saved. The main site will now show your changes.");
    } else {
      alert(`Error: ${error.message} (Code: ${error.code || "none"})`);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-neutral-500">Loading…</p>
      </div>
    );
  }

  if (!supabase) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-neutral-500">Database not connected.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Tab navigation */}
      <div className="border-b border-neutral-200 pb-4">
        <div className="flex gap-8 text-[11px] uppercase font-medium tracking-[0.2em] text-neutral-400">
          <button
            onClick={() => setActiveTab("products")}
            className={`${activeTab === "products" ? "text-black border-b border-black pb-1 -mb-1" : "hover:text-black"} transition`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`${activeTab === "reviews" ? "text-black border-b border-black pb-1 -mb-1" : "hover:text-black"} transition`}
          >
            Reviews
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`${activeTab === "settings" ? "text-black border-b border-black pb-1 -mb-1" : "hover:text-black"} transition`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab("admins")}
            className={`${activeTab === "admins" ? "text-black border-b border-black pb-1 -mb-1" : "hover:text-black"} transition`}
          >
            Admins
          </button>
        </div>
      </div>

      {/* Products tab – now uses AdminProductCard with image arrows */}
      {activeTab === "products" && (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="font-serif text-xl font-medium tracking-wide">Products</h2>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 bg-black text-white text-[11px] uppercase tracking-[0.15em] font-medium px-5 py-3 hover:bg-neutral-800 transition rounded-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Product
            </button>
          </div>
          {products.length === 0 ? (
            <div className="text-center py-20 text-neutral-400 text-sm">No products yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <AdminProductCard
                  key={product.id}
                  product={product}
                  onEdit={openEditModal}
                  onDelete={handleDeleteProduct}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reviews tab */}
      {activeTab === "reviews" && (
        <div className="space-y-8">
          <h2 className="font-serif text-xl font-medium tracking-wide">Client Reviews</h2>
          {reviews.length === 0 ? (
            <div className="text-center py-20 text-neutral-400 text-sm">No reviews yet.</div>
          ) : (
            <div className="space-y-4 max-w-4xl">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white border border-neutral-100 p-5 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-neutral-200 transition">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] font-medium text-neutral-900">{review.author || "Anonymous"}</span>
                      <div className="flex text-yellow-500 gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-current stroke-none" : "stroke-[1.5] fill-none"}`} />
                        ))}
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono">on {review.product_id || "product"}</span>
                    </div>
                    <p className="text-[12px] text-neutral-600 font-light leading-relaxed">{review.comment}</p>
                  </div>
                  <div className="flex items-center gap-4 self-end md:self-center">
                    <span className={`text-[10px] uppercase font-medium tracking-widest px-2 py-1 rounded-sm ${review.approved ? "text-emerald-600 bg-emerald-50" : "text-neutral-400 bg-neutral-50"}`}>
                      {review.approved ? "Showing" : "Hidden"}
                    </span>
                    <button
                      onClick={() => toggleReviewApproval(review)}
                      className={`text-[11px] uppercase tracking-wider font-medium px-3 py-1.5 rounded-sm transition-colors ${review.approved ? "text-neutral-400 hover:text-black border border-neutral-200 bg-white" : "text-white bg-black hover:bg-neutral-800"}`}
                    >
                      {review.approved ? "Hide" : "Show on site"}
                    </button>
                    <button onClick={() => handleDeleteReview(review.id)} className="text-neutral-400 hover:text-red-600 transition-colors p-1" title="Delete review">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings tab – Full Customization (unchanged) */}
      {activeTab === "settings" && (
        <div className="space-y-8">
          <h2 className="font-serif text-xl font-medium tracking-wide">Site Customization</h2>

          <div className="max-w-2xl bg-white border border-neutral-100 p-6 lg:p-8 rounded-sm space-y-8">
            {/* Business Identity */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">Business Identity</h3>
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-widest text-neutral-500 font-medium">Storefront Name</label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  className="w-full bg-[#f4f4f4] border border-transparent text-[12px] tracking-wide px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition-all font-light"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-widest text-neutral-500 font-medium">Tagline / Motto</label>
                <textarea
                  rows={2}
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full bg-[#f4f4f4] border border-transparent text-[12px] tracking-wide px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition-all font-light resize-none"
                />
              </div>
            </div>

            {/* Hero Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">Hero Section</h3>
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-widest text-neutral-500 font-medium">Title</label>
                <input
                  type="text"
                  value={settings.hero?.title || ""}
                  onChange={(e) => handleSettingsChange("hero", "title", e.target.value)}
                  className="w-full bg-[#f4f4f4] border border-transparent text-[12px] tracking-wide px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition-all font-light"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-widest text-neutral-500 font-medium">Subtitle</label>
                <input
                  type="text"
                  value={settings.hero?.subtitle || ""}
                  onChange={(e) => handleSettingsChange("hero", "subtitle", e.target.value)}
                  className="w-full bg-[#f4f4f4] border border-transparent text-[12px] tracking-wide px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition-all font-light"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-widest text-neutral-500 font-medium">CTA Text</label>
                  <input
                    type="text"
                    value={settings.hero?.cta || ""}
                    onChange={(e) => handleSettingsChange("hero", "cta", e.target.value)}
                    className="w-full bg-[#f4f4f4] border border-transparent text-[12px] tracking-wide px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition-all font-light"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-widest text-neutral-500 font-medium">CTA Link</label>
                  <input
                    type="text"
                    value={settings.hero?.ctaLink || "#products"}
                    onChange={(e) => handleSettingsChange("hero", "ctaLink", e.target.value)}
                    className="w-full bg-[#f4f4f4] border border-transparent text-[12px] tracking-wide px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition-all font-light"
                  />
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">About Section</h3>
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-widest text-neutral-500 font-medium">Title</label>
                <input
                  type="text"
                  value={settings.about?.title || ""}
                  onChange={(e) => handleSettingsChange("about", "title", e.target.value)}
                  className="w-full bg-[#f4f4f4] border border-transparent text-[12px] tracking-wide px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition-all font-light"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-widest text-neutral-500 font-medium">Content</label>
                <textarea
                  rows={4}
                  value={settings.about?.content || ""}
                  onChange={(e) => handleSettingsChange("about", "content", e.target.value)}
                  className="w-full bg-[#f4f4f4] border border-transparent text-[12px] tracking-wide px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition-all font-light resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-widest text-neutral-500 font-medium">Image URL</label>
                <input
                  type="text"
                  value={settings.about?.image || ""}
                  onChange={(e) => handleSettingsChange("about", "image", e.target.value)}
                  className="w-full bg-[#f4f4f4] border border-transparent text-[12px] tracking-wide px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition-all font-light"
                />
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">Contact</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-widest text-neutral-500 font-medium">Email</label>
                  <input
                    type="email"
                    value={settings.contact?.email || ""}
                    onChange={(e) => handleSettingsChange("contact", "email", e.target.value)}
                    className="w-full bg-[#f4f4f4] border border-transparent text-[12px] tracking-wide px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition-all font-light"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-widest text-neutral-500 font-medium">Phone</label>
                  <input
                    type="text"
                    value={settings.contact?.phone || ""}
                    onChange={(e) => handleSettingsChange("contact", "phone", e.target.value)}
                    className="w-full bg-[#f4f4f4] border border-transparent text-[12px] tracking-wide px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition-all font-light"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-widest text-neutral-500 font-medium">Address</label>
                  <input
                    type="text"
                    value={settings.contact?.address || ""}
                    onChange={(e) => handleSettingsChange("contact", "address", e.target.value)}
                    className="w-full bg-[#f4f4f4] border border-transparent text-[12px] tracking-wide px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition-all font-light"
                  />
                </div>
              </div>
            </div>

            {/* Chat Apps (for Book Now) */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">Chat Links (for “Book Now”)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-widest text-neutral-500 font-medium">WhatsApp Number</label>
                  <input
                    type="text"
                    value={settings.chat?.whatsapp || ""}
                    onChange={(e) => handleSettingsChange("chat", "whatsapp", e.target.value)}
                    placeholder="+15551234567"
                    className="w-full bg-[#f4f4f4] border border-transparent text-[12px] tracking-wide px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition-all font-light"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-widest text-neutral-500 font-medium">Telegram Username</label>
                  <input
                    type="text"
                    value={settings.chat?.telegram || ""}
                    onChange={(e) => handleSettingsChange("chat", "telegram", e.target.value)}
                    placeholder="@username"
                    className="w-full bg-[#f4f4f4] border border-transparent text-[12px] tracking-wide px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition-all font-light"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-widest text-neutral-500 font-medium">Discord Server Invite</label>
                  <input
                    type="text"
                    value={settings.chat?.discord || ""}
                    onChange={(e) => handleSettingsChange("chat", "discord", e.target.value)}
                    placeholder="https://discord.gg/..."
                    className="w-full bg-[#f4f4f4] border border-transparent text-[12px] tracking-wide px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition-all font-light"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-widest text-neutral-500 font-medium">Viber Number</label>
                  <input
                    type="text"
                    value={settings.chat?.viber || ""}
                    onChange={(e) => handleSettingsChange("chat", "viber", e.target.value)}
                    placeholder="+15551234567"
                    className="w-full bg-[#f4f4f4] border border-transparent text-[12px] tracking-wide px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition-all font-light"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-widest text-neutral-500 font-medium">Preferred Chat</label>
                <select
                  value={settings.preferred_chat || "whatsapp"}
                  onChange={(e) => setSettings({ ...settings, preferred_chat: e.target.value })}
                  className="w-full bg-[#f4f4f4] border border-transparent text-[12px] tracking-wide px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition-all font-light appearance-none"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="telegram">Telegram</option>
                  <option value="discord">Discord</option>
                  <option value="viber">Viber</option>
                </select>
              </div>
            </div>

            {/* Footer & Social */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">Footer & Social Links</h3>
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-widest text-neutral-500 font-medium">Copyright</label>
                <input
                  type="text"
                  value={settings.footer?.copyright || ""}
                  onChange={(e) => handleSettingsChange("footer", "copyright", e.target.value)}
                  className="w-full bg-[#f4f4f4] border border-transparent text-[12px] tracking-wide px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition-all font-light"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-widest text-neutral-500 font-medium">Instagram URL</label>
                  <input
                    type="text"
                    value={settings.footer?.socials?.instagram || ""}
                    onChange={(e) =>
                      setSettings((prev: any) => ({
                        ...prev,
                        footer: { ...prev.footer, socials: { ...prev.footer?.socials, instagram: e.target.value } },
                      }))
                    }
                    className="w-full bg-[#f4f4f4] border border-transparent text-[12px] tracking-wide px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition-all font-light"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-widest text-neutral-500 font-medium">Facebook URL</label>
                  <input
                    type="text"
                    value={settings.footer?.socials?.facebook || ""}
                    onChange={(e) =>
                      setSettings((prev: any) => ({
                        ...prev,
                        footer: { ...prev.footer, socials: { ...prev.footer?.socials, facebook: e.target.value } },
                      }))
                    }
                    className="w-full bg-[#f4f4f4] border border-transparent text-[12px] tracking-wide px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition-all font-light"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-widest text-neutral-500 font-medium">X (Twitter) URL</label>
                  <input
                    type="text"
                    value={settings.footer?.socials?.x || ""}
                    onChange={(e) =>
                      setSettings((prev: any) => ({
                        ...prev,
                        footer: { ...prev.footer, socials: { ...prev.footer?.socials, x: e.target.value } },
                      }))
                    }
                    className="w-full bg-[#f4f4f4] border border-transparent text-[12px] tracking-wide px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition-all font-light"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-widest text-neutral-500 font-medium">YouTube URL</label>
                  <input
                    type="text"
                    value={settings.footer?.socials?.youtube || ""}
                    onChange={(e) =>
                      setSettings((prev: any) => ({
                        ...prev,
                        footer: { ...prev.footer, socials: { ...prev.footer?.socials, youtube: e.target.value } },
                      }))
                    }
                    className="w-full bg-[#f4f4f4] border border-transparent text-[12px] tracking-wide px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition-all font-light"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-widest text-neutral-500 font-medium">WhatsApp Channel</label>
                  <input
                    type="text"
                    value={settings.footer?.socials?.whatsapp_channel || ""}
                    onChange={(e) =>
                      setSettings((prev: any) => ({
                        ...prev,
                        footer: { ...prev.footer, socials: { ...prev.footer?.socials, whatsapp_channel: e.target.value } },
                      }))
                    }
                    className="w-full bg-[#f4f4f4] border border-transparent text-[12px] tracking-wide px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition-all font-light"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-widest text-neutral-500 font-medium">Telegram Channel</label>
                  <input
                    type="text"
                    value={settings.footer?.socials?.telegram_channel || ""}
                    onChange={(e) =>
                      setSettings((prev: any) => ({
                        ...prev,
                        footer: { ...prev.footer, socials: { ...prev.footer?.socials, telegram_channel: e.target.value } },
                      }))
                    }
                    className="w-full bg-[#f4f4f4] border border-transparent text-[12px] tracking-wide px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition-all font-light"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-widest text-neutral-500 font-medium">Discord Channel</label>
                  <input
                    type="text"
                    value={settings.footer?.socials?.discord_channel || ""}
                    onChange={(e) =>
                      setSettings((prev: any) => ({
                        ...prev,
                        footer: { ...prev.footer, socials: { ...prev.footer?.socials, discord_channel: e.target.value } },
                      }))
                    }
                    className="w-full bg-[#f4f4f4] border border-transparent text-[12px] tracking-wide px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition-all font-light"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-widest text-neutral-500 font-medium">Viber Channel</label>
                  <input
                    type="text"
                    value={settings.footer?.socials?.viber_channel || ""}
                    onChange={(e) =>
                      setSettings((prev: any) => ({
                        ...prev,
                        footer: { ...prev.footer, socials: { ...prev.footer?.socials, viber_channel: e.target.value } },
                      }))
                    }
                    className="w-full bg-[#f4f4f4] border border-transparent text-[12px] tracking-wide px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition-all font-light"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex justify-end">
              <button
                onClick={handleSettingsSave}
                className="bg-black text-white text-[11px] uppercase tracking-[0.15em] font-medium px-6 py-3.5 hover:bg-neutral-800 transition-all rounded-sm"
              >
                Save All Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admins tab */}
      {activeTab === "admins" && (
        <div className="space-y-8">
          <h2 className="font-serif text-xl font-medium tracking-wide">Admin Management</h2>
          <AdminPanel />
        </div>
      )}

      {/* Product modal – unchanged */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-sm border border-neutral-200 shadow-xl">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="font-serif text-[15px] font-medium tracking-wider uppercase">
                {editingProduct ? "Edit Product" : "New Product Manifest"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-neutral-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-medium">Title</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. N°02 Alabaster Candle"
                  className="w-full bg-[#f4f4f4] border border-transparent text-[12px] px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition-all font-light"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-medium">Price (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="180"
                    className="w-full bg-[#f4f4f4] border border-transparent text-[12px] px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition-all font-light"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-medium">Badge</label>
                  <input
                    type="text"
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    placeholder="e.g. Limited"
                    className="w-full bg-[#f4f4f4] border border-transparent text-[12px] px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition-all font-light"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-medium">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Soy Wax / 220g"
                  className="w-full bg-[#f4f4f4] border border-transparent text-[12px] px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition-all font-light"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-medium mb-2 block">
                  Images (first is primary)
                </label>
                <div className="space-y-2">
                  {imageList.map((url, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => handleImageChange(idx, e.target.value)}
                        placeholder="https://..."
                        className="flex-1 bg-[#f4f4f4] border border-transparent text-[12px] px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition-all font-light"
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
                  className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-neutral-500 hover:text-black transition font-medium"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Image URL
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-medium">Icon</label>
                <select
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="w-full bg-[#f4f4f4] border border-transparent text-[12px] px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300 transition-all font-light appearance-none"
                >
                  <option value="sparkles">Sparkles</option>
                  <option value="wallet">Wallet</option>
                  <option value="glasses">Glasses</option>
                  <option value="watch">Watch</option>
                </select>
              </div>
            </div>
            <div className="p-6 bg-[#fafafa] border-t border-neutral-100 flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="text-[11px] uppercase tracking-wider font-medium text-neutral-500 hover:text-black px-4 py-2.5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleProductSubmit}
                className="bg-black text-white text-[11px] uppercase tracking-[0.15em] font-medium px-5 py-2.5 hover:bg-neutral-800 transition-all rounded-sm"
              >
                {editingProduct ? "Update Item" : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------- Admin Panel Component (unchanged) -------------------
function AdminPanel() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isFirstAdmin, setIsFirstAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/admin/admins");
      if (!res.ok) throw new Error("API failed");

      const data = await res.json();
      const adminsArray = Array.isArray(data) ? data : data.admins || [];
      const currentId = data.currentUserId;
      const firstAdminFlag = data.isFirstAdmin ?? false;

      setAdmins(adminsArray);
      setCurrentUserId(currentId);
      setIsFirstAdmin(firstAdminFlag);
    } catch (error) {
      console.error("Failed to fetch admins:", error);
      setAdmins([]);
      setCurrentUserId(null);
      setIsFirstAdmin(false);
    }
    setLoading(false);
  };

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      setEmail("");
      fetchAdmins();
    } else {
      const data = await res.json();
      setError(data.error || "Promotion failed");
    }
  };

  const handleDemote = async (userId: string) => {
    const res = await fetch(`/api/admin/admins/${userId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      fetchAdmins();
    } else {
      const data = await res.json();
      alert(data.error || "Demotion failed");
    }
  };

  if (loading) return <p className="text-sm text-neutral-500">Loading...</p>;

  return (
    <div className="space-y-6 max-w-2xl">
      {isFirstAdmin && (
        <form onSubmit={handlePromote} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">
              Email of user to promote
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#f4f4f4] border border-transparent text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-300"
              placeholder="user@example.com"
            />
          </div>
          <button
            type="submit"
            className="bg-black text-white text-xs uppercase tracking-wider px-5 py-3 rounded-sm hover:bg-neutral-800 transition"
          >
            Promote
          </button>
        </form>
      )}
      {error && <p className="text-red-500 text-xs">{error}</p>}

      <div className="bg-white border border-neutral-100 rounded-sm divide-y divide-neutral-100">
        {admins.length === 0 && !loading && (
          <div className="p-6 text-center text-sm text-neutral-400">No admins found.</div>
        )}
        {admins.map((admin: any) => (
          <div key={admin.user_id} className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium">
                {admin.profiles?.full_name || "No name"}
              </p>
              <p className="text-xs text-neutral-500">{admin.user_id}</p>
            </div>
            {isFirstAdmin && admin.user_id !== currentUserId && (
              <button
                onClick={() => handleDemote(admin.user_id)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}