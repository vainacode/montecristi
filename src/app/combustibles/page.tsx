import { getFuelData } from '@/lib/fuels';
import { CombustiblesClient } from './CombustiblesClient';

// Los precios cambian cada viernes; revisamos combustibles.do cada 3 horas.
export const revalidate = 10800;

export default async function CombustiblesPage() {
  const fuelData = await getFuelData();
  return <CombustiblesClient fuelData={fuelData} />;
}
