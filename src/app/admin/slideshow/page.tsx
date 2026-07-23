"use client";

import { useState, useEffect, useRef } from "react";

interface Category {
  id: number;
  name: string;
  description: string;
  image_count: number;
  sort_order: number;
}

interface SlideImage {
  id: number;
  title: string;
  description: string;
  image_url: string;
  sort_order: number;
  station_number: number | null;
  duration_seconds: number;
  category_id: number | null;
  crop_bottom: number;
}

const inputStyle: React.CSSProperties = {
  padding: "8px 12px", width: "100%", fontSize: "14px",
};

const btnPrimary: React.CSSProperties = { minHeight: 40, fontSize: "0.85rem", padding: "0 1.1rem" };
const btnSmall: React.CSSProperties = { minHeight: 30, fontSize: "0.75rem", padding: "0 0.7rem" };
const btnDanger: React.CSSProperties = { ...btnSmall, background: "#9B3D34", color: "var(--ivory)" };

export default function AdminSlideshow() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [images, setImages] = useState<SlideImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<SlideImage | null>(null);
  const [msg, setMsg] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [showNewCat, setShowNewCat] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [uploadingPptx, setUploadingPptx] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const pptxRef = useRef<HTMLInputElement>(null);

  const fetchCategories = () => {
    setLoading(true);
    fetch("/api/slideshow/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const fetchImages = (catId: number) => {
    fetch(`/api/slideshow/categories/${catId}`)
      .then((r) => r.json())
      .then((d) => {
        setSelectedCat(d.category);
        setImages(d.images || []);
      })
      .catch(() => {});
  };

  useEffect(() => { fetchCategories(); }, []);

  const createCategory = async () => {
    if (!newCatName.trim()) return;
    await fetch("/api/slideshow/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCatName, description: newCatDesc }),
    });
    setNewCatName(""); setNewCatDesc(""); setShowNewCat(false);
    setMsg("Category created!"); fetchCategories();
  };

  const updateCategory = async () => {
    if (!editingCat) return;
    await fetch(`/api/slideshow/categories/${editingCat.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingCat.name, description: editingCat.description }),
    });
    setEditingCat(null); setMsg("Category updated!"); fetchCategories();
  };

  const deleteCategory = async (id: number) => {
    if (!confirm("Delete this category and all its images?")) return;
    await fetch(`/api/slideshow/categories/${id}`, { method: "DELETE" });
    if (selectedCat?.id === id) { setSelectedCat(null); setImages([]); }
    setMsg("Category deleted"); fetchCategories();
  };

  const uploadImage = async (file: File) => {
    if (!selectedCat) return;
    setUploading(true); setMsg("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", file.name.replace(/\.[^.]+$/, ""));
    fd.append("category_id", String(selectedCat.id));
    fd.append("duration_seconds", "5");
    try {
      const res = await fetch("/api/slideshow/upload", { method: "POST", body: fd });
      if (res.ok) { setMsg("Image uploaded!"); fetchImages(selectedCat.id); fetchCategories(); }
      else { const d = await res.json(); setMsg(d.error || "Upload failed"); }
    } catch { setMsg("Upload error"); }
    finally { setUploading(false); }
  };

  const uploadPptx = async (file: File) => {
    if (!selectedCat) return;
    setUploadingPptx(true); setMsg("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("category_id", String(selectedCat.id));
    fd.append("duration_seconds", "8");
    fd.append("crop_bottom", "1");
    try {
      const res = await fetch("/api/slideshow/upload-pptx", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setMsg(`PPTX imported! ${data.slides_extracted} slides extracted (watermark crop enabled)`);
        fetchImages(selectedCat.id);
        fetchCategories();
      } else {
        setMsg(data.error || "PPTX import failed");
      }
    } catch { setMsg("PPTX import error"); }
    finally { setUploadingPptx(false); }
  };

  const saveImage = async () => {
    if (!editing) return;
    await fetch(`/api/slideshow/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editing.title, description: editing.description,
        station_number: editing.station_number, sort_order: editing.sort_order,
        duration_seconds: editing.duration_seconds,
        crop_bottom: editing.crop_bottom,
      }),
    });
    setEditing(null); setMsg("Saved!");
    if (selectedCat) fetchImages(selectedCat.id);
  };

  const deleteImage = async (id: number) => {
    if (!confirm("Delete this image?")) return;
    await fetch(`/api/slideshow/${id}`, { method: "DELETE" });
    if (selectedCat) { fetchImages(selectedCat.id); fetchCategories(); }
  };

  const moveImage = async (index: number, direction: -1 | 1) => {
    const newImages = [...images];
    const target = index + direction;
    if (target < 0 || target >= newImages.length) return;
    [newImages[index], newImages[target]] = [newImages[target], newImages[index]];
    const order = newImages.map((img) => img.id);
    await fetch("/api/slideshow/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order }),
    });
    if (selectedCat) fetchImages(selectedCat.id);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="m-eyebrow mb-1">Exhibit Gallery</p>
          <h1 className="text-3xl" style={{ color: "var(--ivory)" }}>Slideshow Manager</h1>
          <p className="text-sm mt-1" style={{ color: "var(--ink-muted)" }}>
            Create categories, upload images, and manage the kiosk slideshow
          </p>
        </div>
        <div className="flex gap-2">
          <a href="/kiosk/slideshow" target="_blank" className="m-btn m-btn-ghost" style={btnPrimary}>
            Preview Kiosk →
          </a>
          <button onClick={() => setShowNewCat(true)} className="m-btn m-btn-primary" style={btnPrimary}>
            + New Category
          </button>
        </div>
      </div>

      {msg && (
        <div className="mb-4 px-4 py-2 rounded-lg text-sm" style={{ background: "rgba(212, 163, 79, 0.1)", border: "1px solid var(--hairline)", color: "var(--gold)" }}>{msg}</div>
      )}

      {/* New Category Form */}
      {showNewCat && (
        <div className="m-card p-5 mb-6">
          <h3 className="text-lg mb-3" style={{ color: "var(--ivory)" }}>New Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="text" placeholder="Category name (e.g., Karma Yoga)" value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Description" value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)} style={inputStyle} />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={createCategory} className="m-btn m-btn-primary" style={btnPrimary}>Create</button>
            <button onClick={() => setShowNewCat(false)} className="m-btn m-btn-ghost" style={btnPrimary}>Cancel</button>
          </div>
        </div>
      )}

      {/* Edit Category */}
      {editingCat && (
        <div className="m-card p-5 mb-6">
          <h3 className="text-lg mb-3" style={{ color: "var(--ivory)" }}>Edit Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="text" value={editingCat.name} onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })} style={inputStyle} />
            <input type="text" value={editingCat.description} onChange={(e) => setEditingCat({ ...editingCat, description: e.target.value })} style={inputStyle} />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={updateCategory} className="m-btn m-btn-primary" style={btnPrimary}>Save</button>
            <button onClick={() => setEditingCat(null)} className="m-btn m-btn-ghost" style={btnPrimary}>Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Categories sidebar */}
        <div className="space-y-2">
          <p className="m-eyebrow mb-2">Categories</p>
          {loading ? (
            <div className="py-8 text-center"><div className="w-6 h-6 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: "var(--saffron)", borderTopColor: "transparent" }} /></div>
          ) : categories.length === 0 ? (
            <p className="text-sm py-4" style={{ color: "var(--ink-muted)" }}>No categories yet</p>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="m-card m-card-interactive p-3 cursor-pointer"
                style={{ borderLeft: selectedCat?.id === cat.id ? "3px solid var(--saffron)" : "3px solid transparent" }}
                onClick={() => fetchImages(cat.id)}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--ivory)" }}>{cat.name}</p>
                    <p className="text-xs" style={{ color: "var(--ink-muted)" }}>{cat.image_count} images</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setEditingCat(cat); }}
                      className="text-xs px-2 py-1 rounded" style={{ color: "var(--gold)" }}>Edit</button>
                    <button onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id); }}
                      className="text-xs px-2 py-1 rounded" style={{ color: "#D9776B" }}>Del</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Images panel */}
        <div className="md:col-span-2">
          {!selectedCat ? (
            <div className="text-center py-16" style={{ color: "var(--ink-muted)" }}>
              <p className="text-lg mb-1">Select a category</p>
              <p className="text-sm">Click a category on the left to manage its images</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 className="text-2xl" style={{ color: "var(--ivory)" }}>
                  {selectedCat.name}
                </h2>
                <div className="flex gap-2">
                  <button onClick={() => pptxRef.current?.click()} disabled={uploadingPptx}
                    className="m-btn m-btn-ghost disabled:opacity-50" style={btnPrimary}>
                    {uploadingPptx ? "Importing..." : "Upload PPTX"}
                  </button>
                  <button onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="m-btn m-btn-primary disabled:opacity-50" style={btnPrimary}>
                    {uploading ? "Uploading..." : "Upload Images"}
                  </button>
                </div>
                <input ref={pptxRef} type="file" accept=".pptx,.ppt" className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadPptx(file);
                    e.target.value = "";
                  }} />
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files) Array.from(files).forEach((f) => uploadImage(f));
                    e.target.value = "";
                  }} />
              </div>

              {/* Edit image form */}
              {editing && (
                <div className="m-card p-5 mb-4">
                  <h3 className="text-lg mb-3" style={{ color: "var(--ivory)" }}>Edit Image</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input type="text" placeholder="Title" value={editing.title}
                      onChange={(e) => setEditing({ ...editing, title: e.target.value })} style={inputStyle} />
                    <input type="number" placeholder="Display seconds" value={editing.duration_seconds}
                      onChange={(e) => setEditing({ ...editing, duration_seconds: Number(e.target.value) || 5 })} style={inputStyle} />
                    <input type="number" placeholder="Station # (optional)" value={editing.station_number || ""}
                      onChange={(e) => setEditing({ ...editing, station_number: e.target.value ? Number(e.target.value) : null })} style={inputStyle} />
                    <div className="md:col-span-3">
                      <textarea rows={2} placeholder="Description" value={editing.description}
                        onChange={(e) => setEditing({ ...editing, description: e.target.value })} style={{ ...inputStyle, resize: "vertical" as const }} />
                    </div>
                    <div className="md:col-span-3 flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" checked={editing.crop_bottom === 1}
                          onChange={(e) => setEditing({ ...editing, crop_bottom: e.target.checked ? 1 : 0 })}
                          className="w-4 h-4 rounded" />
                        <span className="text-sm" style={{ color: "var(--ivory)" }}>Crop bottom watermark (NotebookLM)</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={saveImage} className="m-btn m-btn-primary" style={btnPrimary}>Save</button>
                    <button onClick={() => setEditing(null)} className="m-btn m-btn-ghost" style={btnPrimary}>Cancel</button>
                  </div>
                </div>
              )}

              {images.length === 0 ? (
                <div className="text-center py-12 rounded-xl" style={{ background: "var(--card-bg)", border: "2px dashed var(--hairline-strong)" }}>
                  <p className="text-sm" style={{ color: "var(--ink-muted)" }}>No images in this category</p>
                  <p className="text-xs mt-1" style={{ color: "var(--gold)" }}>Upload images to create the slideshow</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {images.map((img, idx) => (
                    <div key={img.id} className="m-card p-3 flex items-center gap-3">
                      {/* Reorder */}
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button onClick={() => moveImage(idx, -1)} disabled={idx === 0}
                          className="w-7 h-7 rounded flex items-center justify-center text-xs disabled:opacity-20"
                          style={{ background: "var(--bg-raised)", border: "1px solid var(--hairline)", color: "var(--gold)" }}>↑</button>
                        <span className="text-xs text-center font-mono" style={{ color: "var(--ink-faint)" }}>{idx + 1}</span>
                        <button onClick={() => moveImage(idx, 1)} disabled={idx === images.length - 1}
                          className="w-7 h-7 rounded flex items-center justify-center text-xs disabled:opacity-20"
                          style={{ background: "var(--bg-raised)", border: "1px solid var(--hairline)", color: "var(--gold)" }}>↓</button>
                      </div>

                      {/* Thumbnail */}
                      <div className="w-20 h-14 rounded-lg overflow-hidden shrink-0" style={{ background: "var(--bg-raised)" }}>
                        <img src={img.image_url} alt={img.title} className="w-full h-full object-cover" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate" style={{ color: "var(--ivory)" }}>{img.title || "Untitled"}</p>
                        <div className="flex gap-3 text-xs mt-0.5" style={{ color: "var(--ink-muted)" }}>
                          <span>{img.duration_seconds || 5}s display</span>
                          {img.crop_bottom === 1 && <span style={{ color: "var(--saffron)" }}>Cropped</span>}
                          {img.station_number && <span style={{ color: "var(--gold)" }}>Station {img.station_number}</span>}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => setEditing(img)} className="m-btn m-btn-ghost" style={btnSmall}>Edit</button>
                        <button onClick={() => deleteImage(img.id)} className="m-btn" style={btnDanger}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
