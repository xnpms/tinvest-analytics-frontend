'use client';

import type { FC } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLingui } from '@lingui/react';
import type {
  AllocationDonutProps,
  AllocationItem,
  AllocationView,
  AssetsAllocation,
  DonutArcProps,
  LegendCardProps,
  SegmentData,
  ViewTabProps,
} from './AllocationDonut.types';

// ── SVG-константы (из donut-2.html) ──────────────────────────────────────────
const CX = 120;
const CY = 120;
const R = 91;
const SW = 22;
const CIRC = 2 * Math.PI * R;
const GAP_PX = 3;
const MIN_ARC = GAP_PX * 2.5;
const SIZE = 240;

const PALETTE = [
  '#b8f565', '#7c6ff7', '#4cd9a0', '#f9c846',
  '#ff6b6b', '#60a5fa', '#f472b6', '#fb923c',
  '#a78bfa', '#34d399', '#fbbf24', '#f87171',
  '#38bdf8', '#c084fc', '#86efac', '#fdba74',
  '#fb7185', '#67e8f9', '#d8b4fe', '#6ee7b7',
  '#fde68a', '#fca5a5', '#93c5fd', '#c4b5fd',
  '#fcd34d', '#e879f9', '#4ade80', '#facc15',
  '#f9a8d4', '#a5b4fc', '#fde047', '#86efac',
];

const VIEWS: { key: AllocationView; labelKey: string; totalNameKey: string }[] = [
  { key: 'type',     labelKey: 'allocation_by_type',     totalNameKey: 'allocation_all_type' },
  { key: 'sector',   labelKey: 'allocation_by_sector',   totalNameKey: 'allocation_all_sector' },
  { key: 'currency', labelKey: 'allocation_by_currency', totalNameKey: 'allocation_all_currency' },
  { key: 'asset',    labelKey: 'allocation_by_asset',    totalNameKey: 'allocation_all_asset' },
];

const getItemsByView = (allocation: AssetsAllocation, view: AllocationView): AllocationItem[] => {
  switch (view) {
    case 'type':
      return allocation.byType;
    case 'sector':
      return allocation.bySector;
    case 'currency':
      return allocation.byCurrency;
    case 'asset':
      return allocation.items.map((item) => ({
        key: item.ticker,
        label: item.name,
        valueRub: item.valueRub,
        percent: item.percent,
      }));
  }
};

const getItemLabelKey = (view: AllocationView, key: string): string => {
  switch (view) {
    case 'type':
      return `instrument_type_${key}`;
    case 'currency':
      return `currency_${key}`;
    case 'sector':
      return `sector_${key}`;
    case 'asset':
      return key;
  }
};

// ── Точная SVG-математика из donut-2.html ────────────────────────────────────
const buildSegments = (items: AllocationItem[], labelFn: (key: string) => string): SegmentData[] => {
  if (items.length === 0) {
    return [];
  }

  const inputTotal = items.reduce((s, item) => s + item.percent, 0);
  const normed = items.map((item) => (inputTotal > 0 ? item.percent / inputTotal : 0));

  const totalGapArc = GAP_PX * items.length;
  const drawableCirc = CIRC - totalGapArc;

  let arcLens = normed.map((f) => Math.max(f * drawableCirc, MIN_ARC));

  const arcTotal = arcLens.reduce((s, a) => s + a, 0);
  if (arcTotal > drawableCirc) {
    const scale = drawableCirc / arcTotal;
    arcLens = arcLens.map((a) => a * scale);
  }

  let pos = 0;
  return items.map((item, i) => {
    const arcLen = arcLens[i] ?? 0;
    const offset = -pos;
    pos += arcLen + GAP_PX;
    return {
      key: item.key,
      label: item.label ?? labelFn(item.key),
      percent: item.percent,
      valueRub: item.valueRub,
      color: PALETTE[i % PALETTE.length],
      arcLen,
      offset,
    };
  });
};

const hexToRgb = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
};

const formatValue = (value: number): string =>
  `${Math.round(value).toLocaleString('ru-RU')} ₽`;

// ── Подкомпоненты ─────────────────────────────────────────────────────────────

const ViewTab: FC<ViewTabProps> = ({ viewKey, label, isActive, onSelect }) => {
  const handleClick = () => onSelect(viewKey);
  return (
    <button
      onClick={handleClick}
      style={{
        flex: 1,
        padding: '7px 0',
        borderRadius: 9,
        fontSize: 11,
        fontWeight: 600,
        cursor: 'pointer',
        color: isActive ? '#fff' : 'var(--color-text-muted)',
        border: 'none',
        background: isActive ? '#7c6ff7' : 'transparent',
        boxShadow: isActive ? '0 2px 10px rgba(124,111,247,0.45)' : 'none',
        transition: 'all 0.22s ease',
        letterSpacing: '-0.1px',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
};

const DonutArc: FC<DonutArcProps> = ({ index, segment, hoveredIndex, onHoverEnter, onHoverLeave }) => {
  const isHovered = hoveredIndex === index;
  const isDimmed = hoveredIndex !== null && hoveredIndex !== index;
  const handleMouseEnter = () => onHoverEnter(index);
  const handleMouseLeave = () => onHoverLeave();
  return (
    <g style={{ cursor: 'pointer' }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <circle
        cx={CX}
        cy={CY}
        r={R}
        fill="none"
        stroke={segment.color}
        strokeWidth={SW}
        strokeLinecap="butt"
        strokeDasharray={`${segment.arcLen} ${CIRC - segment.arcLen}`}
        strokeDashoffset={segment.offset}
        style={{
          transformOrigin: `${CX}px ${CY}px`,
          transform: isHovered ? 'scale(1.08)' : 'scale(1)',
          opacity: isDimmed ? 0.15 : 1,
          transition: 'transform 0.25s cubic-bezier(.34,1.56,.64,1), opacity 0.22s ease',
        }}
      />
    </g>
  );
};

const LegendCard: FC<LegendCardProps> = ({ segment, isActive, isDimmed, onHoverEnter, onHoverLeave }) => {
  const handleMouseEnter = () => onHoverEnter();
  const handleMouseLeave = () => onHoverLeave();
  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 13,
        padding: '11px 12px',
        cursor: 'pointer',
        border: `1.5px solid ${isActive ? segment.color : 'transparent'}`,
        boxShadow: isActive ? `0 0 18px -4px ${segment.color}` : 'none',
        transform: isActive ? 'translateY(-1px)' : 'none',
        opacity: isDimmed ? 0.3 : 1,
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.2s, background 0.2s, transform 0.2s, box-shadow 0.2s, opacity 0.2s',
      }}
    >
      {/* Цветной оверлей — аналог ::before из HTML */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: `rgba(${hexToRgb(segment.color)}, ${isActive ? 0.08 : 0})`,
          borderRadius: 13,
          transition: 'background 0.2s',
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
            background: segment.color,
            boxShadow: `0 0 6px ${segment.color}`,
            display: 'block',
          }} />

          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 500 }}>
            {segment.label}
          </span>
        </div>

        <span style={{ fontSize: 11, fontWeight: 700, color: segment.color, position: 'relative' }}>
          {segment.percent.toFixed(1)}%
        </span>
      </div>

      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text-light)', letterSpacing: '-0.3px', position: 'relative', WebkitTextStroke: '0.5px currentColor' }}>
        {formatValue(segment.valueRub)}
      </div>
    </div>
  );
};

// ── Основной компонент ────────────────────────────────────────────────────────

export const AllocationDonut: FC<AllocationDonutProps> = ({ allocation }) => {
  const { i18n } = useLingui();
  const [view, setView] = useState<AllocationView>('type');
  const [activeTab, setActiveTab] = useState<AllocationView>('type');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentViewMeta = VIEWS.find((v) => v.key === view) ?? VIEWS[0];

  const segments = useMemo(() => {
    const items = getItemsByView(allocation, view);
    return buildSegments(items, (key) => i18n._(getItemLabelKey(view, key)));
  }, [allocation, view, i18n]);

  const handleViewSelect = (key: AllocationView) => {
    if (key === activeTab) {
      return;
    }
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }
    setActiveTab(key);
    setIsTransitioning(true);
    setHoveredIndex(null);
    timerRef.current = setTimeout(() => {
      setView(key);
      setIsTransitioning(false);
      timerRef.current = null;
    }, 220);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleSegmentEnter = (index: number) => setHoveredIndex(index);
  const handleSegmentLeave = () => setHoveredIndex(null);

  const hoveredSeg = hoveredIndex !== null ? (segments[hoveredIndex] ?? null) : null;
  const centerPct  = hoveredSeg !== null ? `${hoveredSeg.percent.toFixed(1)}%` : '100%';
  const centerVal  = hoveredSeg !== null ? formatValue(hoveredSeg.valueRub) : formatValue(allocation.totalValueRub);
  const centerName = hoveredSeg !== null ? hoveredSeg.label : i18n._(currentViewMeta.totalNameKey);

  return (
    <div>
      {/* Заголовок */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-light)', letterSpacing: '-0.2px' }}>
          {i18n._('allocation_title')}
        </p>

        <div style={{
          width: 28, height: 28, borderRadius: 8, cursor: 'pointer',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2,
        }}>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--color-text-muted)', display: 'block' }} />
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--color-text-muted)', display: 'block' }} />
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--color-text-muted)', display: 'block' }} />
        </div>
      </div>

      {/* Вкладки */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4 }}>
        {VIEWS.map(({ key, labelKey }) => (
          <ViewTab
            key={key}
            viewKey={key}
            label={i18n._(labelKey)}
            isActive={activeTab === key}
            onSelect={handleViewSelect}
          />
        ))}
      </div>

      {/* Бублик + легенда с анимацией смены вкладки */}
      <div
        style={{
          opacity: isTransitioning ? 0 : 1,
          transform: isTransitioning ? 'scale(0.97)' : 'scale(1)',
          transition: 'opacity 0.22s ease, transform 0.22s ease',
        }}
      >
        {/* SVG-бублик */}
        <div style={{ position: 'relative', width: SIZE, height: SIZE, margin: '0 auto 22px' }}>
          <svg
            width={SIZE}
            height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            style={{ display: 'block', transform: 'rotate(-90deg)', overflow: 'visible' }}
          >
            {segments.map((segment, i) => (
              <DonutArc
                key={segment.key}
                index={i}
                segment={segment}
                hoveredIndex={hoveredIndex}
                onHoverEnter={handleSegmentEnter}
                onHoverLeave={handleSegmentLeave}
              />
            ))}
          </svg>

          {/* Центральный текст */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center', pointerEvents: 'none', width: 110,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', transition: 'all 0.2s' }}>
              {centerPct}
            </div>

            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text-light)', lineHeight: 1.1, letterSpacing: -1, transition: 'all 0.2s', WebkitTextStroke: '0.5px currentColor' }}>
              {centerVal}
            </div>

            <div style={{
              fontSize: 10, fontWeight: 500, color: 'var(--color-text-muted)', marginTop: 3,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              transition: 'all 0.2s',
            }}>
              {centerName}
            </div>
          </div>
        </div>

        {/* Легенда со скроллом */}
        <div
          className="donut-legend"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
            maxHeight: 280,
            overflowY: 'auto',
            padding: '6px 2px 2px',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(124,111,247,0.3) transparent',
          }}
        >
          {segments.map((segment, i) => (
            <LegendCard
              key={segment.key}
              segment={segment}
              isActive={hoveredIndex === i}
              isDimmed={hoveredIndex !== null && hoveredIndex !== i}
              onHoverEnter={() => handleSegmentEnter(i)}
              onHoverLeave={handleSegmentLeave}
            />
          ))}
        </div>
      </div>
    </div>
  );
};