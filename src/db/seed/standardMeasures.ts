// Datos fijos de referencia (no editables desde la UI). Lista inicial
// completa a partir de estándares generales de diseño de interiores y
// ergonomía. Son valores de referencia — pueden variar según normativa
// local, marca de los accesorios, o preferencia puntual del cliente;
// siempre conviene confirmar en obra. Si quieres agregar, quitar o
// ajustar algún valor, dime cuáles y los actualizo — no se edita desde
// la app en v1.

export type StandardMeasureSeed = {
  category: string;
  item: string;
  valueText: string;
  valueMinCm?: number;
  valueMaxCm?: number;
  notes?: string;
};

export const STANDARD_MEASURES_SEED: StandardMeasureSeed[] = [
  // Tomacorrientes
  {
    category: "Tomacorrientes",
    item: "Tomacorriente estándar de pared",
    valueText: "30–40 cm desde el piso",
    valueMinCm: 30,
    valueMaxCm: 40,
  },
  {
    category: "Tomacorrientes",
    item: "Tomacorriente sobre mesón de cocina",
    valueText: "105–110 cm desde el piso",
    valueMinCm: 105,
    valueMaxCm: 110,
  },
  {
    category: "Tomacorrientes",
    item: "Tomacorriente cerca de lavamanos (baño)",
    valueText: "105–110 cm desde el piso",
    valueMinCm: 105,
    valueMaxCm: 110,
  },
  {
    category: "Tomacorrientes",
    item: "Tomacorriente para TV / mueble de entretenimiento",
    valueText: "30–40 cm desde el piso, o a la altura del mueble",
    valueMinCm: 30,
    valueMaxCm: 40,
  },

  // Interruptores
  {
    category: "Interruptores",
    item: "Interruptor de luz estándar",
    valueText: "110–120 cm desde el piso",
    valueMinCm: 110,
    valueMaxCm: 120,
  },
  {
    category: "Interruptores",
    item: "Interruptor accesible (diseño universal)",
    valueText: "90–105 cm desde el piso",
    valueMinCm: 90,
    valueMaxCm: 105,
  },

  // Cocina
  {
    category: "Mesones de cocina",
    item: "Altura de mesón de cocina",
    valueText: "90–92 cm desde el piso",
    valueMinCm: 90,
    valueMaxCm: 92,
  },
  {
    category: "Mesones de cocina",
    item: "Altura de barra desayunador / isla con asientos",
    valueText: "105–110 cm desde el piso",
    valueMinCm: 105,
    valueMaxCm: 110,
  },
  {
    category: "Mesones de cocina",
    item: "Profundidad estándar de mesón",
    valueText: "60 cm",
    valueMinCm: 60,
    valueMaxCm: 60,
  },
  {
    category: "Mesones de cocina",
    item: "Distancia entre mesón inferior y gabinete superior",
    valueText: "45–60 cm",
    valueMinCm: 45,
    valueMaxCm: 60,
  },
  {
    category: "Mesones de cocina",
    item: "Altura de base de gabinetes superiores",
    valueText: "137–145 cm desde el piso",
    valueMinCm: 137,
    valueMaxCm: 145,
  },

  // Baños / lavamanos
  {
    category: "Lavamanos",
    item: "Altura de lavamanos (borde superior)",
    valueText: "80–85 cm desde el piso",
    valueMinCm: 80,
    valueMaxCm: 85,
  },
  {
    category: "Lavamanos",
    item: "Altura de espejo (borde inferior) sobre lavamanos",
    valueText: "100–110 cm desde el piso",
    valueMinCm: 100,
    valueMaxCm: 110,
  },
  {
    category: "Baños",
    item: "Altura de asiento de inodoro",
    valueText: "40–43 cm desde el piso",
    valueMinCm: 40,
    valueMaxCm: 43,
  },
  {
    category: "Baños",
    item: "Altura de regadera / ducha teléfono",
    valueText: "190–210 cm desde el piso",
    valueMinCm: 190,
    valueMaxCm: 210,
  },
  {
    category: "Baños",
    item: "Barra de apoyo en ducha (diseño universal)",
    valueText: "80–90 cm desde el piso",
    valueMinCm: 80,
    valueMaxCm: 90,
  },
  {
    category: "Baños",
    item: "Toallero",
    valueText: "120–130 cm desde el piso",
    valueMinCm: 120,
    valueMaxCm: 130,
  },

  // Cortinas y ventanas
  {
    category: "Barras de cortina",
    item: "Barra sobre el marco de la ventana",
    valueText: "10–15 cm arriba del marco",
    valueMinCm: 10,
    valueMaxCm: 15,
  },
  {
    category: "Barras de cortina",
    item: "Barra montada cerca del techo (efecto de altura)",
    valueText: "5–10 cm bajo el techo",
    valueMinCm: 5,
    valueMaxCm: 10,
  },
  {
    category: "Barras de cortina",
    item: "Extensión de la barra más allá del marco (cada lado)",
    valueText: "15–20 cm",
    valueMinCm: 15,
    valueMaxCm: 20,
  },

  // Iluminación
  {
    category: "Lámparas colgantes",
    item: "Sobre mesa de comedor (borde inferior a la mesa)",
    valueText: "75–90 cm sobre la mesa",
    valueMinCm: 75,
    valueMaxCm: 90,
  },
  {
    category: "Lámparas colgantes",
    item: "Sobre isla o barra de cocina (borde inferior al mesón)",
    valueText: "75–85 cm sobre el mesón",
    valueMinCm: 75,
    valueMaxCm: 85,
  },
  {
    category: "Iluminación",
    item: "Aplique de pared",
    valueText: "150–170 cm desde el piso",
    valueMinCm: 150,
    valueMaxCm: 170,
  },

  // Puertas y manijas
  {
    category: "Manijas de puertas",
    item: "Manija de puerta estándar",
    valueText: "95–105 cm desde el piso",
    valueMinCm: 95,
    valueMaxCm: 105,
  },
  {
    category: "Puertas",
    item: "Mirilla de puerta principal",
    valueText: "150–160 cm desde el piso",
    valueMinCm: 150,
    valueMaxCm: 160,
  },
  {
    category: "Puertas",
    item: "Timbre / interfón",
    valueText: "120–140 cm desde el piso",
    valueMinCm: 120,
    valueMaxCm: 140,
  },

  // Clósets y almacenamiento
  {
    category: "Clósets",
    item: "Barra de colgar (closet sencillo)",
    valueText: "150–170 cm desde el piso",
    valueMinCm: 150,
    valueMaxCm: 170,
  },
  {
    category: "Clósets",
    item: "Barra de colgar doble — superior",
    valueText: "180–200 cm desde el piso",
    valueMinCm: 180,
    valueMaxCm: 200,
  },
  {
    category: "Clósets",
    item: "Barra de colgar doble — inferior",
    valueText: "90–100 cm desde el piso",
    valueMinCm: 90,
    valueMaxCm: 100,
  },
  {
    category: "Clósets",
    item: "Repisa superior",
    valueText: "200–210 cm desde el piso",
    valueMinCm: 200,
    valueMaxCm: 210,
  },

  // Muebles y distribución
  {
    category: "Muebles",
    item: "Altura de asiento de silla de comedor",
    valueText: "45–48 cm desde el piso",
    valueMinCm: 45,
    valueMaxCm: 48,
  },
  {
    category: "Muebles",
    item: "Altura de mesa de comedor",
    valueText: "75–76 cm desde el piso",
    valueMinCm: 75,
    valueMaxCm: 76,
  },
  {
    category: "Muebles",
    item: "Distancia de mesa de comedor a la pared (para circular con silla)",
    valueText: "90–100 cm",
    valueMinCm: 90,
    valueMaxCm: 100,
  },
  {
    category: "Muebles",
    item: "Altura de mesa de centro",
    valueText: "40–45 cm desde el piso",
    valueMinCm: 40,
    valueMaxCm: 45,
  },
  {
    category: "Muebles",
    item: "Distancia entre sofá y mesa de centro",
    valueText: "35–45 cm",
    valueMinCm: 35,
    valueMaxCm: 45,
  },
];
