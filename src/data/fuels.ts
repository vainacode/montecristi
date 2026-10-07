export interface FuelItem {
  id: string;
  name: string;
  shortName: string;
  price: number;
  previousPrice: number;
  delta: number;
  trend: 'up' | 'down' | 'flat';
  category: 'gasolina' | 'gasoil' | 'gas' | 'otros';
  icon: string;
  description: string;
}

export interface FuelData {
  lastUpdated: string;
  validRange: string;
  source: string;
  fuels: FuelItem[];
  history: {
    week: string;
    premium: number;
    regular: number;
    gasoilOptimo: number;
    glp: number;
  }[];
}

/**
 * Respaldo: precios oficiales MICM de la semana del 3 al 9 de octubre de 2026
 * (según combustibles.do). Los datos vigentes se leen de combustibles.do con
 * getFuelData() en src/lib/fuels.ts; esto solo se muestra si esa lectura falla.
 */
export const fuelData: FuelData = {
  lastUpdated: 'Viernes, 2 de Octubre de 2026',
  validRange: 'Semana del 3 al 9 de Octubre de 2026',
  source: 'Ministerio de Industria, Comercio y Mipymes (MICM)',
  fuels: [
    {
      id: 'gasolina-premium',
      name: 'Gasolina Premium',
      shortName: 'G. Premium',
      price: 353.10,
      previousPrice: 353.10,
      delta: 0,
      trend: 'flat',
      category: 'gasolina',
      icon: '⛽',
      description: '95 octanos. Máximo rendimiento y protección de motores de alta compresión.',
    },
    {
      id: 'gasolina-regular',
      name: 'Gasolina Regular',
      shortName: 'G. Regular',
      price: 317.50,
      previousPrice: 317.50,
      delta: 0,
      trend: 'flat',
      category: 'gasolina',
      icon: '⛽',
      description: '89 octanos. Combustible de uso general para vehículos ligeros.',
    },
    {
      id: 'gasoil-optimo',
      name: 'Gasoil Óptimo',
      shortName: 'Gasoil Ópt.',
      price: 306.10,
      previousPrice: 306.10,
      delta: 0,
      trend: 'flat',
      category: 'gasoil',
      icon: '🔹',
      description: 'Diésel ultra bajo en azufre (ULSD 10ppm) para tecnología Common Rail.',
    },
    {
      id: 'gasoil-regular',
      name: 'Gasoil Regular',
      shortName: 'Gasoil Reg.',
      price: 270.80,
      previousPrice: 270.80,
      delta: 0,
      trend: 'flat',
      category: 'gasoil',
      icon: '🚛',
      description: 'Diésel estándar para transporte pesado, maquinaria y plantas eléctricas.',
    },
    {
      id: 'glp',
      name: 'Gas Licuado de Petróleo (GLP)',
      shortName: 'GLP',
      price: 135.20,
      previousPrice: 135.20,
      delta: 0,
      trend: 'flat',
      category: 'gas',
      icon: '🔥',
      description: 'Precio subsidiado por galón para uso vehicular y doméstico.',
    },
    {
      id: 'gas-natural',
      name: 'Gas Natural (GNL - GNC)',
      shortName: 'Gas Natural',
      price: 43.97,
      previousPrice: 43.97,
      delta: 0,
      trend: 'flat',
      category: 'gas',
      icon: '⚡',
      description: 'Precio por metro cúbico (m³). La opción más económica y ecológica.',
    },
    {
      id: 'avtur',
      name: 'Avtur (Combustible de Aviación)',
      shortName: 'Avtur',
      price: 333.65,
      previousPrice: 333.65,
      delta: 0,
      trend: 'flat',
      category: 'otros',
      icon: '✈️',
      description: 'Turbosina Jet A-1 para aviación comercial y turbinas.',
    },
    {
      id: 'kerosene',
      name: 'Kerosene',
      shortName: 'Kerosene',
      price: 380.10,
      previousPrice: 380.10,
      delta: 0,
      trend: 'flat',
      category: 'otros',
      icon: '💡',
      description: 'Destilado para calefacción, lámparas e industria.',
    },
    {
      id: 'fuel-oil-6',
      name: 'Fuel Oil #6',
      shortName: 'Fuel Oil 6',
      price: 180.76,
      previousPrice: 180.76,
      delta: 0,
      trend: 'flat',
      category: 'otros',
      icon: '🏭',
      description: 'Combustible pesado para generación eléctrica marítima e industrial.',
    },
  ],
  history: [
    { week: 'Sem 3 Oct', premium: 353.10, regular: 317.50, gasoilOptimo: 306.10, glp: 135.20 },
  ],
};
