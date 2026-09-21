const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const MATERIALS = [
  { name: "Standard Matte", description: "Classic matte pages", basePrice: 35000, sortOrder: 1 },
  { name: "Premium Lustre", description: "Semi-gloss lustre finish", basePrice: 48000, sortOrder: 2 },
  { name: "Deluxe Glossy", description: "High-gloss vibrant prints", basePrice: 55000, sortOrder: 3 },
  { name: "Layflat Premium", description: "Layflat binding, seamless spreads", basePrice: 75000, sortOrder: 4 },
];

async function main() {
  for (const m of MATERIALS) {
    const existing = await prisma.material.findFirst({ where: { name: m.name } });
    if (existing) {
      await prisma.material.update({ where: { id: existing.id }, data: m });
      console.log("Updated:", m.name);
    } else {
      await prisma.material.create({ data: m });
      console.log("Created:", m.name);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
