import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const readFile = (path) => readFileSync(path, "utf8");

const packageJson = JSON.parse(readFile("package.json"));
const nextConfig = readFile("next.config.ts");
const deployScript = readFile("deploy.sh");
const ecosystemConfig = readFile("ecosystem.config.js");
const gitignore = readFile(".gitignore");
const proxy = readFile("src/proxy.ts");

assert.equal(packageJson.scripts["deploy:prod"], "bash ./deploy.sh", "package.json 必须提供 deploy:prod");
assert.equal(packageJson.scripts["release:start"], "bash ./scripts/release/git-flow.sh start-release", "package.json 必须提供 release:start");
assert.equal(packageJson.scripts["release:finish"], "bash ./scripts/release/git-flow.sh finish-release", "package.json 必须提供 release:finish");
assert.equal(packageJson.scripts["test:deploy-readiness"], "node ./scripts/test-deploy-readiness.mjs", "package.json 必须提供 test:deploy-readiness");
assert.match(nextConfig, /output:\s*"standalone"/, "next.config.ts 必须启用 standalone 输出");
assert.match(deployScript, /deploy\.env\.local/, "deploy.sh 必须读取 deploy.env.local");
assert.match(deployScript, /npx prisma migrate deploy/, "deploy.sh 必须执行 Prisma migrate deploy");
assert.match(deployScript, /npm run build/, "deploy.sh 必须执行生产构建");
assert.match(deployScript, /pm2 reload ecosystem\.config\.js --update-env/, "deploy.sh 必须通过 PM2 reload 发布");
assert.match(ecosystemConfig, /aiprint-web/, "ecosystem.config.js 必须声明 aiprint-web");
assert.match(gitignore, /^deploy\.env\.local$/m, ".gitignore 必须忽略 deploy.env.local");
assert.match(proxy, /pathname\.startsWith\("\/api\/health"\)/, "proxy 必须放行 /api/health 健康检查");

console.log("deploy readiness tests passed");
