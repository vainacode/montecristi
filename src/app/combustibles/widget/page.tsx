import React from 'react';
import { fuelData } from '@/data/fuels';

export const revalidate = 300;

export const metadata = {
  title: 'CombustibleRD Widget',
  robots: 'noindex, follow',
};

export default function FuelWidgetPage() {
  const topFuels = fuelData.fuels.slice(0, 6);

  return (
    <html lang="es" style={{ background: 'transparent' }}>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>CombustibleRD Widget</title>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        <style>{`
          :root {
            --bg:       #111827;
            --bg2:      #1C2542;
            --text:     #E8EDF5;
            --muted:    #7A8499;
            --border:   rgba(255,255,255,0.08);
            --accent:   #F5A623;
            --up:       #E74C3C;
            --down:     #2ECC71;
          }

          * { box-sizing: border-box; margin: 0; padding: 0; }

          body {
            background: var(--bg);
            color: var(--text);
            font-family: 'Inter', sans-serif;
            font-size: 13px;
            overflow: hidden;
          }

          .widget-wrap {
            padding: 14px;
            min-width: 220px;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          .widget-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
          }

          .widget-logo {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 0.85rem;
            font-weight: 700;
            color: var(--accent);
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 5px;
          }

          .live-dot {
            width: 6px; height: 6px;
            background: var(--accent);
            border-radius: 50%;
            display: inline-block;
            animation: blink 1.5s infinite;
          }

          @keyframes blink {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.2; }
          }

          .widget-date {
            font-size: 0.7rem;
            color: var(--muted);
            font-family: monospace;
          }

          .fuel-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid var(--border);
          }

          .fuel-row:last-child { border-bottom: none; }

          .fuel-row-name {
            font-size: 0.78rem;
            color: var(--muted);
            font-weight: 500;
          }

          .fuel-row-right {
            text-align: right;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .fuel-row-price {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 0.95rem;
            font-weight: 700;
            color: var(--text);
          }

          .delta-badge {
            font-size: 0.65rem;
            font-weight: 600;
            padding: 2px 6px;
            border-radius: 100px;
            font-family: monospace;
          }

          .delta-badge.up   { background: rgba(231,76,60,0.12);  color: var(--up);   }
          .delta-badge.down { background: rgba(46,204,113,0.12); color: var(--down); }
          .delta-badge.flat { background: rgba(122,132,153,0.12); color: var(--muted); }

          .widget-footer {
            margin-top: 10px;
            text-align: center;
            font-size: 0.68rem;
            color: var(--muted);
            border-top: 1px solid var(--border);
            padding-top: 8px;
          }

          .widget-footer a { color: var(--accent); text-decoration: none; font-weight: 600; }
          .widget-footer a:hover { text-decoration: underline; }
        `}</style>
      </head>
      <body>
        <div className="widget-wrap">
          <div>
            <div className="widget-header">
              <a className="widget-logo" href="https://montecristi.net/combustibles" target="_blank" rel="noopener noreferrer">
                <span className="live-dot"></span> CombustibleRD
              </a>
              <span className="widget-date">MICM Oficial</span>
            </div>

            {topFuels.map((fuel) => (
              <div key={fuel.id} className="fuel-row">
                <span className="fuel-row-name">{fuel.name}</span>
                <div className="fuel-row-right">
                  {fuel.trend === 'down' && (
                    <span className="delta-badge down">
                      ▼ {Math.abs(fuel.delta).toFixed(2)}
                    </span>
                  )}
                  {fuel.trend === 'up' && (
                    <span className="delta-badge up">
                      ▲ {Math.abs(fuel.delta).toFixed(2)}
                    </span>
                  )}
                  {fuel.trend === 'flat' && (
                    <span className="delta-badge flat">
                      — 0.00
                    </span>
                  )}
                  <span className="fuel-row-price">RD$ {fuel.price.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="widget-footer">
            Fuente oficial MICM · <a href="https://montecristi.net/combustibles" target="_blank" rel="noopener noreferrer">montecristi.net</a>
          </div>
        </div>
      </body>
    </html>
  );
}
