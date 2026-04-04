"use client";

import { useState, useEffect, useRef } from "react";

interface SlideImage {
  id: number;
  title: string;
  description: string;
  image_url: string;
  sort_order: number;
  station_number: number | null;
  is_active: number;
}

export default function AdminSlideshow() {
  const [images, setImages] = useState<SlideImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<SlideImage | null>(null);
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchImages = () => {
    setLoading(true);
    fetch("/api/slideshow")
      .then((r) => r.json())
      .then((d) => setImages(d.images || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchImages(); }, []);

  const uploadImage = async (file: File) => {
    setUploading(true);
    setMsg("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", file.name.replace(/\.[^.]+$/, ""));
    try {
      const res = await fetch("/api/slideshow/upload", { method: "POST", body: fd });
      if (res.ok) {
        setMsg("Image uploaded!");
        fetchImages();
      } else {
        const d = await res.json();
        setMsg(d.error || "Upload failed");
      }
    } catch {
      setMsg("Upload error");
    } finally {
      setUploading(false);
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      const res = await fetch(`/api/slideshow/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editing.title,
          description: editing.description,
          station_number: editing.station_number,
          sort_order: editing.sort_order,
        }),
      });
      if (res.ok) {
        setMsg("Saved!");
        setEditing(null);
        fetchImages();
      }
    } catch { setMsg("Save failed"); }
  };

  const deleteImage = async (id: number) => {
    if (!confirm("Delete this image?")) return;
    await fetch(`/api/slideshow/${id}`, { method: "DELETE" });
    fetchImages();
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;
    const newOrder = [...images];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    const order = newOrder.map((img) => img.id);
    await fetch("/api/slideshow/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order }),
    });
    fetchImages();
  };

  const moveDown = async (index: number) => {
    if (index >= images.length - 1) return;
    const newOrder = [...images];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    const order = newOrder.map((img) => img.id);
    await fetch("/api/slideshow/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order }),
    });
    fetchImages();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-primary">Slideshow Images</h1>
          <p className="text-sm text-text-muted">
            Upload and order images for the kiosk slideshow display.
            <a href="/kiosk/slideshow" target="_blank" className="text-saffron ml-2 hover:underline">
              Preview Kiosk →
            </a>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-saffron text-white rounded-lg font-medium hover:bg-saffron-dark transition-colors disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "+ Upload Image"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = e.target.files;
              if (files) {
                Array.from(files).forEach((f) => uploadImage(f));
              }
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {msg && (
        <div className="mb-4 px-4 py-2 bg-accent/10 text-accent rounded-lg text-sm">{msg}</div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="bg-white border border-border rounded-xl p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-semibold text-primary mb-4">Edit Image</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Title</label>
              <input
                type="text"
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Station Number (optional)</label>
              <input
                type="number"
                value={editing.station_number || ""}
                onChange={(e) => setEditing({ ...editing, station_number: e.target.value ? Number(e.target.value) : null })}
                className="w-full px-3 py-2 border border-border rounded-lg"
                placeholder="Links to audio guide"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Sort Order</label>
              <input
                type="number"
                value={editing.sort_order}
                onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-border rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-muted mb-1">Description</label>
              <textarea
                rows={2}
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={saveEdit} className="px-6 py-2 bg-primary text-white rounded-lg font-medium">Save</button>
            <button onClick={() => setEditing(null)} className="px-6 py-2 border border-border rounded-lg text-text-muted">Cancel</button>
          </div>
        </div>
      )}

      {/* Images grid */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <p className="text-lg mb-2">No images yet</p>
          <p className="text-sm">Upload images to create the kiosk slideshow</p>
        </div>
      ) : (
        <div className="space-y-3">
          {images.map((img, idx) => (
            <div key={img.id} className="bg-white border border-border rounded-xl p-3 flex items-center gap-4">
              {/* Order controls */}
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  className="w-8 h-8 rounded bg-surface flex items-center justify-center text-sm disabled:opacity-30 hover:bg-border"
                >
                  ↑
                </button>
                <span className="text-xs text-center text-text-muted font-mono">{idx + 1}</span>
                <button
                  onClick={() => moveDown(idx)}
                  disabled={idx === images.length - 1}
                  className="w-8 h-8 rounded bg-surface flex items-center justify-center text-sm disabled:opacity-30 hover:bg-border"
                >
                  ↓
                </button>
              </div>

              {/* Thumbnail */}
              <div className="w-24 h-16 bg-surface rounded-lg overflow-hidden shrink-0">
                <img src={img.image_url} alt={img.title} className="w-full h-full object-cover" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text-dark truncate">{img.title || "Untitled"}</p>
                <p className="text-xs text-text-muted truncate">{img.description || "No description"}</p>
                {img.station_number && (
                  <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    Station {img.station_number}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setEditing(img)}
                  className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-surface"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteImage(img.id)}
                  className="px-3 py-1.5 text-sm border border-red-200 text-red-500 rounded-lg hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
