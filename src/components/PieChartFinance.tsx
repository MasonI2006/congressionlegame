'use client';
import React from 'react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];

export default function PieChartFinance({ data }: { data: { large: { pct: number; amount: number }; small: { pct: number; amount: number }; pac: { pct: number; amount: number }; other: { pct: number; amount: number }; self: { pct: number; amount: number } } }) {
  // Handle no data
  if (!data || Object.values(data).every((v: any) => v.pct === 0 && v.amount === 0)) {
    return (
      <div className="card centered" style={{ margin: '0 64px', minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h3 className="title" style={{ fontSize: '1.3em' }}>No data available for campaign finance mix</h3>
      </div>
    );
  }

  // Calculate total campaign funds (using stock value as proxy for total funds)
  const totalFunds =
    data.large.amount +
    data.small.amount +
    data.pac.amount +
    data.other.amount +
    data.self.amount;
  
  const chartData = [
    {
      name: 'Large Donors',
      value: data.large.pct,
      color: COLORS[0],
      amount: data.large.amount
    },
    {
      name: 'Small Donors',
      value: data.small.pct,
      color: COLORS[1],
      amount: data.small.amount
    },
    {
      name: 'PAC Money',
      value: data.pac.pct,
      color: COLORS[2],
      amount: data.pac.amount
    },
    {
      name: 'Other',
      value: data.other.pct,
      color: COLORS[3],
      amount: data.other.amount
    },
    {
      name: 'Self-Financing',
      value: data.self.pct,
      color: COLORS[4],
      amount: data.self.amount
    },
  ];

  // Calculate SVG pie chart - much bigger now
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;
  const radius = 140; // Smaller pie
  const centerX = 210;
  const centerY = 210;

  const createArc = (startAngle: number, endAngle: number) => {
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    
    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
    
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  // Calculate label position for each section
  const getLabelPosition = (startAngle: number, endAngle: number) => {
    const midAngle = (startAngle + endAngle) / 2;
    const labelRadius = radius * 0.65; // Position labels at 65% of pie radius
    const x = centerX + labelRadius * Math.cos(midAngle);
    const y = centerY + labelRadius * Math.sin(midAngle);
    return { x, y, midAngle };
  };

  // Format dollar amount
  const formatDollars = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    } else {
      return `$${amount.toFixed(0)}`;
    }
  };

  return (
    <div className="card centered" style={{ margin: '0 64px' }}>
      <h3 className="title" style={{ fontSize: '1.3em', marginBottom: '1em' }}>Campaign Finance Mix</h3>
      <svg width="420" height="420" viewBox="0 0 420 420" style={{ overflow: 'visible' }}>
        {chartData.map((item, index) => {
          if (item.value < 0.01) return null; // Omit labels for <1%
          const startAngle = currentAngle;
          const endAngle = currentAngle + (item.value / total) * 2 * Math.PI;
          const angle = endAngle - startAngle;
          const labelInside = angle >= 0.5; // If angle is large enough, label inside
          const labelRadius = labelInside ? radius * 0.65 : radius * 1.08;
          const midAngle = (startAngle + endAngle) / 2;
          const x = centerX + labelRadius * Math.cos(midAngle);
          const y = centerY + labelRadius * Math.sin(midAngle);
          currentAngle = endAngle;
          return (
            <g key={index}>
              <path
                d={createArc(startAngle, endAngle)}
                fill={item.color}
                className="pie-chart-section"
              />
              <text
                x={x}
                y={y - 8}
                className="pie-chart-label"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontWeight: 600, fontSize: labelInside ? '1em' : '0.95em' }}
              >
                {item.name}
              </text>
              <text
                x={x}
                y={y + 8}
                className="pie-chart-amount"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: labelInside ? '0.95em' : '0.9em' }}
              >
                {formatDollars(item.amount)}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{ textAlign: 'center', marginTop: 16, color: '#a1a1aa', fontSize: '1.15em', fontWeight: 500 }}>
        Total Raised: {formatDollars(totalFunds)}
      </div>
    </div>
  );
} 