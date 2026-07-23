"use client";

import { useState, useEffect, useCallback } from "react";
import MuseumIcon from "@/components/MuseumIcon";

interface Exhibit {
  id: number;
  name: string;
  description: string;
  kiosk_id: number | null;
  sort_order: number;
  is_active: number;
  image_count: number;
}

interface ExhibitImage {
  id: number;
  image_url: string;
  title: string;
  description: string;
  station_number: number | null;
  sort_order: number;
}

interface Kiosk {
  id: number;
  name: string;
}

const btnPrimary: React.CSSProperties = { minHeight: 40, fontSize: "0.85rem", padding: "0 1.1rem" };
const btnSmall: React.CSSProperties = { minHeight: 34, fontSize: "0.8rem", padding: "0 0.85rem" };
const btnDanger: React.CSSProperties = { ...btnSmall, background: "#9B3D34", color: "var(--ivory)" };
const labelStyle: React.CSSProperties = { color: "var(--ink-muted)" };

export default function AdminExhibitsPage() {
  const [exhibits, setExhibits] = useState<Exhibit[]>([]);
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [images, setImages] = useState<ExhibitImage[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", description: "", kiosk_id: "" });
  const [uploading, setUploading] = useState(false);
  const [imgForm, setImgForm] = useState({ title: "", description: "", station_number: "" });

  const fetchExhibits = useCallback(async () => {
    const [exRes, kioskRes] = await Promise.all([
      fetch("/api/exhibits"),
      fetch("/api/kiosk"),
    ]);
    const exData = await exRes.json();
    const kioskData = await kioskRes.json();
    setExhibits(exData.exhibits || []);
    setKiosks(kioskData.kiosks || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchExhibits(); }, [fetchExhibits]);

  const loadImages = async (exhibitId: number) => {
    if (expanded === exhibitId) { setExpanded(null); return; }
    const res = await fetch(`/api/exhibits/${exhibitId}`);
    const data = await res.json();
    setImages(data.images || []);
    setExpanded(exhibitId);
  };

  const saveExhibit = async () => {
    const body = {
      name: form.name,
      description: form.description,
      kiosk_id: form.kiosk_id ? Number(form.kiosk_id) : null,
    };

    if (editId) {
      await fetch(`/api/exhibits/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/exhibits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
    setShowForm(false);
    setEditId(null);
    setForm({ name: "", description: "", kiosk_id: "" });
    fetchExhibits();
  };

  const deleteExhibit = async (id: number) => {
    if (!confirm("Delete this exhibit and all its images?")) return;
    await fetch(`/api/exhibits/${id}`, { method: "DELETE" });
    fetchExhibits();
    if (expanded === id) setExpanded(null);
  };

  const uploadImage = async (exhibitId: number, file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", imgForm.title);
    fd.append("description", imgForm.description);
    if (imgForm.station_number) fd.append("station_number", imgForm.station_number);

    await fetch(`/api/exhibits/${exhibitId}/images`, { method: "POST", body: fd });
    setImgForm({ title: "", description: "", station_number: "" });
    setUploading(false);
    // Refresh images
    const res = await fetch(`/api/exhibits/${exhibitId}`);
    const data = await res.json();
    setImages(data.images || []);
    fetchExhibits();
  };

  const deleteImage = async (imageId: number) => {
    if (!confirm("Delete this image?")) return;
    await fetch(`/api/exhibits/images/${imageId}`, { method: "DELETE" });
    if (expanded) {
      const res = await fetch(`/api/exhibits/${expanded}`);
      const data = await res.json();
      setImages(data.images || []);
      fetchExhibits();
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: "var(--saffron)", borderTopColor: "transparent" }} /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="m-eyebrow mb-1">Exhibit Gallery</p>
          <h1 className="text-3xl" style={{ color: "var(--ivory)" }}>Exhibits</h1>
          <p className="text-sm mt-1" style={{ color: "var(--ink-muted)" }}>Manage image slideshows for kiosks</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm({ name: "", description: "", kiosk_id: "" }); }}
          className="m-btn m-btn-primary"
          style={btnPrimary}
        >
          + New Exhibit
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="m-card p-6 mb-6">
          <h3 className="text-xl mb-4" style={{ color: "var(--ivory)" }}>
            {editId ? "Edit Exhibit" : "New Exhibit"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={labelStyle}>Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2"
                placeholder="Exhibit name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={labelStyle}>Assign to Kiosk</label>
              <select
                value={form.kiosk_id}
                onChange={(e) => setForm({ ...form, kiosk_id: e.target.value })}
                className="w-full px-3 py-2"
              >
                <option value="">None</option>
                {kiosks.map((k) => (
                  <option key={k.id} value={k.id}>{k.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1" style={labelStyle}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2"
                placeholder="Brief description"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={saveExhibit} className="m-btn m-btn-primary" style={btnPrimary}>
              {editId ? "Update" : "Create"}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="m-btn m-btn-ghost" style={btnPrimary}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Exhibits List */}
      <div className="space-y-3">
        {exhibits.length === 0 && (
          <div className="m-card p-8 text-center" style={{ color: "var(--ink-muted)" }}>
            No exhibits yet. Create one to get started.
          </div>
        )}
        {exhibits.map((ex) => (
          <div key={ex.id} className="m-card overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => loadImages(ex.id)}>
                <span
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(224, 123, 46, 0.12)", border: "1px solid var(--hairline)", color: "var(--saffron)" }}
                >
                  <MuseumIcon name="gallery" size={20} />
                </span>
                <div>
                  <h3 className="font-semibold" style={{ color: "var(--ivory)", fontFamily: "var(--font-body)" }}>{ex.name}</h3>
                  <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
                    {ex.image_count} images
                    {ex.kiosk_id && ` · Kiosk #${ex.kiosk_id}`}
                    {!ex.is_active && " · Inactive"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowForm(true);
                    setEditId(ex.id);
                    setForm({ name: ex.name, description: ex.description, kiosk_id: ex.kiosk_id?.toString() || "" });
                  }}
                  className="m-btn m-btn-ghost"
                  style={btnSmall}
                >
                  Edit
                </button>
                <button onClick={() => deleteExhibit(ex.id)} className="m-btn" style={btnDanger}>
                  Delete
                </button>
                <button onClick={() => loadImages(ex.id)} className="m-btn m-btn-ghost" style={btnSmall}>
                  {expanded === ex.id ? "Collapse" : "Images"}
                </button>
              </div>
            </div>

            {/* Expanded: Images */}
            {expanded === ex.id && (
              <div className="p-4" style={{ borderTop: "1px solid var(--hairline)", background: "var(--card-bg)" }}>
                {/* Upload form */}
                <div className="rounded-lg p-4 mb-4" style={{ background: "var(--bg-raised)", border: "1px solid var(--hairline)" }}>
                  <h4 className="m-eyebrow mb-3">Upload Image</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <input
                      value={imgForm.title}
                      onChange={(e) => setImgForm({ ...imgForm, title: e.target.value })}
                      placeholder="Title (optional)"
                      className="px-3 py-2 text-sm"
                    />
                    <input
                      value={imgForm.description}
                      onChange={(e) => setImgForm({ ...imgForm, description: e.target.value })}
                      placeholder="Description (optional)"
                      className="px-3 py-2 text-sm"
                    />
                    <input
                      value={imgForm.station_number}
                      onChange={(e) => setImgForm({ ...imgForm, station_number: e.target.value })}
                      placeholder="Station # (optional)"
                      type="number"
                      className="px-3 py-2 text-sm"
                    />
                  </div>
                  <label
                    className={`m-btn ${uploading ? "" : "m-btn-primary"} cursor-pointer`}
                    style={{ ...btnPrimary, ...(uploading ? { background: "var(--card-bg)", color: "var(--ink-faint)", border: "1px solid var(--hairline)" } : {}) }}
                  >
                    {uploading ? "Uploading..." : "Choose File & Upload"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadImage(ex.id, file);
                      }}
                    />
                  </label>
                </div>

                {/* Image grid */}
                {images.length === 0 ? (
                  <p className="text-sm text-center py-4" style={{ color: "var(--ink-muted)" }}>No images yet. Upload some above.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {images.map((img, idx) => (
                      <div key={img.id} className="relative group rounded-lg overflow-hidden" style={{ background: "var(--bg-raised)", border: "1px solid var(--hairline)" }}>
                        <img src={img.image_url} alt={img.title || `Image ${idx + 1}`} className="w-full h-32 object-cover" />
                        <div className="p-2">
                          <p className="text-xs font-medium truncate" style={{ color: "var(--ivory)" }}>{img.title || `Image ${idx + 1}`}</p>
                          {img.station_number && (
                            <span className="text-xs" style={{ color: "var(--gold)" }}>Station {img.station_number}</span>
                          )}
                        </div>
                        <button
                          onClick={() => deleteImage(img.id)}
                          className="absolute top-1 right-1 w-6 h-6 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          style={{ background: "#9B3D34" }}
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
