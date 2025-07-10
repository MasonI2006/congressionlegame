'use client';
import React from 'react';

const COLORS = ['#8B5CF6', '#EC4899', '#F97316', '#06B6D4', '#84CC16'];

export default function PieChartTopContributors({ data }: { data: { name: string; share: number; amount: number }[] }) {
  if (!data || data === 'none' || data.length === 0) {
    return (
      <div className="card centered" style={{ margin: '0 64px', minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h3 className="title" style={{ fontSize: '1.3em' }}>No data available for top contributors</h3>
      </div>
    );
  }

  const totalFunds = 1200000; // This should come from the puzzle data or be passed as a prop

  const chartData = data.map((item, index) => ({
    name: item.name,
    value: item.share,
    color: COLORS[index % COLORS.length],
    amount: item.amount
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;
  const radius = 140;
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

  const getLabelPosition = (startAngle: number, endAngle: number) => {
    const midAngle = (startAngle + endAngle) / 2;
    const labelRadius = radius * 0.65;
    const x = centerX + labelRadius * Math.cos(midAngle);
    const y = centerY + labelRadius * Math.sin(midAngle);
    return { x, y, midAngle };
  };

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
      <h3 className="title" style={{ fontSize: '1.3em', marginBottom: '1em' }}>Top Contributors</h3>
      <svg width="420" height="420" viewBox="0 0 420 420" style={{ overflow: 'visible' }}>
        {chartData.map((item, index) => {
          if (item.value < 0.01) return null; // Omit labels for <1%
          const startAngle = currentAngle;
          const endAngle = currentAngle + (item.value / total) * 2 * Math.PI;
          const angle = endAngle - startAngle;
          const labelInside = angle >= 0.5;
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
    </div>
  );
} 