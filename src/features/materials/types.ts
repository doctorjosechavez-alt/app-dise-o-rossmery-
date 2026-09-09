export type MaterialType =
  | "tela"
  | "piso"
  | "madera"
  | "marmol_piedra"
  | "mueble"
  | "otro";

export const MATERIAL_TYPES: MaterialType[] = [
  "tela",
  "piso",
  "madera",
  "marmol_piedra",
  "mueble",
  "otro",
];

export const MATERIAL_TYPE_LABEL: Record<MaterialType, string> = {
  tela: "Tela",
  piso: "Piso",
  madera: "Madera",
  marmol_piedra: "Mármol / piedra",
  mueble: "Mueble",
  otro: "Otro",
};

export type Material = {
  id: string;
  clientId: string;
  type: MaterialType;
  nameReference: string;
  supplier: string | null;
  detail: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MaterialInput = {
  type: MaterialType;
  nameReference: string;
  supplier?: string | null;
  detail?: string | null;
};
