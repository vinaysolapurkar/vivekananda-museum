"use client";

import { useState, useEffect } from "react";

interface Kiosk {
  id: number;
  name: string;
  location: string;
  screen_size: string;
  is_active: boolean;
}

interface Slide {
  id: number;
  kiosk_id: number;
  slide_number: number;
  title_en: string;
  content_en: string;
  image_url: string;
  duration_seconds: number;
}

export default function AdminKiosks() {
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [slides, setSlides] = useState<Record<number, Slide[]>>({});
  const [loading, setLoading] = useState(true);
  const [editingKiosk, setEditingKiosk] = useState<Partial<Kiosk> | null>(null);
  const [editingSlide, setEditingSlide] = useState<Partial<Slide> | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [expandedKiosk, setExpandedKiosk] = useState<number | null>(null);

  const fetchKiosks = () => {
    setLoading(true);
    fetch("/api/kiosk")
      .then((r) => r.json())
      .then((d) => setKiosks(d.kiosks || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const fetchSlides = (kioskId: number) => {
    fetch(`/api/kiosk/${kioskId}/slides`)
      .then((r) => r.json())
      .then((d) => setSlides((prev) => ({ ...prev, [kioskId]: d.slides || [] })));
  };

  useEffect(() => { fetchKiosks(); }, []);

  const toggleExpand = (id: number) => {
    if (expandedKiosk === id) {
      setExpandedKiosk(null);
    } else {
      setExpandedKiosk(id);
      if (!slides[id]) fetchSlides(id);
    }
  };

  const saveKiosk = async () => {
    if (!editingKiosk) return;
    setSaving(true);
    try {
      const res = await fetch("/api/kiosk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingKiosk),
      });
      if (res.ok) {
        setEditingKiosk(null);
        setMsg("Kiosk saved!");
        fetchKiosks();
      }
    } catch {
      setMsg("Error saving kiosk");
    } finally {
      setSaving(false);
    }
  };

  const saveSlide = async () => {
    if (!editingSlide) return;
    setSaving(true);
    try {
      const isNew = !editingSlide.id;
      const url = isNew ? "/api/kiosk/slides" : `/api/kiosk/slides/${editingSlide.id}`;
      const res = await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSlide),
      });
      if (res.ok) {
        setEditingSlide(null);
        setMsg("Slide saved!");
        if (editingSlide.kiosk_id) fetchSlides(editingSlide.kiosk_id);
      }
    } catch {
      setMsg("Error saving slide");
    } finally {
      setSaving(false);
    }
  };

  const deleteSlide = async (slide: Slide) => {
    if (!confirm("Delete this slide?")) return;
    await fetch(`/api/kiosk/slides/${slide.id}`, { method: "DELETE" });
    fetchSlides(slide.kiosk_id);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-primary">Kiosks</h1>
        <button
          onClick={() => setEditingKiosk({ name: "", location: "", screen_size: "" })}
          className="px-4 py-2 bg-saffron text-white rounded-lg font-medium hover:bg-saffron-dark transition-colors"
        >
          + Add Kiosk
        </button>
      </div>

      {msg && (
        <div className="mb-4 px-4 py-2 bg-accent/10 text-accent rounded-lg text-sm">{msg}</div>
      )}

      {/* New Kiosk Form */}
      {editingKiosk && !editingKiosk.id && (
        <div className="bg-white border border-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">New Kiosk</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              placeholder="Kiosk name"
              value={editingKiosk.name || ""}
              onChange={(e) => setEditingKiosk({ ...editingKiosk, name: e.target.value })}
              className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
            />
            <input
              placeholder="Location"
              value={editingKiosk.location || ""}
              onChange={(e) => setEditingKiosk({ ...editingKiosk, location: e.target.value })}
              className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
            />
            <input
              placeholder="Screen size"
              value={editingKiosk.screen_size || ""}
              onChange={(e) => setEditingKiosk({ ...editingKiosk, screen_size: e.target.value })}
              className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={saveKiosk} disabled={saving} className="px-6 py-2 bg-primary text-white rounded-lg font-medium disabled:opacity-50">
              {saving ? "Saving..." : "Save"}
            </button>
            <button onClick={() => setEditingKiosk(null)} className="px-6 py-2 border border-border rounded-lg">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Slide Edit Form */}
      {editingSlide && (
        <div className="bg-white border border-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingSlide.id ? "Edit Slide" : "New Slide"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Slide number"
              value={editingSlide.slide_number || ""}
              onChange={(e) => setEditingSlide({ ...editingSlide, slide_number: parseInt(e.target.value) || 0 })}
              className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
            />
            <input
              type="number"
              placeholder="Duration (seconds)"
              value={editingSlide.duration_seconds || ""}
              onChange={(e) => setEditingSlide({ ...editingSlide, duration_seconds: parseInt(e.target.value) || 10 })}
              className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
            />
            <input
              placeholder="Title (English)"
              value={editingSlide.title_en || ""}
              onChange={(e) => setEditingSlide({ ...editingSlide, title_en: e.target.value })}
              className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary md:col-span-2"
            />
            <textarea
              placeholder="Content (English) - HTML allowed"
              rows={4}
              value={editingSlide.content_en || ""}
              onChange={(e) => setEditingSlide({ ...editingSlide, content_en: e.target.value })}
              className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary md:col-span-2"
            />
            <input
              placeholder="Image URL"
              value={editingSlide.image_url || ""}
              onChange={(e) => setEditingSlide({ ...editingSlide, image_url: e.target.value })}
              className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary md:col-span-2"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={saveSlide} disabled={saving} className="px-6 py-2 bg-primary text-white rounded-lg font-medium disabled:opacity-50">
              {saving ? "Saving..." : "Save"}
            </button>
            <button onClick={() => setEditingSlide(null)} className="px-6 py-2 border border-border rounded-lg">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Kiosks List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : kiosks.length === 0 ? (
        <p className="text-center text-text-muted py-10">No kiosks yet.</p>
      ) : (
        <div className="space-y-3">
          {kiosks.map((k) => (
            <div key={k.id} className="bg-white border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => toggleExpand(k.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-surface/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${k.is_active ? "bg-accent" : "bg-border"}`} />
                  <div className="text-left">
                    <p className="font-semibold text-text-dark">{k.name}</p>
                    <p className="text-xs text-text-muted">{k.location}</p>
                  </div>
                </div>
                <span className="text-text-muted">{expandedKiosk === k.id ? "▼" : "▶"}</span>
              </button>

              {expandedKiosk === k.id && (
                <div className="border-t border-border p-4 bg-surface/30">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-text-muted">Slides</h3>
                    <button
                      onClick={() => setEditingSlide({ kiosk_id: k.id, slide_number: (slides[k.id]?.length || 0) + 1, duration_seconds: 10 })}
                      className="px-3 py-1 text-sm bg-saffron text-white rounded-lg"
                    >
                      + Add Slide
                    </button>
                  </div>
                  {(slides[k.id] || []).length === 0 ? (
                    <p className="text-sm text-text-muted">No slides yet</p>
                  ) : (
                    <div className="space-y-2">
                      {(slides[k.id] || []).map((s) => (
                        <div key={s.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-border">
                          <div>
                            <span className="text-xs text-text-muted">#{s.slide_number}</span>
                            <p className="font-medium text-sm">{s.title_en || "Untitled"}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingSlide(s)}
                              className="px-2 py-1 text-xs border border-border rounded hover:bg-surface"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteSlide(s)}
                              className="px-2 py-1 text-xs border border-red-200 text-red-500 rounded hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
