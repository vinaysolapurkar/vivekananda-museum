"use client";

import { useState, useEffect, useCallback } from "react";

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

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-primary">Exhibits</h1>
          <p className="text-text-muted text-sm mt-1">Manage image slideshows for kiosks</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm({ name: "", description: "", kiosk_id: "" }); }}
          className="px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary-light transition-colors"
        >
          + New Exhibit
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-border p-6 mb-6">
          <h3 className="font-heading font-semibold text-primary mb-4">
            {editId ? "Edit Exhibit" : "New Exhibit"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                placeholder="Exhibit name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Assign to Kiosk</label>
              <select
                value={form.kiosk_id}
                onChange={(e) => setForm({ ...form, kiosk_id: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
              >
                <option value="">None</option>
                {kiosks.map((k) => (
                  <option key={k.id} value={k.id}>{k.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-dark mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                placeholder="Brief description"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={saveExhibit} className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-light">
              {editId ? "Update" : "Create"}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="px-4 py-2 border border-border rounded-lg text-text-muted hover:bg-surface">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Exhibits List */}
      <div className="space-y-3">
        {exhibits.length === 0 && (
          <div className="bg-white rounded-xl border border-border p-8 text-center text-text-muted">
            No exhibits yet. Create one to get started.
          </div>
        )}
        {exhibits.map((ex) => (
          <div key={ex.id} className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => loadImages(ex.id)}>
                <span className="text-2xl">🖼️</span>
                <div>
                  <h3 className="font-semibold text-text-dark">{ex.name}</h3>
                  <p className="text-sm text-text-muted">
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
                  className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-surface"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteExhibit(ex.id)}
                  className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                >
                  Delete
                </button>
                <button
                  onClick={() => loadImages(ex.id)}
                  className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-surface"
                >
                  {expanded === ex.id ? "Collapse" : "Images"}
                </button>
              </div>
            </div>

            {/* Expanded: Images */}
            {expanded === ex.id && (
              <div className="border-t border-border p-4 bg-surface">
                {/* Upload form */}
                <div className="bg-white rounded-lg border border-border p-4 mb-4">
                  <h4 className="font-medium text-sm text-text-dark mb-3">Upload Image</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <input
                      value={imgForm.title}
                      onChange={(e) => setImgForm({ ...imgForm, title: e.target.value })}
                      placeholder="Title (optional)"
                      className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                    />
                    <input
                      value={imgForm.description}
                      onChange={(e) => setImgForm({ ...imgForm, description: e.target.value })}
                      placeholder="Description (optional)"
                      className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                    />
                    <input
                      value={imgForm.station_number}
                      onChange={(e) => setImgForm({ ...imgForm, station_number: e.target.value })}
                      placeholder="Station # (optional)"
                      type="number"
                      className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm cursor-pointer transition-colors ${uploading ? "bg-gray-300 text-gray-500" : "bg-saffron text-white hover:bg-saffron-dark"}`}>
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
                  <p className="text-text-muted text-sm text-center py-4">No images yet. Upload some above.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {images.map((img, idx) => (
                      <div key={img.id} className="relative group bg-white rounded-lg border border-border overflow-hidden">
                        <img src={img.image_url} alt={img.title || `Image ${idx + 1}`} className="w-full h-32 object-cover" />
                        <div className="p-2">
                          <p className="text-xs font-medium text-text-dark truncate">{img.title || `Image ${idx + 1}`}</p>
                          {img.station_number && (
                            <span className="text-xs text-saffron">Station {img.station_number}</span>
                          )}
                        </div>
                        <button
                          onClick={() => deleteImage(img.id)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
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
