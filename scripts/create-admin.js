const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = (process.argv[2] || "cholachelaphotography@gmail.com").toLowerCase();
  const password = process.argv[3] || "Qwerty@12345";
  const name = process.argv[4] || "Chola Chela";

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: "admin",
      name,
    },
    create: {
      email,
      name,
      passwordHash,
      role: "admin",
    },
  });

  console.log("OK");
  console.log("Email:", user.email);
  console.log("Role:", user.role);
}

main()
  .catch((e) => {
    console.error("FAILED:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
