import React from 'react';

const SimpleLineChart = ({ data, lines, height = 240 }) => {
  if (!data || data.length === 0) return null;
  
  const width = 800; // SVG viewBox internal coordinate width
  const padX = 40;
  const padY = 20;
  
  const maxX = Math.max(data.length - 1, 1);
  
  let maxWPM = 50;
  data.forEach(d => {
    lines.forEach(l => {
      if (d[l.key] > maxWPM) maxWPM = d[l.key];
    });
  });
  
  // Round up to nearest 20 for cleaner grid lines
  maxWPM = Math.ceil(maxWPM / 20) * 20;
  
  const getX = (index) => padX + (index / maxX) * (width - padX - 10);
  const getY = (val) => (height - padY) - ((val || 0) / maxWPM) * (height - padY * 2);
  
  // For the x-axis grid
  const xTicks = [];
  const tickCount = Math.min(maxX, 10); // Show max 10 ticks
  for (let i = 0; i <= tickCount; i++) {
    const dataIndex = Math.floor((i / tickCount) * maxX);
    xTicks.push(dataIndex);
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full font-mono text-xs select-none">
      {/* Grid horizontal lines */}
      <line x1={padX} y1={padY} x2={width-10} y2={padY} stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
      <text x={padX - 10} y={padY + 4} fill="#64748b" textAnchor="end">{maxWPM}</text>
      
      <line x1={padX} y1={height/2} x2={width-10} y2={height/2} stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
      <text x={padX - 10} y={height/2 + 4} fill="#64748b" textAnchor="end">{maxWPM/2}</text>
      
      <line x1={padX} y1={height-padY} x2={width-10} y2={height-padY} stroke="rgba(255,255,255,0.1)" />
      <text x={padX - 10} y={height-padY + 4} fill="#64748b" textAnchor="end">0</text>
      
      {/* Grid vertical ticks (X axis) */}
      {xTicks.map((tickIndex, i) => (
        <g key={i}>
          <line x1={getX(tickIndex)} y1={height-padY} x2={getX(tickIndex)} y2={height-padY+5} stroke="rgba(255,255,255,0.1)" />
          <text x={getX(tickIndex)} y={height-padY+16} fill="#64748b" textAnchor="middle">{tickIndex + 1}</text>
        </g>
      ))}

      {/* Axis Labels */}
      <text x={14} y={height/2} fill="#475569" transform={`rotate(-90 14 ${height/2})`} textAnchor="middle" letterSpacing="1">Words per Minute</text>
      <text x={width/2} y={height-2} fill="#475569" textAnchor="middle" letterSpacing="1">Time (seconds)</text>
      
      {/* Chart Lines */}
      {lines.map((lineDef, idx) => {
        const points = data.map((d, i) => `${getX(i)},${getY(d[lineDef.key])}`).join(' ');
        return (
          <polyline
            key={idx}
            points={points}
            fill="none"
            stroke={lineDef.color}
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0px 4px 6px ${lineDef.color}40)` }}
          />
        );
      })}
    </svg>
  );
};

export default SimpleLineChart;
