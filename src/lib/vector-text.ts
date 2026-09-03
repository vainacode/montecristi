import TextToSVG from 'text-to-svg';
import path from 'path';

let textToSVGInstance: any = null;

function getTextToSVG(): any {
  if (textToSVGInstance) return textToSVGInstance;
  const fontPath = path.join(process.cwd(), 'src', 'fonts', 'Roboto-Black.ttf');
  textToSVGInstance = (TextToSVG as any).loadSync(fontPath);
  return textToSVGInstance;
}

/**
 * Renderiza el titular amarillo de alto impacto como SVG con trazados vectoriales <path>.
 * Al no usar etiquetas <text>, no depende de fuentes instaladas en el servidor y NUNCA produce caracteres '[]'.
 */
export async function renderHeadlineVector(
  headline: string
): Promise<{ buffer: Buffer; width: number; height: number }> {
  const tts = getTextToSVG();
  const clean = headline.trim();

  // Dividir en 2 líneas si es largo
  let line1 = clean;
  let line2 = '';
  if (clean.length > 32) {
    const words = clean.split(' ');
    const l1: string[] = [];
    const l2: string[] = [];
    let curLen = 0;
    const half = clean.length / 2;

    for (const w of words) {
      if (curLen + w.length <= half || l1.length === 0) {
        l1.push(w);
        curLen += w.length + 1;
      } else {
        l2.push(w);
      }
    }
    line1 = l1.join(' ');
    line2 = l2.join(' ');
  }

  const fontSize = line2 ? 26 : (clean.length > 25 ? 27 : 31);
  const m1 = tts.getMetrics(line1, { fontSize });
  const m2 = line2 ? tts.getMetrics(line2, { fontSize }) : { width: 0, height: 0 };

  const textW = Math.max(m1.width, m2.width);
  const boxW = Math.min(1150, Math.max(380, Math.round(textW + 64)));
  const boxH = line2 ? 104 : 64;
  const cx = boxW / 2;

  let pathsSvg = '';
  if (line2) {
    const p1 = tts.getD(line1, { x: cx, y: 40, fontSize, anchor: 'center baseline' });
    const p2 = tts.getD(line2, { x: cx, y: 78, fontSize, anchor: 'center baseline' });
    pathsSvg = `<path d="${p1}" fill="#000000"/><path d="${p2}" fill="#000000"/>`;
  } else {
    const p1 = tts.getD(line1, { x: cx, y: 42, fontSize, anchor: 'center baseline' });
    pathsSvg = `<path d="${p1}" fill="#000000"/>`;
  }

  const svg = `
    <svg width="${boxW}" height="${boxH}" viewBox="0 0 ${boxW} ${boxH}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="headlineShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.95"/>
        </filter>
      </defs>
      <rect x="4" y="4" width="${boxW - 8}" height="${boxH - 8}" rx="12" fill="#FFE600" stroke="#000000" stroke-width="3.5" filter="url(#headlineShadow)"/>
      ${pathsSvg}
    </svg>
  `;

  return {
    buffer: Buffer.from(svg),
    width: boxW,
    height: boxH,
  };
}

/**
 * Renderiza la insignia en esquina superior izquierda como vector <path>
 */
export async function renderBadgeVector(
  badge: string,
  isPlay: boolean = false
): Promise<{ buffer: Buffer; width: number; height: number }> {
  const tts = getTextToSVG();
  const clean = badge.trim();
  const fontSize = 12;

  const m = tts.getMetrics(clean, { fontSize });
  const badgeW = Math.max(110, Math.round(m.width + 42));
  const badgeH = 32;

  const pathD = tts.getD(clean, {
    x: isPlay ? 44 : 40,
    y: 20,
    fontSize,
    anchor: 'left baseline',
  });

  const svg = `
    <svg width="${badgeW}" height="${badgeH}" viewBox="0 0 ${badgeW} ${badgeH}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.8"/>
        </filter>
      </defs>
      <rect x="2" y="2" width="${badgeW - 4}" height="${badgeH - 4}" rx="6" fill="#BF1B23" fill-opacity="0.95" stroke="#ffffff" stroke-width="1" filter="url(#badgeShadow)"/>
      ${isPlay
        ? `<polygon points="18,10 28,16 18,22" fill="#FFFFFF"/>`
        : `<circle cx="22" cy="16" r="4.5" fill="#FFE600"/>`
      }
      <path d="${pathD}" fill="#ffffff"/>
    </svg>
  `;

  return {
    buffer: Buffer.from(svg),
    width: badgeW,
    height: badgeH,
  };
}

/**
 * Renderiza el cintillo oficial inferior como vector <path>
 */
export async function renderCintilloVector(
  width: number,
  height: number,
  iconSvgContent: string = ''
): Promise<Buffer> {
  const tts = getTextToSVG();
  const text = 'MONTECRISTI.NET';
  const fontSize = Math.max(18, Math.round(height * 0.42));

  const rightBannerWidth = Math.round(height * 2.8);
  const availableCenter = (width - rightBannerWidth / 2);
  const cx = Math.round(availableCenter / 2);
  const cy = Math.round(height * 0.68);

  const pathD = tts.getD(text, {
    x: cx,
    y: cy,
    fontSize,
    anchor: 'center baseline',
  });

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${width}" height="${height}" fill="#042564" />
      <polygon points="${width - height * 2.8},0 ${width},0 ${width},${height} ${width - height * 3.5},${height}" fill="#BF1B23" />
      <circle cx="${width - height * 0.85}" cy="${height / 2}" r="${height * 0.28}" fill="#ffffff" />
      <circle cx="${width - height * 0.85}" cy="${height / 2}" r="${height * 0.15}" fill="#BF1B23" />
      <path d="${pathD}" fill="#ffffff"/>
    </svg>
  `;

  return Buffer.from(svg);
}
