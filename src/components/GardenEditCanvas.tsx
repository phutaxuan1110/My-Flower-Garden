import { useRef, useState } from "react";
import { GardenBackdrop } from "./GardenBackdrop";
import { BouquetFrame } from "./BouquetFrame";
import { slotsForTheme } from "../lib/gardenLayout";
import { useLanguage } from "../i18n/LanguageProvider";
import type { BouquetWithFlowers, GardenPlacement } from "../types";
import type { GardenTheme } from "../lib/gardenLayout";

interface GardenEditCanvasProps {
  /** Placements for every OTHER bouquet already in this area (never includes the target). */
  otherPlacements: GardenPlacement[];
  bouquetsById: Map<string, BouquetWithFlowers>;
  targetBouquet: BouquetWithFlowers;
  theme?: GardenTheme | string;
  /** Current draft slot for the target bouquet, or null if not placed yet (tray mode). */
  draftSlotId: string | null;
  onDraftChange: (slotId: string) => void;
  onConflict: (occupantBouquetId: string) => void;
}

// A drop within this fraction of the canvas width from a slot's center still
// snaps to that slot, so people don't need pixel-perfect precision on a
// 375px-wide screen.
const SNAP_RADIUS_FRACTION = 0.14;

export function GardenEditCanvas({
  otherPlacements,
  bouquetsById,
  targetBouquet,
  theme = "garden",
  draftSlotId,
  onDraftChange,
  onConflict,
}: GardenEditCanvasProps) {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredSlotId, setHoveredSlotId] = useState<string | null>(null);
  const dragOriginRef = useRef<{ pointerId: number } | null>(null);
  const slots = slotsForTheme(theme);

  const occupiedBySlot = new Map(otherPlacements.map((p) => [p.slotId, p.bouquetId]));

  function findNearestSlot(clientX: number, clientY: number): string | null {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const xPct = ((clientX - rect.left) / rect.width) * 100;
    const yPct = ((clientY - rect.top) / rect.height) * 100;
    let nearest: { id: string; dist: number } | null = null;
    for (const slot of slots) {
      const dx = slot.xPct - xPct;
      const dy = slot.yPct - yPct;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= SNAP_RADIUS_FRACTION * 100 && (!nearest || dist < nearest.dist)) {
        nearest = { id: slot.id, dist };
      }
    }
    return nearest?.id ?? null;
  }

  function handlePointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragOriginRef.current = { pointerId: e.pointerId };
    setIsDragging(true);
    setGhostPos({ x: e.clientX, y: e.clientY });
    setHoveredSlotId(draftSlotId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (!dragOriginRef.current || dragOriginRef.current.pointerId !== e.pointerId) return;
    setGhostPos({ x: e.clientX, y: e.clientY });
    setHoveredSlotId(findNearestSlot(e.clientX, e.clientY));
  }

  function endDrag(e: React.PointerEvent<HTMLButtonElement>) {
    if (!dragOriginRef.current || dragOriginRef.current.pointerId !== e.pointerId) return;
    const targetSlotId = findNearestSlot(e.clientX, e.clientY);
    dragOriginRef.current = null;
    setIsDragging(false);
    setGhostPos(null);
    setHoveredSlotId(null);

    if (!targetSlotId) return; // dropped outside any slot: snap back, no change
    const occupant = occupiedBySlot.get(targetSlotId);
    if (occupant && occupant !== targetBouquet.id) {
      onConflict(occupant);
      return;
    }
    if (targetSlotId !== draftSlotId) {
      onDraftChange(targetSlotId);
    }
  }

  function handlePointerCancel(e: React.PointerEvent<HTMLButtonElement>) {
    if (!dragOriginRef.current || dragOriginRef.current.pointerId !== e.pointerId) return;
    dragOriginRef.current = null;
    setIsDragging(false);
    setGhostPos(null);
    setHoveredSlotId(null);
  }

  return (
    <div>
      {draftSlotId === null && (
        <div className="mb-3 flex flex-col items-center gap-2 rounded-[24px] border border-dashed border-[var(--color-primary-strong)] bg-white/60 py-4">
          <p className="text-xs text-[var(--color-muted)]">{t("gardenEdit.trayHint")}</p>
          <button
            type="button"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={handlePointerCancel}
            style={{ opacity: isDragging ? 0.35 : 1 }}
            className="flex min-h-[44px] cursor-grab flex-col items-center active:cursor-grabbing"
            aria-label={t("gardenEdit.dragHint")}
          >
            <BouquetFrame
              imageUrl={targetBouquet.imageUrl}
              frameStyle={targetBouquet.frameStyle}
              alt={targetBouquet.name}
              className="h-20 w-20 drop-shadow-[0_0_10px_var(--color-rose)]"
            />
            <span className="mt-1 max-w-[110px] truncate text-xs font-semibold text-[var(--color-rose)]">
              {targetBouquet.name}
            </span>
          </button>
        </div>
      )}

      <div
        ref={canvasRef}
        className="relative aspect-[572/1024] w-full touch-none select-none overflow-hidden rounded-[32px] border border-[var(--color-line)] bg-[var(--color-primary)]"
      >
        <GardenBackdrop theme={theme} />
        {slots.map((slot) => {
          const occupantId = occupiedBySlot.get(slot.id);
          const occupantBouquet = occupantId ? bouquetsById.get(occupantId) : undefined;
          const isTargetHere = slot.id === draftSlotId;
          const isHovered = isDragging && hoveredSlotId === slot.id;
          const size = 92 * slot.scale;

          if (isTargetHere) {
            return (
              <button
                key={slot.id}
                type="button"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={endDrag}
                onPointerCancel={handlePointerCancel}
                style={{
                  left: `${slot.xPct}%`,
                  top: `${slot.yPct}%`,
                  width: size,
                  transform: "translate(-50%, -50%)",
                  opacity: isDragging ? 0.35 : 1,
                }}
                className="absolute flex min-h-[44px] cursor-grab flex-col items-center active:cursor-grabbing"
                aria-label={t("gardenEdit.dragHint")}
              >
                <BouquetFrame
                  imageUrl={targetBouquet.imageUrl}
                  frameStyle={targetBouquet.frameStyle}
                  alt={targetBouquet.name}
                  className="drop-shadow-[0_0_12px_var(--color-rose)]"
                  style={{ width: size * 0.82, height: size * 0.95 }}
                />
                <span className="mt-0.5 max-w-[90px] truncate text-[11px] font-semibold text-[var(--color-rose)]">
                  {targetBouquet.name}
                </span>
              </button>
            );
          }

          if (occupantBouquet) {
            return (
              <div
                key={slot.id}
                style={{
                  left: `${slot.xPct}%`,
                  top: `${slot.yPct}%`,
                  width: size,
                  transform: "translate(-50%, -50%)",
                }}
                className={`pointer-events-none absolute flex flex-col items-center transition-opacity ${
                  isDragging ? "opacity-40" : ""
                }`}
              >
                <BouquetFrame
                  imageUrl={occupantBouquet.imageUrl}
                  frameStyle={occupantBouquet.frameStyle}
                  alt={occupantBouquet.name}
                  className="drop-shadow-sm"
                  style={{ width: size * 0.82, height: size * 0.95 }}
                />
                <span className="mt-0.5 max-w-[90px] truncate text-[11px] font-medium text-[var(--color-ink)]">
                  {occupantBouquet.name}
                </span>
              </div>
            );
          }

          return (
            <div
              key={slot.id}
              style={{
                left: `${slot.xPct}%`,
                top: `${slot.yPct}%`,
                width: size * 0.62,
                height: size * 0.62,
                transform: "translate(-50%, -50%)",
              }}
              className={`pointer-events-none absolute rounded-full border-2 border-dashed transition-colors ${
                isHovered
                  ? "border-[var(--color-rose)] bg-[var(--color-rose)]/20"
                  : "border-[var(--color-primary-strong)] bg-white/40"
              }`}
            />
          );
        })}
      </div>

      {ghostPos && (
        <div
          className="pointer-events-none fixed z-[80]"
          style={{
            left: ghostPos.x,
            top: ghostPos.y,
            width: 78,
            height: 90,
            transform: "translate(-50%, -50%) scale(1.08)",
          }}
        >
          <BouquetFrame
            imageUrl={targetBouquet.imageUrl}
            frameStyle={targetBouquet.frameStyle}
            alt=""
            className="h-full w-full drop-shadow-[0_0_16px_var(--color-rose)]"
          />
        </div>
      )}
    </div>
  );
}
