export const garageInspections = {
  main_work: { name: "Main Work Area", tab: "Desks", image: "desks", caption: "Where the pitch becomes a product. Eventually.", alt: "Close inspection of the garage workstation, monitor, keyboard and worn desk." },
  corner_1: { name: "Corner Space", tab: "Coffee corner", image: "coffee", caption: "Your future employee retention department.", alt: "Close inspection of an improvised garage coffee corner with mugs and a drip brewer." },
  closet: { name: "Closet", tab: "Storage", image: "storage", caption: "Every cable is important. Nobody knows why.", alt: "Close inspection of garage shelving, spare equipment and labeled cable boxes." },
} as const;
export type GarageAreaId = keyof typeof garageInspections;
