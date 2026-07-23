"use client";

import { useState, useEffect, useCallback } from "react";

interface Location {
  id: number;
  name: string;
  country: string;
  lat: number;
  lng: number;
  year: string;
  description: string;
  phase: string;
  sort_order: number;
}

const PHASES = [
  "Early Life", "Spiritual Quest", "Wandering Monk", "World Mission",
  "Second Western Visit", "Return to India", "Later Years", "Legacy"
];

const btnPrimary: React.CSSProperties = { minHeight: 40, fontSize: "0.85rem", padding: "0 1.1rem" };
const labelStyle: React.CSSProperties = { color: "var(--ink-muted)" };

export default function AdminMapPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "", country: "", lat: "", lng: "", year: "", description: "", phase: "",
  });

  const fetchLocations = useCallback(async () => {
    const res = await fetch("/api/map/locations");
    const data = await res.json();
    setLocations(data.locations || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchLocations(); }, [fetchLocations]);

  const resetForm = () => {
    setForm({ name: "", country: "", lat: "", lng: "", year: "", description: "", phase: "" });
    setEditId(null);
    setShowForm(false);
  };

  const saveLocation = async () => {
    const body = {
      name: form.name,
      country: form.country,
      lat: parseFloat(form.lat),
      lng: parseFloat(form.lng),
      year: form.year,
      description: form.description,
      phase: form.phase,
    };

    if (editId) {
      await fetch(`/api/map/locations/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/map/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
    resetForm();
    fetchLocations();
  };

  const deleteLocation = async (id: number) => {
    if (!confirm("Delete this location?")) return;
    await fetch(`/api/map/locations/${id}`, { method: "DELETE" });
    fetchLocations();
  };

  const editLocation = (loc: Location) => {
    setForm({
      name: loc.name,
      country: loc.country,
      lat: loc.lat.toString(),
      lng: loc.lng.toString(),
      year: loc.year,
      description: loc.description,
      phase: loc.phase,
    });
    setEditId(loc.id);
    setShowForm(true);
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: "var(--saffron)", borderTopColor: "transparent" }} /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="m-eyebrow mb-1">World Travels</p>
          <h1 className="text-3xl" style={{ color: "var(--ivory)" }}>Travel Map</h1>
          <p className="text-sm mt-1" style={{ color: "var(--ink-muted)" }}>Manage Vivekananda&apos;s travel locations</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm({ name: "", country: "", lat: "", lng: "", year: "", description: "", phase: "" }); }}
          className="m-btn m-btn-primary"
          style={btnPrimary}
        >
          + Add Location
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="m-card p-6 mb-6">
          <h3 className="text-xl mb-4" style={{ color: "var(--ivory)" }}>
            {editId ? "Edit Location" : "Add Location"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={labelStyle}>Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2"
                placeholder="e.g., Chicago"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={labelStyle}>Country</label>
              <input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full px-3 py-2"
                placeholder="e.g., USA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={labelStyle}>Year</label>
              <input
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="w-full px-3 py-2"
                placeholder="e.g., 1893"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={labelStyle}>Latitude</label>
              <input
                value={form.lat}
                onChange={(e) => setForm({ ...form, lat: e.target.value })}
                type="number"
                step="0.0001"
                className="w-full px-3 py-2"
                placeholder="e.g., 41.8781"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={labelStyle}>Longitude</label>
              <input
                value={form.lng}
                onChange={(e) => setForm({ ...form, lng: e.target.value })}
                type="number"
                step="0.0001"
                className="w-full px-3 py-2"
                placeholder="e.g., -87.6298"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={labelStyle}>Phase</label>
              <select
                value={form.phase}
                onChange={(e) => setForm({ ...form, phase: e.target.value })}
                className="w-full px-3 py-2"
              >
                <option value="">Select phase</option>
                {PHASES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1" style={labelStyle}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2"
                placeholder="What happened at this location"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={saveLocation}
              disabled={!form.name || !form.country || !form.lat || !form.lng}
              className="m-btn m-btn-primary disabled:opacity-40"
              style={btnPrimary}
            >
              {editId ? "Update" : "Add"}
            </button>
            <button onClick={resetForm} className="m-btn m-btn-ghost" style={btnPrimary}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Locations table */}
      <div className="m-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--hairline-strong)", background: "var(--bg-raised)" }}>
              <th className="text-left px-4 py-3 m-eyebrow" style={{ color: "var(--gold)" }}>Name</th>
              <th className="text-left px-4 py-3 m-eyebrow" style={{ color: "var(--gold)" }}>Country</th>
              <th className="text-left px-4 py-3 m-eyebrow" style={{ color: "var(--gold)" }}>Year</th>
              <th className="text-left px-4 py-3 m-eyebrow" style={{ color: "var(--gold)" }}>Phase</th>
              <th className="text-left px-4 py-3 m-eyebrow" style={{ color: "var(--gold)" }}>Coords</th>
              <th className="text-right px-4 py-3 m-eyebrow" style={{ color: "var(--gold)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {locations.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8" style={{ color: "var(--ink-muted)" }}>No locations. Add some to populate the map.</td></tr>
            ) : (
              locations.map((loc) => (
                <tr key={loc.id} className="hover:bg-white/5" style={{ borderBottom: "1px solid var(--hairline)" }}>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--ivory)" }}>{loc.name}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--ink-muted)" }}>{loc.country}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--ink-muted)" }}>{loc.year}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(212, 163, 79, 0.12)", border: "1px solid var(--hairline)", color: "var(--gold)" }}>{loc.phase}</span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: "var(--ink-faint)" }}>{loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => editLocation(loc)} className="px-2 py-1 text-sm hover:underline mr-2" style={{ color: "var(--gold)" }}>Edit</button>
                    <button onClick={() => deleteLocation(loc.id)} className="px-2 py-1 text-sm hover:underline" style={{ color: "#D9776B" }}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
