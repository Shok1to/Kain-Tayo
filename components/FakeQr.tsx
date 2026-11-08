// A fake QR code. It looks real but scans to nothing.
// The pattern is made from the order code, so each order looks different.

function seededRandom(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SIZE = 25;

function inFinder(x: number, y: number) {
  const corners = [
    [0, 0],
    [SIZE - 7, 0],
    [0, SIZE - 7],
  ];
  return corners.some(
    ([cx, cy]) => x >= cx - 1 && x <= cx + 7 && y >= cy - 1 && y <= cy + 7,
  );
}

export default function FakeQr({ seed }: { seed: string }) {
  const rand = seededRandom(seed);
  const cells: React.ReactNode[] = [];

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (inFinder(x, y)) continue;
      if (rand() > 0.5) {
        cells.push(<rect key={`${x}_${y}`} x={x} y={y} width={1} height={1} />);
      }
    }
  }

  const finder = (cx: number, cy: number) => (
    <g key={`f${cx}_${cy}`}>
      <rect x={cx} y={cy} width={7} height={7} />
      <rect x={cx + 1} y={cy + 1} width={5} height={5} fill="white" />
      <rect x={cx + 2} y={cy + 2} width={3} height={3} />
    </g>
  );

  return (
    <svg
      viewBox={`-2 -2 ${SIZE + 4} ${SIZE + 4}`}
      className="h-56 w-56 rounded-xl bg-white"
      fill="#1c1917"
      shapeRendering="crispEdges"
      role="img"
      aria-label="Fake QR code for pickup"
    >
      <rect x={-2} y={-2} width={SIZE + 4} height={SIZE + 4} fill="white" />
      {cells}
      {finder(0, 0)}
      {finder(SIZE - 7, 0)}
      {finder(0, SIZE - 7)}
    </svg>
  );
}
