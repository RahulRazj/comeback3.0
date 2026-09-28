'use client';

import React from 'react';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string; // hex or rgb
  glowColor?: string;
  sublabel?: string;
  showPercent?: boolean;
}

export function ProgressRing({
  percentage,
  size = 120,
  strokeWidth = 10,
  color = '#10b981',
  glowColor,
  sublabel,
  showPercent = true,
}: ProgressRingProps) {
  const safePercent = Math.min(Math.max(percentage, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safePercent / 100) * circumference;

  const glowStyle = glowColor
    ? { filter: `drop-shadow(0 0 8px ${glowColor})` }
    : undefined;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Active progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="progress-ring-circle"
          style={glowStyle}
        />
      </svg>
      {/* Centered label */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        {showPercent && (
          <span className="text-xl font-bold tracking-tight text-white font-mono">
            {Math.round(safePercent)}%
          </span>
        )}
        {sublabel && (
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mt-0.5">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
