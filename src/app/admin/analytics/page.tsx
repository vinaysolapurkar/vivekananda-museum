"use client";

import { useState, useEffect } from "react";
import MuseumIcon from "@/components/MuseumIcon";

type Period = "24h" | "7d" | "30d" | "all";

interface TotalRow { module: string; event_type: string; count: number }
interface TopItem { module: string; item_id: string; item_name: string; views: number }
interface DailyRow { date: string; module: string; count: number }
interface ChatRow { question: string; asked_count: number }
interface QuizRow { visitor_name: string; score: number; passed: number; attempted_at: string }
interface CatRow { item_name: string; views: number }
interface HourRow { hour: number; count: number }

interface AnalyticsData {
  period: string;
  totals: TotalRow[];
  topItems: TopItem[];
  daily: DailyRow[];
  chatQuestions: ChatRow[];
  quizScores: QuizRow[];
  categoryViews: CatRow[];
  slideViews: TopItem[];
  summary: { totalEvents: number; quizAttempts: number; quizPassed: number; chatQuestions: number };
  busiestHours: HourRow[];
}

const PERIODS: { key: Period; label: string }[] = [
  { key: "24h", label: "Last 24 hours" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "all", label: "All time" },
];

const MODULE_META: Record<string, { label: string; icon: string }> = {
  slideshow: { label: "Slideshow", icon: "gallery" },
  guide: { label: "Audio Guide", icon: "headphones" },
  map: { label: "Travel Map", icon: "globe" },
  chat: { label: "Speak with Swamiji", icon: "lotus" },
  quiz: { label: "Knowledge Quiz", icon: "scroll" },
  unknown: { label: "Other", icon: "temple" },
};

function moduleLabel(m: string) {
  return MODULE_META[m]?.label || m.charAt(0).toUpperCase() + m.slice(1);
}

function timeAgo(iso: string) {
  const d = new Date(iso.replace(" ", "T") + "Z");
  const diff = Date.now() - d.getTime();
  const m = Math.round(diff / 60000);
  if (isNaN(m)) return iso;
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.round(h / 24);
  return `${days}d ago`;
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("7d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/analytics?period=${period}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [period]);

  // ── Derived metrics ────────────────────────────────────
  const totalInteractions = data?.summary?.totalEvents ?? 0;
  const quizAttempts = data?.summary?.quizAttempts ?? 0;
  const quizPassed = data?.summary?.quizPassed ?? 0;
  const passRate = quizAttempts > 0 ? Math.round((quizPassed / quizAttempts) * 100) : 0;
  const chatCount = data?.summary?.chatQuestions ?? 0;

  // Interactions per module (from totals)
  const moduleTotals: Record<string, number> = {};
  (data?.totals || []).forEach((t) => {
    moduleTotals[t.module] = (moduleTotals[t.module] || 0) + Number(t.count);
  });
  const moduleRanked = Object.entries(moduleTotals).sort((a, b) => b[1] - a[1]);
  const topModule = moduleRanked[0];

  // Popular exhibits: prefer categoryViews (slideshow themes); fall back to topItems
  const catData = data?.categoryViews || [];
  const popular = (catData.length > 0
    ? catData.map((c) => ({ name: c.item_name || "Untitled", views: Number(c.views), module: "slideshow" }))
    : (data?.topItems || []).map((t) => ({ name: t.item_name || t.item_id || "Untitled", views: Number(t.views), module: t.module }))
  ).slice(0, 8);
  const popularMax = Math.max(1, ...popular.map((p) => p.views));

  // Daily activity: aggregate module counts per day, sort ascending
  const dailyMap: Record<string, number> = {};
  (data?.daily || []).forEach((d) => {
    dailyMap[d.date] = (dailyMap[d.date] || 0) + Number(d.count);
  });
  const dailyRows = Object.entries(dailyMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14);
  const dailyMax = Math.max(1, ...dailyRows.map((d) => d.count));

  const busiest = (data?.busiestHours || [])[0];

  return (
    <div className="w-full max-w-6xl">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="m-eyebrow mb-1">Insights</p>
          <h1 className="text-3xl" style={{ color: "var(--ivory)" }}>Visitor Analytics</h1>
          <p className="text-sm mt-1" style={{ color: "var(--ink-muted)" }}>
            How visitors are engaging with the exhibits
          </p>
        </div>
        {/* Period selector */}
        <div className="flex flex-wrap gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`m-chip ${period === p.key ? "m-chip-active" : ""}`}
              title={p.label}
            >
              {p.key === "all" ? "All time" : p.key}
            </button>
          ))}
        </div>
      </div>

      {loading && !data ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-9 h-9 border-4 rounded-full animate-spin" style={{ borderColor: "var(--saffron)", borderTopColor: "transparent" }} />
        </div>
      ) : (
        <div style={{ opacity: loading ? 0.55 : 1, transition: "opacity 0.2s ease" }}>
          {/* ── KPI tiles ─────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <Kpi icon="temple" tint="saffron" value={totalInteractions.toLocaleString()} label="Total interactions" />
            <Kpi icon="scroll" tint="gold" value={quizAttempts.toLocaleString()} label="Quiz attempts" />
            <Kpi
              icon="check"
              tint="sage"
              value={quizAttempts > 0 ? `${passRate}%` : "—"}
              label="Quiz pass rate"
              sub={quizAttempts > 0 ? `${quizPassed} of ${quizAttempts} passed` : "No attempts"}
            />
            <Kpi icon="lotus" tint="lotus" value={chatCount.toLocaleString()} label="Questions asked" />
            <Kpi
              icon={topModule ? MODULE_META[topModule[0]]?.icon || "gallery" : "gallery"}
              tint="gold"
              value={topModule ? moduleLabel(topModule[0]) : "—"}
              label="Most-used module"
              sub={topModule ? `${topModule[1].toLocaleString()} interactions` : "No data yet"}
              small
            />
          </div>

          {busiest !== undefined && (
            <div className="m-card p-3 mb-6 flex items-center gap-2.5" style={{ maxWidth: "fit-content" }}>
              <span style={{ color: "var(--gold)" }}><MuseumIcon name="clock" size={16} /></span>
              <span className="text-sm" style={{ color: "var(--ink-muted)" }}>
                Busiest time:{" "}
                <span style={{ color: "var(--ivory)", fontWeight: 600 }}>
                  {formatHour(Number(busiest.hour))}
                </span>{" "}
                ({Number(busiest.count).toLocaleString()} interactions)
              </span>
            </div>
          )}

          {/* ── Two-column charts ─────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Popular exhibits */}
            <section className="m-card p-5">
              <SectionHeader icon="gallery" title="Popular exhibits" sub={catData.length > 0 ? "Slideshow themes by views" : "Most-viewed items"} />
              {popular.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="space-y-3 mt-4">
                  {popular.map((p, i) => (
                    <div key={i}>
                      <div className="flex items-baseline justify-between mb-1 gap-3">
                        <span className="text-sm truncate" style={{ color: "var(--ivory)" }}>{p.name}</span>
                        <span className="text-sm tabular-nums shrink-0" style={{ color: "var(--ink-muted)" }}>{p.views.toLocaleString()}</span>
                      </div>
                      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "var(--card-bg-hover)" }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.max(4, (p.views / popularMax) * 100)}%`,
                            background: "linear-gradient(90deg, #D4A34F, #E07B2E)",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Daily activity */}
            <section className="m-card p-5">
              <SectionHeader icon="clock" title="Daily activity" sub="Interactions per day" />
              {dailyRows.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="mt-5">
                  <div className="flex items-end gap-1.5" style={{ height: 160 }}>
                    {dailyRows.map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group" title={`${d.date}: ${d.count}`}>
                        <span className="text-[10px] mb-1 tabular-nums" style={{ color: "var(--ink-faint)" }}>{d.count}</span>
                        <div
                          className="w-full rounded-t-md transition-all"
                          style={{
                            height: `${Math.max(3, (d.count / dailyMax) * 100)}%`,
                            background: "linear-gradient(180deg, #EE8A3C, #C06520)",
                            minHeight: 4,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {dailyRows.map((d, i) => (
                      <span key={i} className="flex-1 text-center text-[10px]" style={{ color: "var(--ink-faint)" }}>
                        {shortDate(d.date)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* ── Quiz results ──────────────────────────── */}
          <section className="m-card p-5 mb-4">
            <SectionHeader icon="award" title="Recent quiz results" sub="Latest visitor attempts" />
            {(data?.quizScores || []).length === 0 ? (
              <EmptyState />
            ) : (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ color: "var(--ink-faint)" }} className="text-left">
                      <th className="font-medium pb-2 pr-4">Visitor</th>
                      <th className="font-medium pb-2 pr-4">Score</th>
                      <th className="font-medium pb-2 pr-4">Result</th>
                      <th className="font-medium pb-2 text-right">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.quizScores || []).map((q, i) => (
                      <tr key={i} style={{ borderTop: "1px solid var(--hairline)" }}>
                        <td className="py-2.5 pr-4" style={{ color: "var(--ivory)" }}>{q.visitor_name || "Anonymous"}</td>
                        <td className="py-2.5 pr-4 tabular-nums" style={{ color: "var(--ink-muted)" }}>{q.score}</td>
                        <td className="py-2.5 pr-4">
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={
                              q.passed
                                ? { background: "rgba(122,158,125,0.15)", color: "#9CC49F", border: "1px solid rgba(122,158,125,0.3)" }
                                : { background: "rgba(217,119,107,0.12)", color: "#E0958A", border: "1px solid rgba(217,119,107,0.3)" }
                            }
                          >
                            {q.passed ? "Passed" : "Did not pass"}
                          </span>
                        </td>
                        <td className="py-2.5 text-right whitespace-nowrap" style={{ color: "var(--ink-faint)" }}>{timeAgo(q.attempted_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* ── Top questions ─────────────────────────── */}
          <section className="m-card p-5">
            <SectionHeader icon="lotus" title="Top questions asked" sub="Most frequent questions to Swamiji" />
            {(data?.chatQuestions || []).length === 0 ? (
              <EmptyState />
            ) : (
              <ol className="mt-4 space-y-2">
                {(data?.chatQuestions || []).slice(0, 10).map((c, i) => (
                  <li key={i} className="flex items-center gap-3 py-1.5" style={{ borderTop: i > 0 ? "1px solid var(--hairline)" : "none" }}>
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                      style={{ background: "rgba(212,163,79,0.12)", color: "var(--gold)", border: "1px solid var(--hairline)" }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm flex-1" style={{ color: "var(--ivory)" }}>{c.question}</span>
                    <span className="text-xs tabular-nums shrink-0" style={{ color: "var(--ink-muted)" }}>
                      {Number(c.asked_count).toLocaleString()}×
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

// ── Components ─────────────────────────────────────────────
const TINTS: Record<string, { bg: string; fg: string }> = {
  saffron: { bg: "rgba(224,123,46,0.12)", fg: "var(--saffron)" },
  gold: { bg: "rgba(212,163,79,0.12)", fg: "var(--gold)" },
  sage: { bg: "rgba(122,158,125,0.14)", fg: "#9CC49F" },
  lotus: { bg: "rgba(212,87,123,0.12)", fg: "#D4577B" },
};

function Kpi({ icon, value, label, sub, tint = "saffron", small }: { icon: string; value: string; label: string; sub?: string; tint?: string; small?: boolean }) {
  const t = TINTS[tint] || TINTS.saffron;
  return (
    <div className="m-card p-4">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: t.bg, border: "1px solid var(--hairline)", color: t.fg }}>
        <MuseumIcon name={icon} size={18} />
      </div>
      <p className={small ? "text-lg font-bold leading-tight" : "text-2xl font-bold"} style={{ color: "var(--ivory)", fontFamily: "var(--font-body)" }}>
        {value}
      </p>
      <p className="text-xs mt-0.5" style={{ color: "var(--ink-muted)" }}>{label}</p>
      {sub && <p className="text-[11px] mt-0.5" style={{ color: "var(--ink-faint)" }}>{sub}</p>}
    </div>
  );
}

function SectionHeader({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span style={{ color: "var(--saffron)" }}><MuseumIcon name={icon} size={18} /></span>
      <div>
        <h2 className="text-lg leading-none" style={{ color: "var(--ivory)" }}>{title}</h2>
        {sub && <p className="text-xs mt-1" style={{ color: "var(--ink-faint)" }}>{sub}</p>}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <span className="mb-2 opacity-50" style={{ color: "var(--ink-faint)" }}><MuseumIcon name="lotus" size={28} /></span>
      <p className="text-sm" style={{ color: "var(--ink-muted)" }}>No data yet for this period</p>
    </div>
  );
}

function shortDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso.slice(5);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatHour(h: number) {
  if (isNaN(h)) return "—";
  const period = h < 12 ? "am" : "pm";
  let hour = h % 12;
  if (hour === 0) hour = 12;
  return `${hour}${period}–${((h + 1) % 12 === 0 ? 12 : (h + 1) % 12)}${(h + 1) % 24 < 12 ? "am" : "pm"}`;
}
