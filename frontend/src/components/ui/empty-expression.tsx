export type EmptyMood =
  | 'sad'
  | 'pouty'
  | 'confused'
  | 'calm'
  | 'curious'
  | 'pensive'
  | 'pleased'
  | 'quiet';

type Props = {
  mood?: EmptyMood;
  className?: string;
};

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.15,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/** Ink face in the same simple language as a character expression sheet. */
export function EmptyExpression({ mood = 'calm', className }: Props) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      aria-hidden
    >
      <rect x="8" y="8" width="104" height="104" rx="22" fill="#fff" stroke="currentColor" strokeWidth="2.4" />
      {mood === 'sad' ? <Sad /> : null}
      {mood === 'pouty' ? <Pouty /> : null}
      {mood === 'confused' ? <Confused /> : null}
      {mood === 'calm' ? <Calm /> : null}
      {mood === 'curious' ? <Curious /> : null}
      {mood === 'pensive' ? <Pensive /> : null}
      {mood === 'pleased' ? <Pleased /> : null}
      {mood === 'quiet' ? <Quiet /> : null}
    </svg>
  );
}

function Eyes({ y = 48, worried = false }: { y?: number; worried?: boolean }) {
  return (
    <>
      <ellipse cx="44" cy={y} rx="11" ry="13" {...stroke} />
      <ellipse cx="76" cy={y} rx="11" ry="13" {...stroke} />
      <circle cx="44" cy={y + 2} r="4.2" fill="currentColor" />
      <circle cx="76" cy={y + 2} r="4.2" fill="currentColor" />
      {worried ? (
        <>
          <path d="M32 34c6-6 14-6 18-1" {...stroke} />
          <path d="M70 33c4-5 12-5 18 1" {...stroke} />
        </>
      ) : null}
    </>
  );
}

function Sad() {
  return (
    <>
      <Eyes worried />
      <path d="M46 86c6-8 22-8 28 0" {...stroke} />
    </>
  );
}

function Pouty() {
  return (
    <>
      <Eyes y={50} />
      <path d="M58 84h10" {...stroke} />
      <path d="M54 90c4 5 12 5 16 0" {...stroke} />
    </>
  );
}

function Confused() {
  return (
    <>
      <Eyes y={50} />
      <path d="M34 36c8-7 16-4 16 2" {...stroke} />
      <ellipse cx="60" cy="86" rx="7" ry="8" {...stroke} />
    </>
  );
}

function Calm() {
  return (
    <>
      <Eyes />
      <path d="M48 84c6 8 18 8 24 0" {...stroke} />
    </>
  );
}

function Curious() {
  return (
    <>
      <ellipse cx="42" cy="48" rx="11" ry="13" {...stroke} />
      <ellipse cx="78" cy="46" rx="12" ry="15" {...stroke} />
      <circle cx="42" cy="50" r="4.2" fill="currentColor" />
      <circle cx="78" cy="48" r="4.2" fill="currentColor" />
      <path d="M66 28c6-8 16-6 16 2" {...stroke} />
      <ellipse cx="60" cy="86" rx="6" ry="8" {...stroke} />
    </>
  );
}

function Pensive() {
  return (
    <>
      <path d="M34 46c6 4 12 4 16-1" {...stroke} />
      <path d="M70 45c4 5 10 5 16-1" {...stroke} />
      <ellipse cx="44" cy="54" rx="10" ry="11" {...stroke} />
      <ellipse cx="76" cy="54" rx="10" ry="11" {...stroke} />
      <circle cx="45" cy="56" r="3.6" fill="currentColor" />
      <circle cx="77" cy="56" r="3.6" fill="currentColor" />
      <path d="M50 86c5 4 15 4 20-1" {...stroke} />
    </>
  );
}

function Pleased() {
  return (
    <>
      <path d="M33 42c7-6 14-6 18 0" {...stroke} />
      <path d="M69 42c7-6 14-6 18 0" {...stroke} />
      <Eyes y={52} />
      <path d="M46 82c7 9 21 9 28 0" {...stroke} />
    </>
  );
}

function Quiet() {
  return (
    <>
      <path d="M33 50c7 5 14 5 18 0" {...stroke} />
      <path d="M69 50c7 5 14 5 18 0" {...stroke} />
      <path d="M50 84h20" {...stroke} />
    </>
  );
}
