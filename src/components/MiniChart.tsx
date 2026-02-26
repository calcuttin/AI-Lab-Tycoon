interface MiniChartProps {
  data: number[];
  color: string;
  height?: number;
  label?: string;
}

export default function MiniChart({ data, color, height = 60, label }: MiniChartProps) {
  if (data.length < 2) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#64748b' }}>
        COLLECTING DATA...
      </div>
    );
  }

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const width = 200;
  const padding = 4;
  const chartHeight = height - padding * 2;
  const chartWidth = width - padding * 2;

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((val - min) / range) * chartHeight;
    return `${x},${y}`;
  });

  const polyline = points.join(' ');

  // Area fill path
  const areaPath = `M ${padding},${padding + chartHeight} ${points.map(p => `L ${p}`).join(' ')} L ${padding + chartWidth},${padding + chartHeight} Z`;

  const latest = data[data.length - 1];
  const prev = data[data.length - 2];
  const trend = latest > prev ? '+' : latest < prev ? '-' : '=';

  return (
    <div>
      {label && (
        <div style={{ fontSize: 7, color: '#94a3b8', marginBottom: 4, letterSpacing: 1 }}>
          {label}
          <span style={{ marginLeft: 8, color: trend === '+' ? '#22c55e' : trend === '-' ? '#ef4444' : '#94a3b8' }}>
            {trend === '+' ? '▲' : trend === '-' ? '▼' : '—'}
          </span>
        </div>
      )}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        style={{ borderRadius: 4, background: 'rgba(0,0,0,0.2)' }}
      >
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map(frac => (
          <line
            key={frac}
            x1={padding}
            y1={padding + chartHeight * frac}
            x2={padding + chartWidth}
            y2={padding + chartHeight * frac}
            stroke="#334155"
            strokeWidth={0.5}
            strokeDasharray="2,2"
          />
        ))}

        {/* Area fill */}
        <path d={areaPath} fill={`${color}15`} />

        {/* Line */}
        <polyline
          points={polyline}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Latest point dot */}
        {data.length > 0 && (
          <circle
            cx={padding + chartWidth}
            cy={padding + chartHeight - ((latest - min) / range) * chartHeight}
            r={3}
            fill={color}
            stroke="#0c1222"
            strokeWidth={1}
          />
        )}
      </svg>
    </div>
  );
}
