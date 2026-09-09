export type ClientStatus =
  | "cotizacion"
  | "en_obra"
  | "entregado"
  | "pausado"
  | "cancelado";

export const CLIENT_STATUSES: ClientStatus[] = [
  "cotizacion",
  "en_obra",
  "entregado",
  "pausado",
  "cancelado",
];

export type Client = {
  id: string;
  name: string;
  siteAddress: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  generalNotes: string | null;
  status: ClientStatus;
  createdAt: string;
  updatedAt: string;
};

export type ClientInput = {
  name: string;
  siteAddress?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  generalNotes?: string | null;
  status?: ClientStatus;
};
