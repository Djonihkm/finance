interface SpinnerProps {
  size?: number;
  color?: string;
}

export function Spinner({ size = 48, color = "#11355b" }: SpinnerProps) {
  const strokeWidth = size * 0.1;
  const r = (size - strokeWidth * 2) / 2;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (circumference / 4) * 0.48;
  const gap = (circumference / 4) * 0.52;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ animation: "spin 0.75s linear infinite" }}
    >
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${gap}`}
      />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}
