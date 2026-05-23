'use client';

import type { FC, ChangeEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useLingui } from '@lingui/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  type ChartOptions,
  type ChartData,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getPortfolioHistory, type PortfolioHistoryPoint } from '@/lib/dashboard';
import { Spinner } from '@/components/icons';
import type { Period } from './PortfolioChart.types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const PERIODS: { key: Period; labelKey: string }[] = [
  { key: '1y', labelKey: 'period_1y' },
  { key: '9m', labelKey: 'period_9m' },
  { key: '6m', labelKey: 'period_6m' },
  { key: '3m', labelKey: 'period_3m' },
  { key: '1m', labelKey: 'period_1m' },
  { key: '1w', labelKey: 'period_1w' },
  { key: 'all', labelKey: 'period_all' },
];

const PERIOD_DAYS: Record<Exclude<Period, 'all'>, number> = {
  '1y': 365, '9m': 270, '6m': 180, '3m': 90, '1m': 30, '1w': 7,
};

// Ordered from largest coverage to smallest — used when searching for a cache entry to slice from
const PERIOD_ORDER: Period[] = ['all', '1y', '9m', '6m', '3m', '1m', '1w'];

const covers = (cached: Period, requested: Period): boolean => {
  if (cached === 'all') {
    return true;
  }

  if (requested === 'all') {
    return false;
  }

  return PERIOD_DAYS[cached] >= PERIOD_DAYS[requested];
};

const getFromDate = (period: Period): string | undefined => {
  if (period === 'all') {
    return undefined;
  }
  const d = new Date();
  d.setDate(d.getDate() - PERIOD_DAYS[period]);
  return d.toISOString().slice(0, 10);
};

const formatDateLabel = (dateStr: string, period: Period): string => {
  const d = new Date(dateStr);
  if (period === '1w' || period === '1m') {
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  }

  if (period === 'all') {
    return d.toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' });
  }

  return d.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
};

const formatRub = (value: number): string =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);

const formatCompact = (value: number): string => {
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M ₽`;
  }

  if (Math.abs(value) >= 1_000) {
    return `${Math.round(value / 1_000)}K ₽`;
  }

  return `${Math.round(value)} ₽`;
};

const chartOptions = (period: Period, yMin?: number): ChartOptions<'line'> => ({
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 2.5,
  layout: {
    padding: { top: 6, bottom: 10, left: 2, right: 2 },
  },
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(30, 30, 46, 0.95)',
      borderColor: 'rgba(124,111,234,0.2)',
      borderWidth: 1,
      padding: 10,
      titleColor: 'rgba(255,255,255,0.5)',
      titleFont: { size: 11 },
      bodyColor: '#ffffff',
      bodyFont: { size: 13, weight: 'bold' },
      callbacks: {
        title: (items) => items[0]?.label ?? '',
        label: (item) => formatRub(item.parsed.y ?? 0),
      },
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(0,0,0,0.05)' },
      ticks: {
        color: 'rgba(0,0,0,0.35)',
        font: { size: 10 },
        maxTicksLimit: period === '1w' ? 7 : 6,
        maxRotation: 0,
      },
      border: { display: false },
    },
    y: {
      position: 'right',
      min: yMin,
      grid: { color: 'rgba(0,0,0,0.05)' },
      ticks: {
        color: 'rgba(0,0,0,0.35)',
        font: { size: 10 },
        maxTicksLimit: 5,
        callback: (value) => formatCompact(Number(value)),
      },
      border: { display: false },
    },
  },
  elements: {
    point: {
      radius: 0,
      hoverRadius: 4,
      hoverBackgroundColor: '#7C6FEA',
      hoverBorderColor: '#ffffff',
      hoverBorderWidth: 2,
    },
    line: {
      tension: period === '1w' ? 0.6 : 0.4,
    },
  },
});

const normalizeValues = (points: PortfolioHistoryPoint[]): number[] => {
  let cumCashFlow = 0;
  return points.map((p) => {
    cumCashFlow += p.cashFlowRub;
    return p.totalValueRub - cumCashFlow;
  });
};

const buildChartData = (points: PortfolioHistoryPoint[], period: Period, excludeCashFlows: boolean): ChartData<'line'> => {
  const values = excludeCashFlows
    ? normalizeValues(points)
    : points.map((p) => p.totalValueRub);

  return {
    labels: points.map((p) => formatDateLabel(p.date, period)),
    datasets: [
      {
        data: values,
        borderColor: '#7C6FEA',
        borderWidth: 2,
        fill: true,
        segment: {
          borderColor: (ctx) =>
            (ctx.p0.parsed.y ?? 0) < 0 || (ctx.p1.parsed.y ?? 0) < 0 ? '#F26B6B' : '#7C6FEA',
        },
        backgroundColor: (ctx) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.height);
          gradient.addColorStop(0, 'rgba(124, 111, 234, 0.18)');
          gradient.addColorStop(1, 'rgba(124, 111, 234, 0)');
          return gradient;
        },
      },
    ],
  };
};

const computeYMin = (points: PortfolioHistoryPoint[], excludeCashFlows: boolean): number | undefined => {
  const vals = excludeCashFlows
    ? normalizeValues(points)
    : points.map((p) => p.totalValueRub);
  const min = vals.length > 0 ? Math.min(...vals) : 0;
  return min < 0 ? min * 1.15 : undefined;
};

interface PeriodButtonProps {
  periodKey: Period;
  label: string;
  isActive: boolean;
  onSelect: (key: Period) => void;
}

const PeriodButton: FC<PeriodButtonProps> = ({ periodKey, label, isActive, onSelect }) => {
  const handleClick = () => onSelect(periodKey);
  return (
    <button
      onClick={handleClick}
      className={`rounded px-2 py-1 text-xs transition-colors ${
        isActive ? 'bg-primary text-white' : 'text-text-muted hover:text-text-light'
      }`}
    >
      {label}
    </button>
  );
};

export const PortfolioChart: FC = () => {
  const { i18n } = useLingui();
  const [period, setPeriod] = useState<Period>('1y');
  const [points, setPoints] = useState<PortfolioHistoryPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [excludeCashFlows, setExcludeCashFlows] = useState(true);
  const cacheRef = useRef<Partial<Record<Period, PortfolioHistoryPoint[]>>>({});

  const handlePeriodSelect = (key: Period) => setPeriod(key);
  const handleExcludeCashFlowsChange = (e: ChangeEvent<HTMLInputElement>) => setExcludeCashFlows(e.target.checked);

  useEffect(() => {
    const cache = cacheRef.current;
    const from = getFromDate(period);

    if (cache[period] !== undefined) {
      setPoints(cache[period]!);
      setIsLoading(false);
      return;
    }

    const covering = PERIOD_ORDER.find(
      (p) => p !== period && cache[p] !== undefined && covers(p, period),
    );

    if (covering !== undefined) {
      const sliced = from ? cache[covering]!.filter((pt) => pt.date >= from) : cache[covering]!;
      cache[period] = sliced;
      setPoints(sliced);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const fetchData = async () => {
      try {
        const data = await getPortfolioHistory(from);
        cache[period] = data;
        setPoints(data);
      } catch {
        setPoints([]);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchData();
  }, [period]);

  return (
    <div>
      <div className='mb-4 flex items-center justify-between'>
        <p className='text-sm font-medium text-text-light'>{i18n._('value_history')}</p>
        <div className='flex gap-1'>
          {PERIODS.map(({ key, labelKey }) => (
            <PeriodButton
              key={key}
              periodKey={key}
              label={i18n._(labelKey)}
              isActive={period === key}
              onSelect={handlePeriodSelect}
            />
          ))}
        </div>
      </div>

      <label className='mb-3 flex cursor-pointer items-center gap-2 self-start'>
        <input
          type='checkbox'
          className='sr-only'
          checked={excludeCashFlows}
          onChange={handleExcludeCashFlowsChange}
        />
        <div className={`relative h-4 w-7 rounded-full transition-colors ${excludeCashFlows ? 'bg-primary' : 'bg-text-muted/30'}`}>
          <div className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform ${excludeCashFlows ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
        </div>
        <span className='text-xs text-text-muted'>
          {i18n._('account_for_cashflows')}
        </span>
      </label>

      {isLoading ? (
        <div className='flex h-40 items-center justify-center'>
          <Spinner className='h-5 w-5 text-primary' />
        </div>
      ) : points.length === 0 ? (
        <div className='flex h-40 items-center justify-center'>
          <p className='text-xs text-text-muted'>{i18n._('no_data_for_period')}</p>
        </div>
      ) : (
        <div className='relative w-full'>
          <Line
            data={buildChartData(points, period, excludeCashFlows)}
            options={chartOptions(period, computeYMin(points, excludeCashFlows))}
          />
        </div>
      )}
    </div>
  );
};
