'use client';

import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { useLingui } from '@lingui/react';
import type { Instrument } from '@/lib/portfolio.types';
import type { FilterMode, SortDirection, SortField, InstrumentsTableProps } from './InstrumentsTable.types';

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const formatPnl = (value: number | null): string => {
  if (value === null) {
    return '—';
  }
  const str = formatCurrency(Math.abs(value));
  if (value > 0) {
    return `+${str}`;
  }
  return str;
};

const formatPercent = (value: number | null): string => {
  if (value === null) {
    return '—';
  }
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

const pnlColor = (value: number | null): string => {
  if (value === null || value === 0) {
    return 'text-text-muted';
  }
  return value > 0 ? 'text-emerald-400' : 'text-error';
};

const INSTRUMENT_TYPE_KEYS: Record<string, string> = {
  share: 'instrument_type_share',
  bond: 'instrument_type_bond',
  etf: 'instrument_type_etf',
  futures: 'instrument_type_futures',
  currency: 'instrument_type_currency',
  option: 'instrument_type_option',
};

const getSortValue = (instrument: Instrument, field: SortField): number | null => {
  switch (field) {
    case 'realizedPnlRub':
      return instrument.realizedPnlRub;
    case 'unrealizedPnlRub':
      return instrument.unrealizedPnlRub;
    case 'totalPnlRub':
      return instrument.totalPnlRub;
    case 'totalPnlPercent':
      return instrument.totalPnlPercent;
    case 'annualizedPnlPercent':
      return instrument.annualizedPnlPercent;
    case 'todayPnlRub':
      return instrument.todayPnlRub;
  }
};

interface SortIconProps {
  direction: SortDirection;
  isActive: boolean;
}

const SortIcon: FC<SortIconProps> = ({ direction, isActive }) => {
  if (!isActive) {
    return <span className='ml-1 text-xs opacity-25'>↕</span>;
  }
  return <span className='ml-1 text-xs'>{direction === 'asc' ? '↑' : '↓'}</span>;
};

export const InstrumentsTable: FC<InstrumentsTableProps> = (props) => {
  const { instruments } = props;
  const { i18n } = useLingui();
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const filtered = useMemo(() => {
    const list = filterMode === 'open'
      ? instruments.filter((instrument) => instrument.isOpen)
      : instruments;

    return [...list].sort((a, b) => {
      if (sortField !== null) {
        const nullFallback = sortDirection === 'desc' ? -Infinity : Infinity;
        const aVal = getSortValue(a, sortField) ?? nullFallback;
        const bVal = getSortValue(b, sortField) ?? nullFallback;
        return sortDirection === 'desc' ? bVal - aVal : aVal - bVal;
      }
      // дефолтная сортировка: открытые позиции сначала, потом по абсолютному P&L
      if (a.isOpen !== b.isOpen) {
        return a.isOpen ? -1 : 1;
      }
      return Math.abs(b.totalPnlRub) - Math.abs(a.totalPnlRub);
    });
  }, [instruments, filterMode, sortField, sortDirection]);

  const handleShowAll = () => {
    setFilterMode('all');
  };

  const handleShowOpen = () => {
    setFilterMode('open');
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSortRealizedPnlRub = () => {
    handleSort('realizedPnlRub');
  };

  const handleSortUnrealizedPnlRub = () => {
    handleSort('unrealizedPnlRub');
  };

  const handleSortTotalPnlRub = () => {
    handleSort('totalPnlRub');
  };

  const handleSortTotalPnlPercent = () => {
    handleSort('totalPnlPercent');
  };

  const handleSortAnnualizedPnlPercent = () => {
    handleSort('annualizedPnlPercent');
  };

  const handleSortTodayPnlRub = () => {
    handleSort('todayPnlRub');
  };

  return (
    <div className='flex h-full flex-col gap-4'>
      <div className='flex items-center gap-2'>
        <button
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            filterMode === 'all'
              ? 'bg-primary text-white'
              : 'text-text-muted hover:text-text-light'
          }`}
          onClick={handleShowAll}
        >
          {i18n._('filter_all')}
        </button>

        <button
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            filterMode === 'open'
              ? 'bg-primary text-white'
              : 'text-text-muted hover:text-text-light'
          }`}
          onClick={handleShowOpen}
        >
          {i18n._('filter_open')}
        </button>
      </div>

      <div className='min-h-0 flex-1 overflow-auto rounded-xl bg-card-dark'>
        <table className='w-full text-sm'>
          <thead>
            <tr>
              <th className='sticky top-0 z-10 border-b border-white/5 bg-card-dark px-4 py-3 text-left text-xs font-medium text-text-muted'>
                {i18n._('col_ticker')}
              </th>

              <th className='sticky top-0 z-10 border-b border-white/5 bg-card-dark px-4 py-3 text-left text-xs font-medium text-text-muted'>
                {i18n._('col_status')}
              </th>

              <th className='sticky top-0 z-10 border-b border-white/5 bg-card-dark px-4 py-3 text-right text-xs font-medium text-text-muted'>
                {i18n._('col_qty')}
              </th>

              <th className='sticky top-0 z-10 border-b border-white/5 bg-card-dark px-4 py-3 text-right text-xs font-medium text-text-muted'>
                {i18n._('col_avg_price')}
              </th>

              <th className='sticky top-0 z-10 border-b border-white/5 bg-card-dark px-4 py-3 text-right text-xs font-medium text-text-muted'>
                {i18n._('col_current_price')}
              </th>

              <th
                className={`sticky top-0 z-10 cursor-pointer select-none border-b border-white/5 bg-card-dark px-4 py-3 text-right text-xs font-medium transition-colors hover:text-text-light ${sortField === 'realizedPnlRub' ? 'text-text-light' : 'text-text-muted'}`}
                onClick={handleSortRealizedPnlRub}
              >
                {i18n._('col_realized_pnl')}
                <SortIcon direction={sortDirection} isActive={sortField === 'realizedPnlRub'} />
              </th>

              <th
                className={`sticky top-0 z-10 cursor-pointer select-none border-b border-white/5 bg-card-dark px-4 py-3 text-right text-xs font-medium transition-colors hover:text-text-light ${sortField === 'unrealizedPnlRub' ? 'text-text-light' : 'text-text-muted'}`}
                onClick={handleSortUnrealizedPnlRub}
              >
                {i18n._('col_unrealized_pnl')}
                <SortIcon direction={sortDirection} isActive={sortField === 'unrealizedPnlRub'} />
              </th>

              <th
                className={`sticky top-0 z-10 cursor-pointer select-none border-b border-white/5 bg-card-dark px-4 py-3 text-right text-xs font-medium transition-colors hover:text-text-light ${sortField === 'totalPnlRub' ? 'text-text-light' : 'text-text-muted'}`}
                onClick={handleSortTotalPnlRub}
              >
                {i18n._('col_total_pnl')}
                <SortIcon direction={sortDirection} isActive={sortField === 'totalPnlRub'} />
              </th>

              <th
                className={`sticky top-0 z-10 cursor-pointer select-none border-b border-white/5 bg-card-dark px-4 py-3 text-right text-xs font-medium transition-colors hover:text-text-light ${sortField === 'totalPnlPercent' ? 'text-text-light' : 'text-text-muted'}`}
                onClick={handleSortTotalPnlPercent}
              >
                {i18n._('col_pnl_percent')}
                <SortIcon direction={sortDirection} isActive={sortField === 'totalPnlPercent'} />
              </th>

              <th
                className={`sticky top-0 z-10 cursor-pointer select-none border-b border-white/5 bg-card-dark px-4 py-3 text-right text-xs font-medium transition-colors hover:text-text-light ${sortField === 'annualizedPnlPercent' ? 'text-text-light' : 'text-text-muted'}`}
                onClick={handleSortAnnualizedPnlPercent}
              >
                {i18n._('col_annualized_pnl')}
                <SortIcon direction={sortDirection} isActive={sortField === 'annualizedPnlPercent'} />
              </th>

              <th
                className={`sticky top-0 z-10 cursor-pointer select-none border-b border-white/5 bg-card-dark px-4 py-3 text-right text-xs font-medium transition-colors hover:text-text-light ${sortField === 'todayPnlRub' ? 'text-text-light' : 'text-text-muted'}`}
                onClick={handleSortTodayPnlRub}
              >
                {i18n._('col_today_pnl')}
                <SortIcon direction={sortDirection} isActive={sortField === 'todayPnlRub'} />
              </th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((instrument) => (
              <InstrumentRow key={instrument.figi ?? instrument.ticker} instrument={instrument} />
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className='py-12 text-center text-sm text-text-muted'>
            {i18n._('instruments_empty')}
          </div>
        )}
      </div>
    </div>
  );
};

interface InstrumentRowProps {
  instrument: Instrument;
}

const InstrumentRow: FC<InstrumentRowProps> = ({ instrument }) => {
  const { i18n } = useLingui();
  const {
    ticker,
    name,
    instrumentType,
    isOpen,
    quantity,
    avgPriceRub,
    currentPriceRub,
    realizedPnlRub,
    realizedPnlPercent,
    unrealizedPnlRub,
    totalPnlRub,
    totalPnlPercent,
    annualizedPnlPercent,
    todayPnlRub,
  } = instrument;

  const displayName = name && name !== ticker ? name : ticker;
  const displayTicker = name && name !== ticker ? ticker : null;
  const typeKey = instrumentType ? INSTRUMENT_TYPE_KEYS[instrumentType] : null;
  const typeLabel = typeKey ? i18n._(typeKey) : instrumentType;

  return (
    <tr className='border-b border-white/5 transition-colors last:border-0 hover:bg-white/5'>
      <td className='px-4 py-3'>
        <div className='max-w-40 truncate font-medium text-text-light'>{displayName}</div>

        {displayTicker && (
          <div className='max-w-40 truncate text-xs text-text-muted'>{displayTicker}</div>
        )}

        {typeLabel && (
          <div className='truncate text-xs text-text-muted opacity-60'>{typeLabel}</div>
        )}
      </td>

      <td className='px-4 py-3'>
        {isOpen ? (
          <span className='inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400'>
            <span className='h-1.5 w-1.5 rounded-full bg-emerald-400' />
            {i18n._('position_open')}
          </span>
        ) : (
          <span className='inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-xs font-medium text-text-muted'>
            <span className='h-1.5 w-1.5 rounded-full bg-text-muted' />
            {i18n._('position_closed')}
          </span>
        )}
      </td>

      <td className='px-4 py-3 text-right text-text-light'>
        {isOpen ? quantity : '—'}
      </td>

      <td className='px-4 py-3 text-right text-text-light'>
        {isOpen && avgPriceRub > 0 ? formatCurrency(avgPriceRub) : '—'}
      </td>

      <td className='px-4 py-3 text-right text-text-light'>
        {currentPriceRub !== null ? formatCurrency(currentPriceRub) : '—'}
      </td>

      <td className={`px-4 py-3 text-right ${pnlColor(realizedPnlRub)}`}>
        <div>{formatPnl(realizedPnlRub)}</div>

        {realizedPnlPercent !== 0 && (
          <div className='text-xs opacity-70'>{formatPercent(realizedPnlPercent)}</div>
        )}
      </td>

      <td className={`px-4 py-3 text-right ${pnlColor(isOpen ? unrealizedPnlRub : null)}`}>
        {isOpen ? formatPnl(unrealizedPnlRub) : '—'}
      </td>

      <td className={`px-4 py-3 text-right font-medium ${pnlColor(totalPnlRub)}`}>
        <div>{formatPnl(totalPnlRub)}</div>

        <div className='text-xs font-normal opacity-70'>{formatPercent(totalPnlPercent)}</div>
      </td>

      <td className={`px-4 py-3 text-right ${pnlColor(totalPnlPercent)}`}>
        {formatPercent(totalPnlPercent)}
      </td>

      <td className={`px-4 py-3 text-right ${pnlColor(annualizedPnlPercent)}`}>
        {formatPercent(annualizedPnlPercent)}
      </td>

      <td className={`px-4 py-3 text-right ${pnlColor(todayPnlRub)}`}>
        {todayPnlRub !== null ? formatPnl(todayPnlRub) : '—'}
      </td>
    </tr>
  );
};