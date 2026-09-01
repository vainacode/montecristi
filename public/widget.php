<?php
header('Content-Type: text/html; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('X-Frame-Options: ALLOWALL');

$valid_range = "29/08/2026";
$fuels = [
    ["name" => "Gasolina Premium", "price" => "338.10", "delta" => "-3.00", "trend" => "down"],
    ["name" => "Gasoil Óptimo", "price" => "290.10", "delta" => "-5.00", "trend" => "down"],
    ["name" => "Gas Licuado de Petroleo (GLP)", "price" => "137.20", "delta" => "0.00", "trend" => "flat"],
    ["name" => "Gasolina Regular", "price" => "305.50", "delta" => "-5.00", "trend" => "down"],
    ["name" => "Gasoil Regular", "price" => "257.80", "delta" => "-5.00", "trend" => "down"],
    ["name" => "Gas Natural (GNL-GNC)", "price" => "43.97", "delta" => "0.00", "trend" => "flat"],
];
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CombustibleRD Widget</title>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
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
      user-select: none;
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
      gap: 6px;
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
  </style>
</head>
<body>
<div class="widget-wrap">
  <div>
    <div class="widget-header">
      <a class="widget-logo" href="https://montecristi.net/combustibles" target="_blank" rel="noopener noreferrer">
        <span class="live-dot"></span> CombustibleRD
      </a>
      <span class="widget-date"><?php echo $valid_range; ?></span>
    </div>

    <?php foreach ($fuels as $fuel): ?>
    <div class="fuel-row">
      <span class="fuel-row-name"><?php echo htmlspecialchars($fuel['name']); ?></span>
      <div class="fuel-row-right">
        <?php if ($fuel['trend'] === 'down'): ?>
          <span class="delta-badge down">▼ <?php echo str_replace('-', '', $fuel['delta']); ?></span>
        <?php elseif ($fuel['trend'] === 'up'): ?>
          <span class="delta-badge up">▲ <?php echo $fuel['delta']; ?></span>
        <?php else: ?>
          <span class="delta-badge flat">— sin cambio</span>
        <?php endif; ?>
        <span class="fuel-row-price">RD$ <?php echo htmlspecialchars($fuel['price']); ?></span>
      </div>
    </div>
    <?php endforeach; ?>
  </div>

  <div class="widget-footer">
    Fuente oficial MICM · <a href="https://montecristi.net/combustibles" target="_blank" rel="noopener noreferrer">montecristi.net</a>
  </div>
</div>
</body>
</html>
