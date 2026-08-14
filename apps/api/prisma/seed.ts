import { hashPassword } from "../src/lib/auth.js";
import { prisma } from "../src/lib/prisma.js";

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@cafeconluna.com";
  const username = process.env.ADMIN_USERNAME ?? "admin";
  const password = process.env.ADMIN_PASSWORD ?? "changeme";

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { username },
    update: {},
    create: { email, username, passwordHash },
  });

  console.log(`Usuaria admin lista: ${user.username} (${user.email})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
