"use client";

import { useMemo, useState } from "react";
import MuseumIcon from "@/components/MuseumIcon";
import { useLang } from "@/components/LanguageProvider";

interface JigsawPuzzleProps {
  imageUrl: string;
  gridSize: number;
  onSolved: () => void;
}

function shuffledTiles(size: number): number[] {
  const n = size * size;
  const tiles = Array.from({ length: n }, (_, i) => i);
  do {
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
  } while (tiles.every((v, i) => v === i));
  return tiles;
}

// Tap-to-select, tap-another-to-swap jigsaw. Each tile is a CSS background-image
// slice of a single source photo (background-size scaled to the grid, background-position
// picked per original tile index) — no pre-sliced image assets needed, and every
// shuffle is trivially solvable since it's a plain swap puzzle, not a sliding 15-puzzle.
//
// The parent renders this with `key={question.id}` so a new question (new
// gridSize/imageUrl) always mounts a fresh instance — no effect needed to
// resync state when props change.
export default function JigsawPuzzle({ imageUrl, gridSize, onSolved }: JigsawPuzzleProps) {
  const { t } = useLang();
  const [tiles, setTiles] = useState<number[]>(() => shuffledTiles(gridSize));
  const [selected, setSelected] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);

  const tileStyle = useMemo(() => {
    return (originalIndex: number): React.CSSProperties => {
      const row = Math.floor(originalIndex / gridSize);
      const col = originalIndex % gridSize;
      const denom = gridSize - 1 || 1;
      return {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
        backgroundPosition: `${(col / denom) * 100}% ${(row / denom) * 100}%`,
      };
    };
  }, [gridSize, imageUrl]);

  const handleTap = (pos: number) => {
    if (solved) return;
    if (selected === null) {
      setSelected(pos);
      return;
    }
    if (selected === pos) {
      setSelected(null);
      return;
    }
    const next = [...tiles];
    [next[selected], next[pos]] = [next[pos], next[selected]];
    setTiles(next);
    setSelected(null);

    if (next.every((v, i) => v === i)) {
      setSolved(true);
      onSolved();
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div
        className="grid gap-1 rounded-2xl overflow-hidden p-1"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          aspectRatio: "1 / 1",
          background: "var(--card-bg)",
          border: "1px solid var(--hairline)",
        }}
      >
        {tiles.map((originalIndex, pos) => (
          <button
            key={pos}
            onClick={() => handleTap(pos)}
            disabled={solved}
            className="relative rounded-md transition-all duration-200"
            style={{
              ...tileStyle(originalIndex),
              outline: selected === pos ? "3px solid var(--gold)" : "1px solid var(--hairline)",
              outlineOffset: selected === pos ? -3 : -1,
              opacity: solved ? 1 : selected === pos ? 0.85 : 1,
              cursor: solved ? "default" : "pointer",
            }}
          />
        ))}
      </div>

      {solved && (
        <div
          className="flex items-center justify-center gap-2 mt-4 py-2.5 rounded-full text-sm font-medium"
          style={{
            background: "rgba(212, 163, 79, 0.14)",
            border: "1px solid var(--hairline-strong)",
            color: "var(--gold)",
          }}
        >
          <MuseumIcon name="check" size={15} strokeWidth={2} />
          {t("quiz.puzzleSolved")}
        </div>
      )}
    </div>
  );
}
