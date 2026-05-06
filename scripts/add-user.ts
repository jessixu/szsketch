// Usage (run from project root):
//   npx tsx scripts/add-user.ts --add --username student01 --name "张同学" --class "高一(3)班"
//   npx tsx scripts/add-user.ts --reset --username student01
//   npx tsx scripts/add-user.ts --batch students.csv

import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";

const prisma = new PrismaClient();

async function addUser(username: string, displayName: string, className: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { username },
    update: { displayName, className, passwordHash },
    create: { username, displayName, className, passwordHash },
  });
  console.log(`✓ ${user.username} (${user.displayName}) - password: ${password}`);
}

async function batchAdd(csvPath: string) {
  const content = fs.readFileSync(csvPath, "utf-8");
  const lines = content.trim().split("\n").slice(1);
  for (const line of lines) {
    const [username, displayName, className, password] = line.split(",").map((s) => s.trim());
    if (username && displayName) {
      await addUser(username, displayName, className || "", password || `bz${username.slice(-3)}`);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const mode = args[0];

  if (mode === "--batch") {
    await batchAdd(args[1]);
  } else if (mode === "--add") {
    const username = args[args.indexOf("--username") + 1];
    const name = args[args.indexOf("--name") + 1];
    const className = args[args.indexOf("--class") + 1] || "";
    const password = args[args.indexOf("--password") + 1] || `bz${username.slice(-3)}`;
    await addUser(username, name, className, password);
  } else if (mode === "--reset") {
    const username = args[args.indexOf("--username") + 1];
    const password = args[args.indexOf("--password") + 1] || `bz${username.slice(-3)}`;
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { username }, data: { passwordHash } });
    console.log(`✓ ${username} password reset to: ${password}`);
  } else {
    console.log("Usage:");
    console.log("  npx tsx scripts/add-user.ts --add --username student01 --name '张同学' --class '高一(3)班'");
    console.log("  npx tsx scripts/add-user.ts --reset --username student01");
    console.log("  npx tsx scripts/add-user.ts --batch students.csv");
  }

  await prisma.$disconnect();
}

main();
