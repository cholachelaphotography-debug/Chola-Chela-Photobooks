/** Pricing helpers — amounts in ngwee (1 ZMW = 100 ngwee) */

export type MaterialOption = {
  id: string;
  name: string;
  description: string;
  basePrice: number; // ngwee
};

/** Default materials if DB not seeded yet */
export const DEFAULT_MATERIALS: MaterialOption[] = [
  {
    id: "standard-matte",
    name: "Standard Matte",
    description: "Classic matte pages, softcover-friendly",
    basePrice: 35000, // K350
  },
  {
    id: "premium-lustre",
    name: "Premium Lustre",
    description: "Semi-gloss lustre finish, rich colours",
    basePrice: 48000, // K480
  },
  {
    id: "deluxe-glossy",
    name: "Deluxe Glossy",
    description: "High-gloss pages for vibrant prints",
    basePrice: 55000, // K550
  },
  {
    id: "layflat-premium",
    name: "Layflat Premium",
    description: "Layflat binding, seamless spreads",
    basePrice: 75000, // K750
  },
];

const SIZE_MULTIPLIER: Record<string, number> = {
  "20x20": 1,
  "25x25": 1.15,
  "30x30": 1.35,
  A4: 1.1,
};

const COVER_EXTRA: Record<string, number> = {
  softcover: 0,
  hardcover: 15000,
  layflat: 25000,
};

export function calculateOrderAmount(params: {
  materialBasePrice: number;
  bookSize: string;
  coverType: string;
  pageCount: number;
  quantity: number;
}): number {
  const sizeMul = SIZE_MULTIPLIER[params.bookSize] ?? 1;
  const coverExtra = COVER_EXTRA[params.coverType] ?? 0;
  const extraPages = Math.max(0, params.pageCount - 20) * 800;
  const perBook =
    Math.round(params.materialBasePrice * sizeMul) + coverExtra + extraPages;
  return perBook * Math.max(1, params.quantity);
}

export function formatKwacha(ngwee: number): string {
  return `K${(ngwee / 100).toFixed(2)}`;
}

export const SHIPPING_NOTICE =
  "Please note: Shipping and delivery charges are not included in the printing price and may be charged separately.";
