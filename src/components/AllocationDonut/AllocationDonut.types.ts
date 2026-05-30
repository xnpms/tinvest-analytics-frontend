import type { AllocationItem, AssetItem, AssetsAllocation } from '@/lib/dashboard.types';

export type { AllocationItem, AssetItem, AssetsAllocation };

export type AllocationView = 'type' | 'sector' | 'currency' | 'asset';

export interface AllocationDonutProps {
  allocation: AssetsAllocation;
}

export interface SegmentData {
  key: string;
  label: string;
  percent: number;
  valueRub: number;
  color: string;
  arcLen: number;
  offset: number;
}

export interface ViewTabProps {
  viewKey: AllocationView;
  label: string;
  isActive: boolean;
  onSelect: (key: AllocationView) => void;
}

export interface DonutArcProps {
  index: number;
  segment: SegmentData;
  hoveredIndex: number | null;
  onHoverEnter: (index: number) => void;
  onHoverLeave: () => void;
}

export interface LegendCardProps {
  segment: SegmentData;
  isActive: boolean;
  isDimmed: boolean;
  onHoverEnter: () => void;
  onHoverLeave: () => void;
}