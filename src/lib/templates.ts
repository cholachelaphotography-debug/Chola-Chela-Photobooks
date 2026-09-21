export type Template = {
  id: string;
  name: string;
  description: string;
  pages: number;
  slotsPerPage: number;
  layout: "grid-2x2" | "hero-plus-two" | "single" | "wedding" | "collage" | "family";
  coverColor: string;
  preview: string;
};

export const TEMPLATES: Template[] = [
  {
    id: "classic-grid",
    name: "Classic Grid",
    description: "Clean 2x2 grid per page. Timeless and elegant.",
    pages: 12,
    slotsPerPage: 4,
    layout: "grid-2x2",
    coverColor: "#1a5f4a",
    preview: "bg-gradient-to-br from-emerald-800 to-emerald-950",
  },
  {
    id: "story-spread",
    name: "Story Spread",
    description: "Full-bleed hero + two smaller photos. Perfect for storytelling.",
    pages: 16,
    slotsPerPage: 3,
    layout: "hero-plus-two",
    coverColor: "#833920",
    preview: "bg-gradient-to-br from-amber-800 to-stone-900",
  },
  {
    id: "minimal-single",
    name: "Minimal Single",
    description: "One large photo per page with elegant margins.",
    pages: 20,
    slotsPerPage: 1,
    layout: "single",
    coverColor: "#1e293b",
    preview: "bg-gradient-to-br from-slate-700 to-slate-900",
  },
  {
    id: "wedding-elegance",
    name: "Wedding Elegance",
    description: "Soft romantic layouts ideal for weddings and celebrations.",
    pages: 24,
    slotsPerPage: 3,
    layout: "wedding",
    coverColor: "#9f1239",
    preview: "bg-gradient-to-br from-rose-800 to-rose-950",
  },
  {
    id: "travel-journal",
    name: "Travel Journal",
    description: "Dynamic collage layouts for adventures and journeys.",
    pages: 18,
    slotsPerPage: 5,
    layout: "collage",
    coverColor: "#0e7490",
    preview: "bg-gradient-to-br from-cyan-800 to-slate-900",
  },
  {
    id: "family-album",
    name: "Family Album",
    description: "Warm multi-photo pages for family memories.",
    pages: 20,
    slotsPerPage: 6,
    layout: "family",
    coverColor: "#b45309",
    preview: "bg-gradient-to-br from-orange-700 to-amber-950",
  },
];

export function getTemplate(id: string) {
  return TEMPLATES.find((t) => t.id === id);
}
