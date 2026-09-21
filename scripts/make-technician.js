const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const password = process.argv[3] || "technician123";
  const name = process.argv[4] || "Technician";
  if (!email) {
    console.error("Usage: node scripts/make-technician.js email [password] [name]");
    process.exit(1);
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { role: "technician", active: true, passwordHash },
    });
    console.log("Updated to technician:", email);
  } else {
    await prisma.user.create({
      data: { email, name, passwordHash, role: "technician", active: true },
    });
    console.log("Created technician:", email);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
