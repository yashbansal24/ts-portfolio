import type { CSSProperties } from 'react';
import './MeshGradient.css';

/** One colour point of the mesh: position in % of the section, colour (6-digit hex), radius in % (default 55), hold = % of the radius kept solid (default 0). */
export type MeshPoint = { x: number; y: number; color: string; size?: number; hold?: number };
export type MeshPreset = 'hero' | 'slayb' | 'contact';

/** Palette-only presets. Text-safe zones are noted per preset (see UI_KIT.md). */
export const MESH_PRESETS: Record<MeshPreset, { base: string; points: MeshPoint[] }> = {
  // light: ivory / peach / periwinkle — deep-blue text anywhere is ≥ 9:1
  hero: {
    base: '#F7F1E5',
    points: [
      { x: 80, y: 18, color: '#FFD9CC', size: 52 },
      { x: 96, y: 82, color: '#C9D6FF', size: 50 },
      { x: 52, y: 60, color: '#FBEFE2', size: 40 },
      { x: 6, y: 92, color: '#FFE3D8', size: 42 },
      { x: 18, y: 8, color: '#E3E8FF', size: 38 },
      { x: 64, y: 98, color: '#FFD0C0', size: 30 },
    ],
  },
  // rich: coral + periwinkle + blue — put text on a paper/ink card, or keep it in the top-left (periwinkle/peach) zone
  slayb: {
    base: '#C9D6FF',
    points: [
      { x: 88, y: 12, color: '#FF6B4A', size: 48 },
      { x: 8, y: 92, color: '#2A44A0', size: 55 },
      { x: 12, y: 10, color: '#FFD9CC', size: 45 },
      { x: 62, y: 72, color: '#9FB2F2', size: 45 },
      { x: 98, y: 96, color: '#14286E', size: 40 },
      { x: 42, y: 30, color: '#E3E8FF', size: 35 },
    ],
  },
  // bold: coral → blue — ivory text in the lower/right blue zone, ink text in the coral top-left; use cards elsewhere
  contact: {
    base: '#14286E',
    points: [
      { x: 100, y: 20, color: '#2A44A0', size: 60, hold: 10 },
      { x: 20, y: 100, color: '#0E1B4D', size: 50 },
      { x: 0, y: 0, color: '#FF6B4A', size: 58, hold: 42 },
      { x: 30, y: 6, color: '#FF8C6E', size: 26, hold: 20 },
    ],
  },
};

function meshBackground(points: MeshPoint[], base: string) {
  const layers = points.map(({ x, y, color, size = 55, hold = 0 }) =>
    `radial-gradient(${size}% ${Math.round(size * 1.15)}% at ${x}% ${y}%, ${color} ${hold}%, ${color}00 100%)`);
  return `${layers.join(', ')}, ${base}`;
}

export type MeshGradientProps = { preset?: MeshPreset; points?: MeshPoint[]; base?: string; drift?: boolean; grain?: boolean; className?: string };

/** Section background: soft multi-point CSS mesh + printed grain. Place as first child of a `.section` (isolated); static under reduced motion. Colours must be 6-digit hex. */
export function MeshGradient({ preset = 'hero', points, base, drift = true, grain = true, className }: MeshGradientProps) {
  const p = MESH_PRESETS[preset];
  const style = { '--mesh-bg': meshBackground(points ?? p.points, base ?? p.base), backgroundColor: base ?? p.base } as CSSProperties;
  return (
    <div className={['mesh', `mesh--${preset}`, className].filter(Boolean).join(' ')} style={style} aria-hidden="true">
      <div className={`mesh__field${drift ? ' mesh__field--drift' : ''}`} />
      {grain && <div className="mesh__grain" />}
    </div>
  );
}
