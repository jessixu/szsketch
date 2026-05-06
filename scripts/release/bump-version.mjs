import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const version = process.argv[2];

if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
  console.error("Usage: node ./scripts/release/bump-version.mjs <x.y.z>");
  process.exit(1);
}

const root = resolve(process.cwd());
const packageJsonPath = resolve(root, "package.json");
const packageLockPath = resolve(root, "package-lock.json");

const writeJson = (path, data) => {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
};

const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
packageJson.version = version;
writeJson(packageJsonPath, packageJson);

const packageLock = JSON.parse(readFileSync(packageLockPath, "utf8"));
packageLock.version = version;

if (packageLock.packages?.[""]) {
  packageLock.packages[""].version = version;
}

writeJson(packageLockPath, packageLock);

console.log(`Bumped package.json and package-lock.json to ${version}`);
