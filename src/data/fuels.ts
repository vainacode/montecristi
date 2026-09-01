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

export const fuelData: FuelData = {
  lastUpdated: 'Viernes, 28 de Agosto de 2026',
  validRange: 'Semana del 29 de Agosto al 4 de Septiembre de 2026',
  source: 'Ministerio de Industria, Comercio y Mipymes (MICM)',
  fuels: [
    {
      id: 'gasolina-premium',
      name: 'Gasolina Premium',
      shortName: 'G. Premium',
      price: 338.10,
      previousPrice: 341.10,
      delta: -3.00,
      trend: 'down',
      category: 'gasolina',
      icon: '⛽',
      description: '95 octanos. Máximo rendimiento y protección de motores de alta compresión.',
    },
    {
      id: 'gasolina-regular',
      name: 'Gasolina Regular',
      shortName: 'G. Regular',
      price: 305.50,
      previousPrice: 310.50,
      delta: -5.00,
      trend: 'down',
      category: 'gasolina',
      icon: '⛽',
      description: '89 octanos. Combustible de uso general para vehículos ligeros.',
    },
    {
      id: 'gasoil-optimo',
      name: 'Gasoil Óptimo',
      shortName: 'Gasoil Ópt.',
      price: 290.10,
      previousPrice: 295.10,
      delta: -5.00,
      trend: 'down',
      category: 'gasoil',
      icon: '🔹',
      description: 'Diésel ultra bajo en azufre (ULSD 10ppm) para tecnología Common Rail.',
    },
    {
      id: 'gasoil-regular',
      name: 'Gasoil Regular',
      shortName: 'Gasoil Reg.',
      price: 257.80,
      previousPrice: 262.80,
      delta: -5.00,
      trend: 'down',
      category: 'gasoil',
      icon: '🚛',
      description: 'Diésel estándar para transporte pesado, maquinaria y plantas eléctricas.',
    },
    {
      id: 'glp',
      name: 'Gas Licuado de Petróleo (GLP)',
      shortName: 'GLP',
      price: 137.20,
      previousPrice: 137.20,
      delta: 0.00,
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
      delta: 0.00,
      trend: 'flat',
      category: 'gas',
      icon: '⚡',
      description: 'Precio por metro cúbico (m³). La opción más económica y ecológica.',
    },
    {
      id: 'avtur',
      name: 'Avtur (Combustible de Aviación)',
      shortName: 'Avtur',
      price: 191.60,
      previousPrice: 194.80,
      delta: -3.20,
      trend: 'down',
      category: 'otros',
      icon: '✈️',
      description: 'Turbosina Jet A-1 para aviación comercial y turbinas.',
    },
    {
      id: 'kerosene',
      name: 'Kerosene',
      shortName: 'Kerosene',
      price: 221.40,
      previousPrice: 225.00,
      delta: -3.60,
      trend: 'down',
      category: 'otros',
      icon: '💡',
      description: 'Destilado para calefacción, lámparas e industria.',
    },
    {
      id: 'fuel-oil-6',
      name: 'Fuel Oil #6',
      shortName: 'Fuel Oil 6',
      price: 161.45,
      previousPrice: 163.20,
      delta: -1.75,
      trend: 'down',
      category: 'otros',
      icon: '🏭',
      description: 'Combustible pesado para generación eléctrica marítima e industrial.',
    },
  ],
  history: [
    { week: 'Sem 1 Ago', premium: 341.10, regular: 310.50, gasoilOptimo: 295.10, glp: 137.20 },
    { week: 'Sem 2 Ago', premium: 341.10, regular: 310.50, gasoilOptimo: 295.10, glp: 137.20 },
    { week: 'Sem 3 Ago', premium: 339.50, regular: 308.00, gasoilOptimo: 292.50, glp: 137.20 },
    { week: 'Sem 4 Ago', premium: 338.10, regular: 305.50, gasoilOptimo: 290.10, glp: 137.20 },
  ],
};
