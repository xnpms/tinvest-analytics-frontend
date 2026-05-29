'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { useLingui } from '@lingui/react';
import type {
  DividendCalendarProps,
  DividendHistoryItem,
  DividendTab,
  HistoryRowProps,
  TabButtonProps,
  UpcomingDividend,
  UpcomingRowProps,
} from './DividendCalendar.types';

const OPERATION_TYPE_COUPON = 8;

const formatValue = (value: number): string =>
  `${Math.round(value).toLocaleString('ru-RU')} ₽`;

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
};

const TabButton: FC<TabButtonProps> = ({ tabKey, label, isActive, onSelect }) => {
  const handleClick = () => onSelect(tabKey);
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
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
};

const UpcomingRow: FC<UpcomingRowProps> = ({ item }) => {
  const isConfirmed = item.isConfirmed;
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 12px',
      borderRadius: 11,
      background: 'rgba(255,255,255,0.04)',
      gap: 8,
    }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--color-text-light)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {item.name}
          </span>

          <span style={{
            fontSize: 10,
            fontWeight: 600,
            padding: '1px 6px',
            borderRadius: 4,
            background: isConfirmed ? 'rgba(76,217,160,0.15)' : 'rgba(249,200,70,0.15)',
            color: isConfirmed ? '#4cd9a0' : '#f9c846',
            flexShrink: 0,
          }}>
            {isConfirmed ? '✓' : '~'}
          </span>
        </div>

        <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
          {item.ticker} · закрытие реестра {formatDate(item.recordDate)}
          {item.paymentDate !== null && ` · выплата ${formatDate(item.paymentDate)}`}
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {item.amountRub !== null && (
          <div style={{ fontSize: 13, fontWeight: 800, color: '#4cd9a0', WebkitTextStroke: '0.3px currentColor' }}>
            {formatValue(item.amountRub)}
          </div>
        )}
        <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
          {item.amountPerShare.toFixed(4)} {item.currency.toUpperCase()}
        </div>
      </div>
    </div>
  );
};

const HistoryRow: FC<HistoryRowProps> = ({ item }) => {
  const isCoupon = item.operationType === OPERATION_TYPE_COUPON;
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 12px',
      borderRadius: 11,
      background: 'rgba(255,255,255,0.04)',
      gap: 8,
    }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--color-text-light)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {item.name || item.ticker}
          </span>

          <span style={{
            fontSize: 10,
            fontWeight: 600,
            padding: '1px 6px',
            borderRadius: 4,
            background: isCoupon ? 'rgba(96,165,250,0.15)' : 'rgba(184,245,101,0.15)',
            color: isCoupon ? '#60a5fa' : '#b8f565',
            flexShrink: 0,
          }}>
            {isCoupon ? 'купон' : 'дивиденд'}
          </span>
        </div>

        <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
          {item.ticker} · {formatDate(item.date)}
        </div>
      </div>

      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-text-light)', flexShrink: 0, WebkitTextStroke: '0.3px currentColor' }}>
        {formatValue(item.paymentRub)}
      </div>
    </div>
  );
};

export const DividendCalendar: FC<DividendCalendarProps> = ({ data }) => {
  const { i18n } = useLingui();
  const [tab, setTab] = useState<DividendTab>('upcoming');

  const handleTabSelect = (key: DividendTab) => setTab(key);

  const hasUpcoming = data.upcoming.length > 0;
  const hasHistory  = data.history.length > 0;

  const upcomingItems: UpcomingDividend[] = data.upcoming;
  const historyItems: DividendHistoryItem[] = data.history;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-light)', letterSpacing: '-0.2px' }}>
          {i18n._('dividends_title')}
        </p>

        <span style={{
          fontSize: 13,
          fontWeight: 800,
          color: '#4cd9a0',
          WebkitTextStroke: '0.3px currentColor',
        }}>
          {formatValue(data.totalRub)}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4 }}>
        <TabButton
          tabKey="upcoming"
          label={i18n._('dividends_tab_upcoming')}
          isActive={tab === 'upcoming'}
          onSelect={handleTabSelect}
        />

        <TabButton
          tabKey="history"
          label={i18n._('dividends_tab_history')}
          isActive={tab === 'history'}
          onSelect={handleTabSelect}
        />
      </div>

      {tab === 'upcoming' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 400, overflowY: 'auto' }}>
          {hasUpcoming
            ? upcomingItems.map((item) => (
              <UpcomingRow key={`${item.ticker}-${item.recordDate}`} item={item} />
            ))
            : (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13, padding: '24px 0' }}>
                {i18n._('dividends_none_upcoming')}
              </p>
            )
          }
        </div>
      )}

      {tab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 400, overflowY: 'auto' }}>
          {hasHistory
            ? historyItems.map((item) => (
              <HistoryRow key={`${item.ticker}-${item.date}`} item={item} />
            ))
            : (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13, padding: '24px 0' }}>
                {i18n._('dividends_none_history')}
              </p>
            )
          }
        </div>
      )}
    </div>
  );
};