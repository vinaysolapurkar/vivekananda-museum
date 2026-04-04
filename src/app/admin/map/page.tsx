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

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-primary">Travel Map</h1>
          <p className="text-text-muted text-sm mt-1">Manage Vivekananda&apos;s travel locations</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm({ name: "", country: "", lat: "", lng: "", year: "", description: "", phase: "" }); }}
          className="px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary-light transition-colors"
        >
          + Add Location
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-border p-6 mb-6">
          <h3 className="font-heading font-semibold text-primary mb-4">
            {editId ? "Edit Location" : "Add Location"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                placeholder="e.g., Chicago"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Country</label>
              <input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                placeholder="e.g., USA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Year</label>
              <input
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                placeholder="e.g., 1893"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Latitude</label>
              <input
                value={form.lat}
                onChange={(e) => setForm({ ...form, lat: e.target.value })}
                type="number"
                step="0.0001"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                placeholder="e.g., 41.8781"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Longitude</label>
              <input
                value={form.lng}
                onChange={(e) => setForm({ ...form, lng: e.target.value })}
                type="number"
                step="0.0001"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                placeholder="e.g., -87.6298"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Phase</label>
              <select
                value={form.phase}
                onChange={(e) => setForm({ ...form, phase: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
              >
                <option value="">Select phase</option>
                {PHASES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-text-dark mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                placeholder="What happened at this location"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={saveLocation}
              disabled={!form.name || !form.country || !form.lat || !form.lng}
              className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-light disabled:opacity-40"
            >
              {editId ? "Update" : "Add"}
            </button>
            <button onClick={resetForm} className="px-4 py-2 border border-border rounded-lg text-text-muted hover:bg-surface">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Locations table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="text-left px-4 py-3 text-sm font-medium text-text-muted">Name</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-text-muted">Country</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-text-muted">Year</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-text-muted">Phase</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-text-muted">Coords</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-text-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {locations.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-text-muted">No locations. Add some to populate the map.</td></tr>
            ) : (
              locations.map((loc) => (
                <tr key={loc.id} className="border-b border-border last:border-0 hover:bg-surface/50">
                  <td className="px-4 py-3 font-medium text-text-dark">{loc.name}</td>
                  <td className="px-4 py-3 text-text-muted text-sm">{loc.country}</td>
                  <td className="px-4 py-3 text-text-muted text-sm">{loc.year}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{loc.phase}</span>
                  </td>
                  <td className="px-4 py-3 text-text-muted text-xs font-mono">{loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => editLocation(loc)} className="px-2 py-1 text-sm text-primary hover:underline mr-2">Edit</button>
                    <button onClick={() => deleteLocation(loc.id)} className="px-2 py-1 text-sm text-red-600 hover:underline">Delete</button>
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
