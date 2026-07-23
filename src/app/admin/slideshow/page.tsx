"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import MuseumIcon from "@/components/MuseumIcon";

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

const btnPrimary: React.CSSProperties = { minHeight: 40, fontSize: "0.85rem", padding: "0 1.1rem" };
const labelStyle: React.CSSProperties = { color: "var(--ink-muted)" };

const inputStyle: React.CSSProperties = {
  padding: "8px 12px",
  width: "100%",
  fontSize: "14px",
};

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
    reloadCurrent();
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
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="m-eyebrow mb-1">Exhibit Gallery</p>
          <h1 className="text-3xl" style={{ color: "var(--ivory)" }}>Slideshow Studio</h1>
          <p className="text-sm mt-1" style={{ color: "var(--ink-muted)" }}>
            Organise galleries into groups &amp; albums, then upload images or PowerPoint decks.
          </p>
        </div>
        <a href="/kiosk/slideshow" target="_blank" rel="noreferrer" className="m-btn m-btn-ghost" style={btnPrimary}>
          Preview kiosk <MuseumIcon name="arrowRight" size={15} />
        </a>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5 text-sm flex-wrap">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span style={{ color: "var(--ink-faint)" }}>/</span>}
            {c.onClick ? (
              <button onClick={c.onClick} className="font-medium hover:underline" style={{ color: "var(--gold)" }}>{c.label}</button>
            ) : (
              <span className="font-semibold" style={{ color: "var(--ivory)" }}>{c.label}</span>
            )}
          </span>
        ))}
      </div>

      {/* Toast */}
      {msg && (
        <div className="mb-4 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2"
          style={{
            background: msg.ok ? "rgba(212, 163, 79, 0.1)" : "rgba(155, 61, 52, 0.18)",
            border: "1px solid var(--hairline)",
            color: msg.ok ? "var(--gold)" : "#D9776B",
          }}>
          {msg.ok ? <MuseumIcon name="check" size={15} /> : <span className="font-bold">!</span>}{msg.text}
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
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            {activeGroup ? (
              <button onClick={() => setCatForm({ mode: "new-sub", name: "", description: "", parent_id: activeGroup.id })}
                className="m-btn m-btn-primary" style={btnPrimary}>
                + New Album in “{activeGroup.name}”
              </button>
            ) : (
              <>
                <button onClick={() => setCatForm({ mode: "new-album", name: "", description: "", parent_id: null })}
                  className="m-btn m-btn-primary" style={btnPrimary}>
                  <MuseumIcon name="gallery" size={16} /> New Album
                </button>
                <button onClick={() => setCatForm({ mode: "new-group", name: "", description: "", parent_id: null })}
                  className="m-btn m-btn-ghost" style={btnPrimary}>
                  <MuseumIcon name="scroll" size={16} /> New Group
                </button>
              </>
            )}
          </div>

          {/* Category form */}
          {catForm && (
            <div className="m-card p-5 mb-5">
              <h3 className="text-lg mb-1" style={{ color: "var(--ivory)" }}>
                {catForm.mode === "edit" ? "Edit category"
                  : catForm.mode === "new-group" ? "New group (holds albums)"
                  : catForm.mode === "new-sub" ? `New album in “${activeGroup?.name}”`
                  : "New album (holds images)"}
              </h3>
              <p className="text-xs mb-3" style={{ color: "var(--ink-faint)" }}>
                {catForm.mode === "new-group"
                  ? "A group is a folder that contains multiple albums — e.g. “Lectures in the West”."
                  : "An album holds the images shown as one slideshow — e.g. “Chicago Address, 1893”."}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1" style={labelStyle}>Name</label>
                  <input autoFocus type="text" placeholder="Name" value={catForm.name}
                    onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && saveCategory()} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={labelStyle}>Description</label>
                  <input type="text" placeholder="Short description (optional)" value={catForm.description}
                    onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && saveCategory()} style={inputStyle} />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={saveCategory} className="m-btn m-btn-primary" style={btnPrimary}>
                  {catForm.mode === "edit" ? "Save" : "Create"}
                </button>
                <button onClick={() => setCatForm(null)} className="m-btn m-btn-ghost" style={btnPrimary}>Cancel</button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: "var(--saffron)", borderTopColor: "transparent" }} />
            </div>
          ) : displayCats.length === 0 ? (
            <div className="text-center py-16 rounded-2xl" style={{ background: "var(--card-bg)", border: "2px dashed var(--hairline)" }}>
              <p className="text-lg mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--ivory)" }}>
                {activeGroup ? "No albums in this group yet" : "No categories yet"}
              </p>
              <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
                {activeGroup ? "Add an album to start uploading images." : "Create an album for images, or a group to organise many albums."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayCats.map((cat) => {
                const isGroup = cat.kind === "group" || Number(cat.child_count) > 0;
                const count = isGroup ? Number(cat.child_count) : Number(cat.image_count);
                return (
                  <div key={cat.id} className="m-card m-card-interactive group overflow-hidden">
                    <button onClick={() => (isGroup ? openGroup(cat) : openAlbum(cat))} className="block w-full text-left">
                      <div className="relative h-32 flex items-center justify-center overflow-hidden" style={{ background: "var(--bg-raised)" }}>
                        {cat.cover ? (
                          <img src={cat.cover} alt={cat.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        ) : (
                          <span style={{ color: "var(--ink-faint)" }}>
                            <MuseumIcon name={isGroup ? "scroll" : "gallery"} size={36} strokeWidth={1.3} />
                          </span>
                        )}
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                          style={isGroup
                            ? { background: "linear-gradient(180deg, #E8B45C, #D4A34F)", color: "#241305" }
                            : { background: "linear-gradient(180deg, #EE8A3C, #D96F24)", color: "#241305" }}>
                          {isGroup ? "Group" : "Album"}
                        </span>
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-sm truncate" style={{ color: "var(--ivory)" }}>{cat.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--ink-muted)" }}>
                          {isGroup ? `${count} album${count !== 1 ? "s" : ""}` : `${count} image${count !== 1 ? "s" : ""}`}
                        </p>
                      </div>
                    </button>
                    <div className="flex" style={{ borderTop: "1px solid var(--hairline)" }}>
                      <button onClick={() => setCatForm({ mode: "edit", id: cat.id, name: cat.name, description: cat.description, parent_id: cat.parent_id })}
                        className="flex-1 py-2 text-xs font-medium transition-colors hover:bg-white/5" style={{ color: "var(--ink-muted)" }}>Rename</button>
                      <span style={{ width: 1, background: "var(--hairline)" }} />
                      <button onClick={() => deleteCategory(cat)}
                        className="flex-1 py-2 text-xs font-medium transition-colors hover:bg-white/5" style={{ color: "#D9776B" }}>Delete</button>
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
          <h2 className="text-2xl" style={{ color: "var(--ivory)" }}>{album.name}</h2>
          {album.description && <p className="text-sm" style={{ color: "var(--ink-muted)" }}>{album.description}</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => pptxRef.current?.click()} disabled={uploadingPptx}
            className="m-btn m-btn-ghost disabled:opacity-50" style={btnPrimary}>
            <MuseumIcon name="scroll" size={16} /> {uploadingPptx ? "Importing…" : "Import PPTX"}
          </button>
          <button onClick={() => fileRef.current?.click()} disabled={!!uploading}
            className="m-btn m-btn-primary disabled:opacity-50" style={btnPrimary}>
            <MuseumIcon name="gallery" size={16} /> {uploading ? `Uploading ${uploading.done}/${uploading.total}…` : "Upload images"}
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
          background: dragOver ? "rgba(224, 123, 46, 0.1)" : "var(--card-bg)",
          border: `2px dashed ${dragOver ? "var(--saffron)" : "var(--hairline-strong)"}`,
        }}>
        <p className="text-sm font-medium" style={{ color: dragOver ? "var(--saffron)" : "var(--ivory)" }}>
          {uploading ? `Uploading ${uploading.done} of ${uploading.total}…` : "Drop images here, or click to browse"}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--ink-faint)" }}>JPG · PNG · WEBP · GIF · TIFF — any size</p>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="m-card p-5 mb-4">
          <h3 className="text-lg mb-3" style={{ color: "var(--ivory)" }}>Edit image</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1" style={labelStyle}>Title</label>
              <input type="text" placeholder="Title" value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={labelStyle}>Seconds on screen</label>
              <input type="number" placeholder="Seconds on screen" value={editing.duration_seconds}
                onChange={(e) => setEditing({ ...editing, duration_seconds: Number(e.target.value) || 5 })} style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={labelStyle}>Station # (optional)</label>
              <input type="number" placeholder="Station # (optional)" value={editing.station_number || ""}
                onChange={(e) => setEditing({ ...editing, station_number: e.target.value ? Number(e.target.value) : null })} style={inputStyle} />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1" style={labelStyle}>Caption / description</label>
              <textarea rows={2} placeholder="Caption / description" value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })} style={{ ...inputStyle, resize: "vertical" }} />
            </div>
            <label className="md:col-span-3 flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={editing.crop_bottom === 1}
                onChange={(e) => setEditing({ ...editing, crop_bottom: e.target.checked ? 1 : 0 })} className="w-4 h-4" />
              <span className="text-sm" style={{ color: "var(--ivory)" }}>Crop bottom watermark (for NotebookLM exports)</span>
            </label>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={saveImage} className="m-btn m-btn-primary" style={btnPrimary}>Save</button>
            <button onClick={() => setEditing(null)} className="m-btn m-btn-ghost" style={btnPrimary}>Cancel</button>
          </div>
        </div>
      )}

      {images.length === 0 ? (
        <div className="text-center py-12 rounded-2xl" style={{ background: "var(--card-bg)", border: "2px dashed var(--hairline)" }}>
          <p className="text-sm" style={{ color: "var(--ink-muted)" }}>No images yet — drop some above to build this slideshow.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div key={img.id} className="m-card overflow-hidden group relative">
              <div className="relative h-36 overflow-hidden" style={{ background: "#0D0906" }}>
                <img src={img.image_url} alt={img.title} className="w-full h-full object-contain" />
                <span className="absolute top-2 left-2 w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center"
                  style={{ background: "rgba(13, 9, 6, 0.78)", border: "1px solid var(--hairline)", color: "var(--gold)" }}>{idx + 1}</span>
                {album.cover_image_url === img.image_url && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{ background: "linear-gradient(180deg, #E8B45C, #D4A34F)", color: "#241305" }}>Cover</span>
                )}
                {/* Reorder controls */}
                <div className="absolute bottom-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => moveImage(idx, -1)} disabled={idx === 0}
                    className="w-7 h-7 rounded-md flex items-center justify-center disabled:opacity-20"
                    style={{ background: "rgba(13, 9, 6, 0.8)", border: "1px solid var(--hairline)", color: "var(--gold)" }}>
                    <MuseumIcon name="arrowLeft" size={13} />
                  </button>
                  <button onClick={() => moveImage(idx, 1)} disabled={idx === images.length - 1}
                    className="w-7 h-7 rounded-md flex items-center justify-center disabled:opacity-20"
                    style={{ background: "rgba(13, 9, 6, 0.8)", border: "1px solid var(--hairline)", color: "var(--gold)" }}>
                    <MuseumIcon name="arrowRight" size={13} />
                  </button>
                </div>
              </div>
              <div className="p-2.5">
                <p className="text-xs font-medium truncate" style={{ color: "var(--ivory)" }}>{img.title || "Untitled"}</p>
                <div className="flex gap-2 text-[11px] mt-0.5" style={{ color: "var(--ink-muted)" }}>
                  <span>{img.duration_seconds || 5}s</span>
                  {img.station_number ? <span style={{ color: "var(--gold)" }}>· Stn {img.station_number}</span> : null}
                </div>
                <div className="flex gap-1 mt-2">
                  <button onClick={() => setEditing(img)} className="flex-1 py-1 text-[11px] rounded transition-colors hover:bg-white/5"
                    style={{ border: "1px solid var(--hairline)", color: "var(--ink-muted)" }}>Edit</button>
                  <button onClick={() => setAsCover(img)} className="flex-1 py-1 text-[11px] rounded transition-colors hover:bg-white/5"
                    style={{ border: "1px solid var(--hairline)", color: "var(--gold)" }}>Cover</button>
                  <button onClick={() => deleteImage(img.id)} className="flex-1 py-1 text-[11px] rounded transition-colors hover:bg-white/5"
                    style={{ border: "1px solid var(--hairline)", color: "#D9776B" }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
