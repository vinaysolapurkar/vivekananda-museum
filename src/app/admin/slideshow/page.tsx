"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Category {
  id: number;
  name: string;
  description: string;
  kind: "album" | "group";
  parent_id: number | null;
  cover: string | null;
  cover_image_url: string;
  image_count: number;
  child_count: number;
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

const C = {
  cream: "#FFF8F0",
  warm: "#FDF2E6",
  white: "#ffffff",
  border: "#E8D8C8",
  maroon: "#7B2D26",
  saffron: "#E07B2E",
  saffronDeep: "#C06520",
  gold: "#C8963E",
  sage: "#5B7B5E",
  ink: "#2C1810",
  body: "#4A3728",
  muted: "#8B7B6B",
};

const inputStyle: React.CSSProperties = {
  border: `2px solid ${C.border}`,
  background: "white",
  color: C.ink,
  borderRadius: "10px",
  padding: "10px 14px",
  width: "100%",
  fontSize: "14px",
  outline: "none",
};

const serif = { fontFamily: "Cormorant Garamond, serif" } as const;

export default function AdminSlideshow() {
  // Navigation: root → (group) → sub-albums → (album) → images
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeGroup, setActiveGroup] = useState<Category | null>(null);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [activeAlbum, setActiveAlbum] = useState<Category | null>(null);
  const [images, setImages] = useState<SlideImage[]>([]);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  const [uploadingPptx, setUploadingPptx] = useState(false);
  const [editing, setEditing] = useState<SlideImage | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Create/edit category modal state
  const [catForm, setCatForm] = useState<{
    mode: "new-album" | "new-group" | "new-sub" | "edit";
    id?: number;
    name: string;
    description: string;
    parent_id: number | null;
  } | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const pptxRef = useRef<HTMLInputElement>(null);

  const flash = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3500);
  };

  const fetchCategories = useCallback(() => {
    setLoading(true);
    fetch("/api/slideshow/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openGroup = (cat: Category) => {
    fetch(`/api/slideshow/categories/${cat.id}`)
      .then((r) => r.json())
      .then((d) => {
        setActiveGroup(d.category);
        setSubCategories(d.children || []);
        setActiveAlbum(null);
        setImages([]);
      });
  };

  const openAlbum = (cat: Category) => {
    fetch(`/api/slideshow/categories/${cat.id}`)
      .then((r) => r.json())
      .then((d) => {
        setActiveAlbum(d.category);
        setImages(d.images || []);
      });
  };

  const reloadCurrent = () => {
    if (activeAlbum) openAlbum(activeAlbum);
    else if (activeGroup) openGroup(activeGroup);
    fetchCategories();
  };

  const backToRoot = () => {
    setActiveGroup(null); setSubCategories([]);
    setActiveAlbum(null); setImages([]);
    fetchCategories();
  };

  const backFromAlbum = () => {
    setActiveAlbum(null); setImages([]); setEditing(null);
    if (activeGroup) openGroup(activeGroup);
    else fetchCategories();
  };

  // ─── Category CRUD ───
  const saveCategory = async () => {
    if (!catForm || !catForm.name.trim()) return;
    if (catForm.mode === "edit") {
      await fetch(`/api/slideshow/categories/${catForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: catForm.name, description: catForm.description }),
      });
      flash("Category updated");
    } else {
      const kind = catForm.mode === "new-group" ? "group" : "album";
      await fetch("/api/slideshow/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: catForm.name,
          description: catForm.description,
          kind,
          parent_id: catForm.parent_id,
        }),
      });
      flash(kind === "group" ? "Group created" : "Album created");
    }
    setCatForm(null);
    reloadCurrent();
  };

  const deleteCategory = async (cat: Category) => {
    const what = cat.kind === "group"
      ? "this group and ALL its sub-albums and images"
      : "this album and all its images";
    if (!confirm(`Delete ${what}?`)) return;
    await fetch(`/api/slideshow/categories/${cat.id}`, { method: "DELETE" });
    flash("Deleted");
    if (activeAlbum?.id === cat.id) backFromAlbum();
    else reloadCurrent();
  };

  // ─── Image upload ───
  const uploadFiles = async (files: File[]) => {
    if (!activeAlbum) return;
    const imgs = files.filter((f) => f.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|tiff?|avif|heic|bmp)$/i.test(f.name));
    if (imgs.length === 0) { flash("No image files found", false); return; }
    setUploading({ done: 0, total: imgs.length });
    let ok = 0;
    for (let i = 0; i < imgs.length; i++) {
      const fd = new FormData();
      fd.append("file", imgs[i]);
      fd.append("title", imgs[i].name.replace(/\.[^.]+$/, ""));
      fd.append("category_id", String(activeAlbum.id));
      fd.append("duration_seconds", "5");
      try {
        const res = await fetch("/api/slideshow/upload", { method: "POST", body: fd });
        if (res.ok) ok++;
      } catch { /* keep going */ }
      setUploading({ done: i + 1, total: imgs.length });
    }
    setUploading(null);
    flash(`${ok} of ${imgs.length} image${imgs.length > 1 ? "s" : ""} uploaded`, ok > 0);
    reloadCurrent();
  };

  const uploadPptx = async (file: File) => {
    if (!activeAlbum) return;
    setUploadingPptx(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("category_id", String(activeAlbum.id));
    fd.append("duration_seconds", "8");
    fd.append("crop_bottom", "1");
    try {
      const res = await fetch("/api/slideshow/upload-pptx", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) flash(`PPTX imported — ${data.slides_extracted} slides added`);
      else flash(data.error || "PPTX import failed", false);
    } catch { flash("PPTX import error", false); }
    finally { setUploadingPptx(false); reloadCurrent(); }
  };

  // ─── Image editing ───
  const saveImage = async () => {
    if (!editing) return;
    await fetch(`/api/slideshow/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editing.title, description: editing.description,
        station_number: editing.station_number, sort_order: editing.sort_order,
        duration_seconds: editing.duration_seconds, crop_bottom: editing.crop_bottom,
      }),
    });
    setEditing(null); flash("Image saved");
    if (activeAlbum) openAlbum(activeAlbum);
  };

  const deleteImage = async (id: number) => {
    if (!confirm("Delete this image?")) return;
    await fetch(`/api/slideshow/${id}`, { method: "DELETE" });
    reloadCurrent();
  };

  const moveImage = async (index: number, direction: -1 | 1) => {
    const next = [...images];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setImages(next);
    await fetch("/api/slideshow/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: next.map((img) => img.id) }),
    });
  };

  const setAsCover = async (img: SlideImage) => {
    if (!activeAlbum) return;
    await fetch(`/api/slideshow/categories/${activeAlbum.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cover_image_url: img.image_url }),
    });
    flash("Cover image set");
    fetchCategories();
  };

  // ─── Breadcrumb ───
  const crumbs: { label: string; onClick?: () => void }[] = [
    { label: "All Categories", onClick: backToRoot },
  ];
  if (activeGroup) crumbs.push({ label: activeGroup.name, onClick: activeAlbum ? () => openGroup(activeGroup) : undefined });
  if (activeAlbum) crumbs.push({ label: activeAlbum.name });

  const displayCats = activeGroup ? subCategories : categories;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-semibold" style={{ ...serif, color: C.ink }}>Slideshow Studio</h1>
          <p className="text-sm mt-0.5" style={{ color: C.muted }}>
            Organise galleries into groups &amp; albums, then upload images or PowerPoint decks.
          </p>
        </div>
        <a href="/kiosk/slideshow" target="_blank" rel="noreferrer"
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ border: `1px solid ${C.border}`, color: C.body, background: "white" }}>
          Preview kiosk →
        </a>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5 text-sm flex-wrap">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span style={{ color: C.border }}>/</span>}
            {c.onClick ? (
              <button onClick={c.onClick} className="font-medium hover:underline" style={{ color: C.saffronDeep }}>{c.label}</button>
            ) : (
              <span className="font-semibold" style={{ color: C.ink }}>{c.label}</span>
            )}
          </span>
        ))}
      </div>

      {/* Toast */}
      {msg && (
        <div className="mb-4 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2"
          style={{
            background: msg.ok ? "#5B7B5E15" : "#B4443715",
            color: msg.ok ? C.sage : "#B44437",
            border: `1px solid ${msg.ok ? "#5B7B5E30" : "#B4443730"}`,
          }}>
          <span>{msg.ok ? "✓" : "⚠"}</span>{msg.text}
        </div>
      )}

      {/* ─────────── IMAGE MANAGER (inside an album) ─────────── */}
      {activeAlbum ? (
        <AlbumManager
          album={activeAlbum}
          images={images}
          editing={editing}
          setEditing={setEditing}
          uploading={uploading}
          uploadingPptx={uploadingPptx}
          dragOver={dragOver}
          setDragOver={setDragOver}
          fileRef={fileRef}
          pptxRef={pptxRef}
          uploadFiles={uploadFiles}
          uploadPptx={uploadPptx}
          saveImage={saveImage}
          deleteImage={deleteImage}
          moveImage={moveImage}
          setAsCover={setAsCover}
        />
      ) : (
        /* ─────────── CATEGORY GRID (root or inside a group) ─────────── */
        <>
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {activeGroup ? (
              <button onClick={() => setCatForm({ mode: "new-sub", name: "", description: "", parent_id: activeGroup.id })}
                className="px-4 py-2 rounded-lg font-medium text-sm text-white" style={{ background: C.saffron }}>
                + New Album in “{activeGroup.name}”
              </button>
            ) : (
              <>
                <button onClick={() => setCatForm({ mode: "new-album", name: "", description: "", parent_id: null })}
                  className="px-4 py-2 rounded-lg font-medium text-sm text-white" style={{ background: C.saffron }}>
                  🖼 New Album
                </button>
                <button onClick={() => setCatForm({ mode: "new-group", name: "", description: "", parent_id: null })}
                  className="px-4 py-2 rounded-lg font-medium text-sm text-white" style={{ background: C.maroon }}>
                  📁 New Group
                </button>
              </>
            )}
          </div>

          {/* Category form */}
          {catForm && (
            <div className="rounded-2xl p-5 mb-5" style={{ background: "white", border: `1px solid ${C.border}`, boxShadow: "0 2px 12px rgba(139,69,19,0.06)" }}>
              <h3 className="font-semibold mb-1" style={{ color: C.ink }}>
                {catForm.mode === "edit" ? "Edit category"
                  : catForm.mode === "new-group" ? "New group (holds albums)"
                  : catForm.mode === "new-sub" ? `New album in “${activeGroup?.name}”`
                  : "New album (holds images)"}
              </h3>
              <p className="text-xs mb-3" style={{ color: C.muted }}>
                {catForm.mode === "new-group"
                  ? "A group is a folder that contains multiple albums — e.g. “Lectures in the West”."
                  : "An album holds the images shown as one slideshow — e.g. “Chicago Address, 1893”."}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input autoFocus type="text" placeholder="Name" value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && saveCategory()} style={inputStyle} />
                <input type="text" placeholder="Short description (optional)" value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && saveCategory()} style={inputStyle} />
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={saveCategory} className="px-5 py-2 rounded-lg text-sm font-medium text-white" style={{ background: C.maroon }}>
                  {catForm.mode === "edit" ? "Save" : "Create"}
                </button>
                <button onClick={() => setCatForm(null)} className="px-5 py-2 rounded-lg text-sm" style={{ border: `1px solid ${C.border}`, color: C.muted }}>Cancel</button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: C.saffron, borderTopColor: "transparent" }} />
            </div>
          ) : displayCats.length === 0 ? (
            <div className="text-center py-16 rounded-2xl" style={{ background: C.warm, border: `2px dashed ${C.border}` }}>
              <p className="text-lg mb-1" style={{ ...serif, color: C.body }}>
                {activeGroup ? "No albums in this group yet" : "No categories yet"}
              </p>
              <p className="text-sm" style={{ color: C.muted }}>
                {activeGroup ? "Add an album to start uploading images." : "Create an album for images, or a group to organise many albums."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayCats.map((cat) => {
                const isGroup = cat.kind === "group" || Number(cat.child_count) > 0;
                const count = isGroup ? Number(cat.child_count) : Number(cat.image_count);
                return (
                  <div key={cat.id} className="group rounded-2xl overflow-hidden transition-all hover:shadow-lg"
                    style={{ background: "white", border: `1px solid ${C.border}`, boxShadow: "0 2px 12px rgba(139,69,19,0.05)" }}>
                    <button onClick={() => (isGroup ? openGroup(cat) : openAlbum(cat))} className="block w-full text-left">
                      <div className="relative h-32 flex items-center justify-center overflow-hidden" style={{ background: C.warm }}>
                        {cat.cover ? (
                          <img src={cat.cover} alt={cat.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        ) : (
                          <span className="text-4xl opacity-50">{isGroup ? "📁" : "🖼"}</span>
                        )}
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                          style={{ background: isGroup ? C.maroon : C.saffron, color: "white" }}>
                          {isGroup ? "Group" : "Album"}
                        </span>
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-sm truncate" style={{ color: C.ink }}>{cat.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: C.muted }}>
                          {isGroup ? `${count} album${count !== 1 ? "s" : ""}` : `${count} image${count !== 1 ? "s" : ""}`}
                        </p>
                      </div>
                    </button>
                    <div className="flex border-t" style={{ borderColor: C.border }}>
                      <button onClick={() => setCatForm({ mode: "edit", id: cat.id, name: cat.name, description: cat.description, parent_id: cat.parent_id })}
                        className="flex-1 py-2 text-xs font-medium transition-colors hover:bg-black/5" style={{ color: C.body }}>Rename</button>
                      <span style={{ width: 1, background: C.border }} />
                      <button onClick={() => deleteCategory(cat)}
                        className="flex-1 py-2 text-xs font-medium transition-colors hover:bg-black/5" style={{ color: C.saffronDeep }}>Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ───────────────────────── Album image manager ───────────────────────── */
function AlbumManager(props: {
  album: Category;
  images: SlideImage[];
  editing: SlideImage | null;
  setEditing: (i: SlideImage | null) => void;
  uploading: { done: number; total: number } | null;
  uploadingPptx: boolean;
  dragOver: boolean;
  setDragOver: (b: boolean) => void;
  fileRef: React.RefObject<HTMLInputElement | null>;
  pptxRef: React.RefObject<HTMLInputElement | null>;
  uploadFiles: (files: File[]) => void;
  uploadPptx: (file: File) => void;
  saveImage: () => void;
  deleteImage: (id: number) => void;
  moveImage: (index: number, dir: -1 | 1) => void;
  setAsCover: (img: SlideImage) => void;
}) {
  const {
    album, images, editing, setEditing, uploading, uploadingPptx, dragOver, setDragOver,
    fileRef, pptxRef, uploadFiles, uploadPptx, saveImage, deleteImage, moveImage, setAsCover,
  } = props;

  return (
    <>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-semibold" style={{ ...serif, color: C.ink }}>{album.name}</h2>
          {album.description && <p className="text-sm" style={{ color: C.muted }}>{album.description}</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => pptxRef.current?.click()} disabled={uploadingPptx}
            className="px-4 py-2 rounded-lg font-medium text-sm text-white disabled:opacity-50" style={{ background: C.maroon }}>
            {uploadingPptx ? "Importing…" : "📄 Import PPTX"}
          </button>
          <button onClick={() => fileRef.current?.click()} disabled={!!uploading}
            className="px-4 py-2 rounded-lg font-medium text-sm text-white disabled:opacity-50" style={{ background: C.saffron }}>
            {uploading ? `Uploading ${uploading.done}/${uploading.total}…` : "🖼 Upload images"}
          </button>
        </div>
      </div>

      <input ref={pptxRef} type="file" accept=".pptx,.ppt" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPptx(f); e.target.value = ""; }} />
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
        onChange={(e) => { const fs = e.target.files; if (fs) uploadFiles(Array.from(fs)); e.target.value = ""; }} />

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); uploadFiles(Array.from(e.dataTransfer.files)); }}
        onClick={() => fileRef.current?.click()}
        className="rounded-2xl mb-5 py-6 text-center cursor-pointer transition-all"
        style={{
          background: dragOver ? "#E07B2E12" : C.warm,
          border: `2px dashed ${dragOver ? C.saffron : C.border}`,
        }}>
        <p className="text-sm font-medium" style={{ color: dragOver ? C.saffronDeep : C.body }}>
          {uploading ? `Uploading ${uploading.done} of ${uploading.total}…` : "Drop images here, or click to browse"}
        </p>
        <p className="text-xs mt-0.5" style={{ color: C.muted }}>JPG · PNG · WEBP · GIF · TIFF — any size</p>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="rounded-2xl p-5 mb-4" style={{ background: "white", border: `1px solid ${C.border}`, boxShadow: "0 2px 12px rgba(139,69,19,0.06)" }}>
          <h3 className="font-semibold mb-3" style={{ color: C.ink }}>Edit image</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input type="text" placeholder="Title" value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })} style={inputStyle} />
            <input type="number" placeholder="Seconds on screen" value={editing.duration_seconds}
              onChange={(e) => setEditing({ ...editing, duration_seconds: Number(e.target.value) || 5 })} style={inputStyle} />
            <input type="number" placeholder="Station # (optional)" value={editing.station_number || ""}
              onChange={(e) => setEditing({ ...editing, station_number: e.target.value ? Number(e.target.value) : null })} style={inputStyle} />
            <div className="md:col-span-3">
              <textarea rows={2} placeholder="Caption / description" value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })} style={{ ...inputStyle, resize: "vertical" }} />
            </div>
            <label className="md:col-span-3 flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={editing.crop_bottom === 1}
                onChange={(e) => setEditing({ ...editing, crop_bottom: e.target.checked ? 1 : 0 })} className="w-4 h-4" />
              <span className="text-sm" style={{ color: C.ink }}>Crop bottom watermark (for NotebookLM exports)</span>
            </label>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={saveImage} className="px-5 py-2 rounded-lg text-sm font-medium text-white" style={{ background: C.maroon }}>Save</button>
            <button onClick={() => setEditing(null)} className="px-5 py-2 rounded-lg text-sm" style={{ border: `1px solid ${C.border}`, color: C.muted }}>Cancel</button>
          </div>
        </div>
      )}

      {images.length === 0 ? (
        <div className="text-center py-12 rounded-2xl" style={{ background: C.warm, border: `2px dashed ${C.border}` }}>
          <p className="text-sm" style={{ color: C.muted }}>No images yet — drop some above to build this slideshow.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div key={img.id} className="rounded-2xl overflow-hidden group relative"
              style={{ background: "white", border: `1px solid ${C.border}`, boxShadow: "0 2px 12px rgba(139,69,19,0.05)" }}>
              <div className="relative h-36 overflow-hidden" style={{ background: "#0f0806" }}>
                <img src={img.image_url} alt={img.title} className="w-full h-full object-contain" />
                <span className="absolute top-2 left-2 w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center"
                  style={{ background: "rgba(15,8,6,0.75)", color: "#E8C06A" }}>{idx + 1}</span>
                {album.cover_image_url === img.image_url && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: C.gold, color: "white" }}>Cover</span>
                )}
                {/* Reorder controls */}
                <div className="absolute bottom-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => moveImage(idx, -1)} disabled={idx === 0}
                    className="w-7 h-7 rounded-md text-xs flex items-center justify-center disabled:opacity-20"
                    style={{ background: "rgba(15,8,6,0.8)", color: "#E8C06A" }}>←</button>
                  <button onClick={() => moveImage(idx, 1)} disabled={idx === images.length - 1}
                    className="w-7 h-7 rounded-md text-xs flex items-center justify-center disabled:opacity-20"
                    style={{ background: "rgba(15,8,6,0.8)", color: "#E8C06A" }}>→</button>
                </div>
              </div>
              <div className="p-2.5">
                <p className="text-xs font-medium truncate" style={{ color: C.ink }}>{img.title || "Untitled"}</p>
                <div className="flex gap-2 text-[11px] mt-0.5" style={{ color: C.muted }}>
                  <span>{img.duration_seconds || 5}s</span>
                  {img.station_number ? <span style={{ color: C.gold }}>· Stn {img.station_number}</span> : null}
                </div>
                <div className="flex gap-1 mt-2">
                  <button onClick={() => setEditing(img)} className="flex-1 py-1 text-[11px] rounded" style={{ border: `1px solid ${C.border}`, color: C.body }}>Edit</button>
                  <button onClick={() => setAsCover(img)} className="flex-1 py-1 text-[11px] rounded" style={{ border: `1px solid ${C.border}`, color: C.gold }}>Cover</button>
                  <button onClick={() => deleteImage(img.id)} className="flex-1 py-1 text-[11px] rounded" style={{ border: `1px solid ${C.border}`, color: C.saffronDeep }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
