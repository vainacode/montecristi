import { permanentRedirect } from 'next/navigation';

// El widget para incrustar en otros sitios es /widget.php (HTML independiente).
// Esta ruta generaba un <html> anidado dentro del diseño principal; ahora redirige.
export default function FuelWidgetPage() {
  permanentRedirect('/widget.php');
}
