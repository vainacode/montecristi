'use client';

import { useEffect, useState } from 'react';

interface AnalogClockProps {
  className?: string;
  /** IANA timezone, e.g. "America/Santo_Domingo" */
  timezone?: string;
  label?: string;
}

export function AnalogClock({
  className = '',
  timezone = 'America/Santo_Domingo',
  label = 'Montecristi',
}: AnalogClockProps) {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date(
        new Date().toLocaleString('en-US', { timeZone: timezone })
      );
      setTime(now);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timezone]);

  if (!time) {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <div className="w-28 h-28 rounded-full bg-brand-dark/30 animate-pulse" />
      </div>
    );
  }

  const sec = time.getSeconds();
  const min = time.getMinutes();
  const hr = time.getHours() % 12;

  const secDeg = sec * 6;
  const minDeg = min * 6 + sec * 0.1;
  const hrDeg = hr * 30 + min * 0.5;

  const hand = (deg: number, length: number) => ({
    x2: 50 + length * Math.cos(((deg - 90) * Math.PI) / 180),
    y2: 50 + length * Math.sin(((deg - 90) * Math.PI) / 180),
  });

  const hh = hand(hrDeg, 26);
  const mh = hand(minDeg, 36);
  const sh = hand(secDeg, 40);

  const timeStr = time.toLocaleTimeString('es-DO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <svg viewBox="0 0 100 100" className="w-28 h-28 md:w-32 md:h-32 drop-shadow-[0_4px_16px_rgba(191,27,35,0.35)]">
        {/* Outer ring */}
        <circle cx="50" cy="50" r="48" fill="#140405" stroke="#BF1B23" strokeWidth="1.5" />
        {/* Inner subtle glow ring */}
        <circle cx="50" cy="50" r="44" fill="none" stroke="#BF1B23" strokeWidth="0.3" strokeDasharray="2 4" />

        {/* Hour tick marks */}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = ((i * 30 - 90) * Math.PI) / 180;
          const isMajor = i % 3 === 0;
          const r1 = isMajor ? 38 : 40;
          return (
            <line
              key={i}
              x1={50 + r1 * Math.cos(a)}
              y1={50 + r1 * Math.sin(a)}
              x2={50 + 44 * Math.cos(a)}
              y2={50 + 44 * Math.sin(a)}
              stroke={isMajor ? '#BF1B23' : '#BF1B2360'}
              strokeWidth={isMajor ? 1.5 : 0.8}
            />
          );
        })}

        {/* Cardinal numerals */}
        {[12, 3, 6, 9].map((n, i) => {
          const a = (((i * 90) - 90) * Math.PI) / 180;
          return (
            <text
              key={n}
              x={50 + 32 * Math.cos(a)}
              y={50 + 32 * Math.sin(a)}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="6.5"
              fontWeight="bold"
              fill="#BF1B23"
              fontFamily="sans-serif"
            >
              {n}
            </text>
          );
        })}

        {/* Hour hand */}
        <line x1="50" y1="50" x2={hh.x2} y2={hh.y2}
          stroke="white" strokeWidth="3" strokeLinecap="round" />

        {/* Minute hand */}
        <line x1="50" y1="50" x2={mh.x2} y2={mh.y2}
          stroke="#BF1B23" strokeWidth="2" strokeLinecap="round" />

        {/* Second hand */}
        <line x1="50" y1="50" x2={sh.x2} y2={sh.y2}
          stroke="#E8414A" strokeWidth="1" strokeLinecap="round" />
        {/* Counterweight tail */}
        <line
          x1="50" y1="50"
          x2={50 - 10 * Math.cos(((secDeg - 90) * Math.PI) / 180)}
          y2={50 - 10 * Math.sin(((secDeg - 90) * Math.PI) / 180)}
          stroke="#E8414A" strokeWidth="1.5" strokeLinecap="round"
        />

        {/* Center cap */}
        <circle cx="50" cy="50" r="3.5" fill="#BF1B23" />
        <circle cx="50" cy="50" r="1.5" fill="white" />
      </svg>

      {/* Digital display */}
      <div className="text-center">
        <p className="text-brand-light font-black text-lg tracking-widest tabular-nums leading-none">
          {timeStr}
        </p>
        <p className="text-white/40 text-[9px] font-bold uppercase tracking-[0.3em] mt-1">{label}</p>
      </div>
    </div>
  );
}
