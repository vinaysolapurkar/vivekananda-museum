"use client";

import { useState, useEffect, useCallback } from "react";
import MuseumIcon from "@/components/MuseumIcon";

interface Category {
  id: number;
  name: string;
  description: string;
  kind: "collection" | "group";
  parent_id: number | null;
  letter_count: number;
  child_count: number;
  sort_order: number;
  cover_image_url: string;
}

interface Letter {
  id: number;
  title: string;
  recipient: string;
  sender: string;
  place: string;
  date_label: string;
  body: string;
  sort_order: number;
  category_id: number | null;
}

const btnPrimary: React.CSSProperties = { minHeight: 40, fontSize: "0.85rem", padding: "0 1.1rem" };
const labelStyle: React.CSSProperties = { color: "var(--ink-muted)" };

const inputStyle: React.CSSProperties = {
  padding: "8px 12px",
  width: "100%",
  fontSize: "14px",
};

const emptyLetterForm = { title: "", recipient: "", sender: "Swami Vivekananda", place: "", date_label: "", body: "" };

export default function AdminLetters() {
  // Navigation: root → (group) → sub-collections → (collection) → letters
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeGroup, setActiveGroup] = useState<Category | null>(null);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [activeCollection, setActiveCollection] = useState<Category | null>(null);
  const [letters, setLetters] = useState<Letter[]>([]);

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Letter | null>(null);
  const [creating, setCreating] = useState<typeof emptyLetterForm | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Create/edit category modal state
  const [catForm, setCatForm] = useState<{
    mode: "new-collection" | "new-group" | "new-sub" | "edit";
    id?: number;
    name: string;
    description: string;
    parent_id: number | null;
    cover_image_url: string;
  } | null>(null);

  const flash = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3500);
  };

  const fetchCategories = useCallback(() => {
    setLoading(true);
    fetch("/api/letters/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openGroup = (cat: Category) => {
    fetch(`/api/letters/categories/${cat.id}`)
      .then((r) => r.json())
      .then((d) => {
        setActiveGroup(d.category);
        setSubCategories(d.children || []);
        setActiveCollection(null);
        setLetters([]);
      });
  };

  const openCollection = (cat: Category) => {
    fetch(`/api/letters/categories/${cat.id}`)
      .then((r) => r.json())
      .then((d) => {
        setActiveCollection(d.category);
        setLetters(d.letters || []);
      });
  };

  const reloadCurrent = () => {
    if (activeCollection) openCollection(activeCollection);
    else if (activeGroup) openGroup(activeGroup);
    fetchCategories();
  };

  const backToRoot = () => {
    setActiveGroup(null); setSubCategories([]);
    setActiveCollection(null); setLetters([]);
    fetchCategories();
  };

  const backFromCollection = () => {
    setActiveCollection(null); setLetters([]); setEditing(null); setCreating(null);
    if (activeGroup) openGroup(activeGroup);
    else fetchCategories();
  };

  // ─── Category CRUD ───
  const saveCategory = async () => {
    if (!catForm || !catForm.name.trim()) return;
    if (catForm.mode === "edit") {
      await fetch(`/api/letters/categories/${catForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: catForm.name, description: catForm.description, cover_image_url: catForm.cover_image_url }),
      });
      flash("Category updated");
    } else {
      const kind = catForm.mode === "new-group" ? "group" : "collection";
      await fetch("/api/letters/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: catForm.name,
          description: catForm.description,
          kind,
          parent_id: catForm.parent_id,
          cover_image_url: catForm.cover_image_url,
        }),
      });
      flash(kind === "group" ? "Group created" : "Collection created");
    }
    setCatForm(null);
    reloadCurrent();
  };

  const deleteCategory = async (cat: Category) => {
    const what = cat.kind === "group"
      ? "this group and ALL its sub-collections and letters"
      : "this collection and all its letters";
    if (!confirm(`Delete ${what}?`)) return;
    await fetch(`/api/letters/categories/${cat.id}`, { method: "DELETE" });
    flash("Deleted");
    if (activeCollection?.id === cat.id) backFromCollection();
    else reloadCurrent();
  };

  // ─── Letter CRUD ───
  const createLetter = async () => {
    if (!activeCollection || !creating) return;
    if (!creating.body.trim()) { flash("Letter text is required", false); return; }
    const res = await fetch("/api/letters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...creating, category_id: activeCollection.id }),
    });
    if (res.ok) {
      flash("Letter added");
      setCreating(null);
      reloadCurrent();
    } else {
      const d = await res.json().catch(() => ({}));
      flash(d.error || "Failed to add letter", false);
    }
  };

  const saveLetter = async () => {
    if (!editing) return;
    await fetch(`/api/letters/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editing.title, recipient: editing.recipient, sender: editing.sender,
        place: editing.place, date_label: editing.date_label, body: editing.body,
      }),
    });
    setEditing(null); flash("Letter saved");
    if (activeCollection) openCollection(activeCollection);
  };

  const deleteLetter = async (id: number) => {
    if (!confirm("Delete this letter?")) return;
    await fetch(`/api/letters/${id}`, { method: "DELETE" });
    reloadCurrent();
  };

  const moveLetter = async (index: number, direction: -1 | 1) => {
    const next = [...letters];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setLetters(next);
    await fetch("/api/letters/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: next.map((l) => l.id) }),
    });
  };

  // ─── Breadcrumb ───
  const crumbs: { label: string; onClick?: () => void }[] = [
    { label: "All Categories", onClick: backToRoot },
  ];
  if (activeGroup) crumbs.push({ label: activeGroup.name, onClick: activeCollection ? () => openGroup(activeGroup) : undefined });
  if (activeCollection) crumbs.push({ label: activeCollection.name });

  const displayCats = activeGroup ? subCategories : categories;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="m-eyebrow mb-1">Correspondence Archive</p>
          <h1 className="text-3xl" style={{ color: "var(--ivory)" }}>Letters Studio</h1>
          <p className="text-sm mt-1" style={{ color: "var(--ink-muted)" }}>
            Organise letters into groups &amp; collections, then write letters that appear on a papyrus display.
          </p>
        </div>
        <a href="/letters" target="_blank" rel="noreferrer" className="m-btn m-btn-ghost" style={btnPrimary}>
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

      {/* ─────────── LETTER MANAGER (inside a collection) ─────────── */}
      {activeCollection ? (
        <CollectionManager
          collection={activeCollection}
          letters={letters}
          editing={editing}
          setEditing={setEditing}
          creating={creating}
          setCreating={setCreating}
          createLetter={createLetter}
          saveLetter={saveLetter}
          deleteLetter={deleteLetter}
          moveLetter={moveLetter}
          onBack={backFromCollection}
        />
      ) : (
        /* ─────────── CATEGORY GRID (root or inside a group) ─────────── */
        <>
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            {activeGroup ? (
              <button onClick={() => setCatForm({ mode: "new-sub", name: "", description: "", parent_id: activeGroup.id, cover_image_url: "" })}
                className="m-btn m-btn-primary" style={btnPrimary}>
                + New Collection in “{activeGroup.name}”
              </button>
            ) : (
              <>
                <button onClick={() => setCatForm({ mode: "new-collection", name: "", description: "", parent_id: null, cover_image_url: "" })}
                  className="m-btn m-btn-primary" style={btnPrimary}>
                  <MuseumIcon name="letter" size={16} /> New Collection
                </button>
                <button onClick={() => setCatForm({ mode: "new-group", name: "", description: "", parent_id: null, cover_image_url: "" })}
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
                {catForm.mode === "edit" ? "Edit heading"
                  : catForm.mode === "new-group" ? "New group (holds collections)"
                  : catForm.mode === "new-sub" ? `New collection in “${activeGroup?.name}”`
                  : "New collection (holds letters)"}
              </h3>
              <p className="text-xs mb-3" style={{ color: "var(--ink-faint)" }}>
                {catForm.mode === "new-group"
                  ? "A group is a folder that contains multiple collections — e.g. “Letters from the West”."
                  : "A collection holds the letters shown together — e.g. “Letters to Alasinga Perumal”."}
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1" style={labelStyle}>Cover image URL (optional)</label>
                  <input type="text" placeholder="/images/letters/covers/example.jpg" value={catForm.cover_image_url}
                    onChange={(e) => setCatForm({ ...catForm, cover_image_url: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && saveCategory()} style={inputStyle} />
                  <p className="text-xs mt-1" style={{ color: "var(--ink-faint)" }}>A portrait of the recipient, or a relevant place — shown as the thumbnail on the kiosk.</p>
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
                {activeGroup ? "No collections in this group yet" : "No headings yet"}
              </p>
              <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
                {activeGroup ? "Add a collection to start writing letters." : "Create a collection for letters, or a group to organise many collections."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayCats.map((cat) => {
                const isGroup = cat.kind === "group" || Number(cat.child_count) > 0;
                const count = isGroup ? Number(cat.child_count) : Number(cat.letter_count);
                return (
                  <div key={cat.id} className="m-card m-card-interactive group overflow-hidden">
                    <button onClick={() => (isGroup ? openGroup(cat) : openCollection(cat))} className="block w-full text-left">
                      <div className="relative h-32 flex items-center justify-center overflow-hidden" style={{ background: "var(--bg-raised)" }}>
                        <span style={{ color: "var(--ink-faint)" }}>
                          <MuseumIcon name={isGroup ? "scroll" : "letter"} size={36} strokeWidth={1.3} />
                        </span>
                        {cat.cover_image_url && (
                          <img src={cat.cover_image_url} alt="" className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = "none"; }} />
                        )}
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                          style={isGroup
                            ? { background: "linear-gradient(180deg, #E8B45C, #D4A34F)", color: "#241305" }
                            : { background: "linear-gradient(180deg, #EE8A3C, #D96F24)", color: "#241305" }}>
                          {isGroup ? "Group" : "Collection"}
                        </span>
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-sm truncate" style={{ color: "var(--ivory)" }}>{cat.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--ink-muted)" }}>
                          {isGroup ? `${count} collection${count !== 1 ? "s" : ""}` : `${count} letter${count !== 1 ? "s" : ""}`}
                        </p>
                      </div>
                    </button>
                    <div className="flex" style={{ borderTop: "1px solid var(--hairline)" }}>
                      <button onClick={() => setCatForm({ mode: "edit", id: cat.id, name: cat.name, description: cat.description, parent_id: cat.parent_id, cover_image_url: cat.cover_image_url || "" })}
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

/* ───────────────────────── Collection letter manager ───────────────────────── */
function CollectionManager(props: {
  collection: Category;
  letters: Letter[];
  editing: Letter | null;
  setEditing: (l: Letter | null) => void;
  creating: typeof emptyLetterForm | null;
  setCreating: (c: typeof emptyLetterForm | null) => void;
  createLetter: () => void;
  saveLetter: () => void;
  deleteLetter: (id: number) => void;
  moveLetter: (index: number, dir: -1 | 1) => void;
  onBack: () => void;
}) {
  const {
    collection, letters, editing, setEditing, creating, setCreating,
    createLetter, saveLetter, deleteLetter, moveLetter,
  } = props;

  return (
    <>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-2xl" style={{ color: "var(--ivory)" }}>{collection.name}</h2>
          {collection.description && <p className="text-sm" style={{ color: "var(--ink-muted)" }}>{collection.description}</p>}
        </div>
        <button onClick={() => setCreating({ ...emptyLetterForm })} disabled={!!creating}
          className="m-btn m-btn-primary disabled:opacity-50" style={btnPrimary}>
          <MuseumIcon name="letter" size={16} /> New letter
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <LetterForm
          title="New letter"
          value={creating}
          onChange={setCreating}
          onSave={createLetter}
          onCancel={() => setCreating(null)}
        />
      )}

      {/* Edit form */}
      {editing && (
        <LetterForm
          title="Edit letter"
          value={editing}
          onChange={(v) => setEditing({ ...editing, ...v })}
          onSave={saveLetter}
          onCancel={() => setEditing(null)}
        />
      )}

      {letters.length === 0 ? (
        <div className="text-center py-12 rounded-2xl" style={{ background: "var(--card-bg)", border: "2px dashed var(--hairline)" }}>
          <p className="text-sm" style={{ color: "var(--ink-muted)" }}>No letters yet — add one above to build this collection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {letters.map((letter, idx) => (
            <div key={letter.id} className="m-card overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: "var(--ivory)", fontFamily: "var(--font-display)" }}>
                      {letter.title || "Untitled letter"}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--ink-muted)" }}>
                      {[letter.recipient && `To ${letter.recipient}`, letter.place, letter.date_label].filter(Boolean).join(" · ") || "No details"}
                    </p>
                  </div>
                  <span className="w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0"
                    style={{ background: "rgba(212,163,79,0.12)", border: "1px solid var(--hairline)", color: "var(--gold)" }}>{idx + 1}</span>
                </div>
                <p className="text-xs mt-2 line-clamp-3" style={{ color: "var(--ink-faint)" }}>{letter.body}</p>
              </div>
              <div className="flex" style={{ borderTop: "1px solid var(--hairline)" }}>
                <button onClick={() => moveLetter(idx, -1)} disabled={idx === 0}
                  className="px-2.5 py-2 text-xs disabled:opacity-20 hover:bg-white/5" style={{ color: "var(--gold)" }}>
                  <MuseumIcon name="arrowLeft" size={13} />
                </button>
                <button onClick={() => moveLetter(idx, 1)} disabled={idx === letters.length - 1}
                  className="px-2.5 py-2 text-xs disabled:opacity-20 hover:bg-white/5" style={{ color: "var(--gold)" }}>
                  <MuseumIcon name="arrowRight" size={13} />
                </button>
                <span style={{ width: 1, background: "var(--hairline)" }} />
                <button onClick={() => setEditing(letter)} className="flex-1 py-2 text-xs font-medium transition-colors hover:bg-white/5" style={{ color: "var(--ink-muted)" }}>Edit</button>
                <span style={{ width: 1, background: "var(--hairline)" }} />
                <button onClick={() => deleteLetter(letter.id)} className="flex-1 py-2 text-xs font-medium transition-colors hover:bg-white/5" style={{ color: "#D9776B" }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ───────────────────────── Shared letter form ───────────────────────── */
function LetterForm(props: {
  title: string;
  value: typeof emptyLetterForm;
  onChange: (v: typeof emptyLetterForm) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const { title, value, onChange, onSave, onCancel } = props;
  return (
    <div className="m-card p-5 mb-5">
      <h3 className="text-lg mb-3" style={{ color: "var(--ivory)" }}>{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-3">
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Title (optional)</label>
          <input type="text" placeholder="e.g. To Alasinga Perumal" value={value.title}
            onChange={(e) => onChange({ ...value, title: e.target.value })} style={inputStyle} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Recipient</label>
          <input type="text" placeholder="Recipient" value={value.recipient}
            onChange={(e) => onChange({ ...value, recipient: e.target.value })} style={inputStyle} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Place</label>
          <input type="text" placeholder="e.g. Chicago" value={value.place}
            onChange={(e) => onChange({ ...value, place: e.target.value })} style={inputStyle} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Date</label>
          <input type="text" placeholder="e.g. 20th October 1893" value={value.date_label}
            onChange={(e) => onChange({ ...value, date_label: e.target.value })} style={inputStyle} />
        </div>
        <div className="md:col-span-3">
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Signed by</label>
          <input type="text" placeholder="Sender" value={value.sender}
            onChange={(e) => onChange({ ...value, sender: e.target.value })} style={inputStyle} />
        </div>
        <div className="md:col-span-3">
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Letter text</label>
          <textarea rows={10} placeholder="Type or paste the full text of the letter…" value={value.body}
            onChange={(e) => onChange({ ...value, body: e.target.value })} style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-display)", fontSize: "15px", lineHeight: 1.6 }} />
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <button onClick={onSave} className="m-btn m-btn-primary" style={btnPrimary}>Save</button>
        <button onClick={onCancel} className="m-btn m-btn-ghost" style={btnPrimary}>Cancel</button>
      </div>
    </div>
  );
}
