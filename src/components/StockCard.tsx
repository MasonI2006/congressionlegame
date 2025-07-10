'use client';
import React from 'react';

export default function StockCard({ value, tradesCount }: { value: number, tradesCount?: number }) {
  return (
    <div className="card centered" style={{ minWidth: 240, minHeight: 120, padding: '24px 0' }}>
      <h3 className="title" style={{ fontSize: '1.2em', marginBottom: 8 }}>Stock Trading Volume</h3>
      <div style={{ fontSize: '2em', fontWeight: 700, color: '#a3e635', marginBottom: 4 }}>
        ${value.toLocaleString()}
      </div>
      {tradesCount !== undefined && tradesCount > 0 && (
        <>
          <h3 className="title" style={{ fontSize: '1.2em', marginBottom: 8 }}>Number of Trades</h3>
          <div style={{ fontSize: '2em', fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>
            {tradesCount.toLocaleString()}
          </div>
        </>
      )}
      <div style={{ color: '#a1a1aa', fontSize: '0.85em', marginTop: 8 }}>*Data from the past 3 years.</div>
    </div>
  );
} 