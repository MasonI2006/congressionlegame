'use client';
import React from 'react';

export default function StockCard({ 
  value, 
  tradesCount, 
  tickerHoldingCount, 
  currentNetWorth 
}: { 
  value: number, 
  tradesCount?: number, 
  tickerHoldingCount?: number, 
  currentNetWorth?: number 
}) {
  return (
    <div className="card centered" style={{ minWidth: 240, minHeight: 120, padding: '24px 0' }}>
      <h3 className="title" style={{ fontSize: '1.2em', marginBottom: 8 }}>Stock Trading Volume</h3>
      <div style={{ fontSize: '2em', fontWeight: 700, color: '#a3e635', marginBottom: 4 }}>
        ${value.toLocaleString()}
      </div>
      {tradesCount !== undefined && tradesCount > 0 && (
        <>
          <h3 className="title" style={{ fontSize: '1.2em', marginBottom: 8, marginTop: 16 }}>Number of Trades</h3>
          <div style={{ fontSize: '2em', fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>
            {tradesCount.toLocaleString()}
          </div>
        </>
      )}
      {tickerHoldingCount !== undefined && tickerHoldingCount > 0 && (
        <>
          <h3 className="title" style={{ fontSize: '1.2em', marginBottom: 8, marginTop: 16 }}>Ticker Holdings</h3>
          <div style={{ fontSize: '2em', fontWeight: 700, color: '#3b82f6', marginBottom: 4 }}>
            {tickerHoldingCount.toLocaleString()}
          </div>
        </>
      )}
      {currentNetWorth !== undefined && currentNetWorth > 0 && (
        <>
          <h3 className="title" style={{ fontSize: '1.2em', marginBottom: 8, marginTop: 16 }}>Current Net Worth</h3>
          <div style={{ fontSize: '2em', fontWeight: 700, color: '#f59e0b', marginBottom: 4 }}>
            ${currentNetWorth.toLocaleString()}
          </div>
        </>
      )}
    </div>
  );
} 