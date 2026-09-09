export type Paint = {
  id: string;
  clientId: string;
  areaId: string;
  areaName: string;
  brand: string | null;
  colorCode: string | null;
  colorName: string | null;
  finish: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaintInput = {
  areaId: string;
  brand?: string | null;
  colorCode?: string | null;
  colorName?: string | null;
  finish?: string | null;
  note?: string | null;
};
