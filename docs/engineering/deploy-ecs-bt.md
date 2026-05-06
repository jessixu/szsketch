# aiprint.hichara.com 部署手册

本文只记录当前建议采用的真实线上方案。

## 方案范围

- 产品：`szsketch`
- 对外域名：`aiprint.hichara.com`
- 服务器：Alibaba Cloud ECS
- 当前参考生产机公网 IP：`8.135.48.197`
- 面板：宝塔
- Web 层：宝塔 Nginx
- 应用层：Node.js + PM2
- Next.js 输出：`standalone`
- 应用目录：`/www/wwwroot/aiprint.hichara.com`
- PM2 应用名：`aiprint-web`
- 本机监听：`127.0.0.1:3000`
- 数据库：MySQL，优先阿里云 RDS

## 目录约定

- 项目根目录：`/www/wwwroot/aiprint.hichara.com`
- PM2 配置：`/www/wwwroot/aiprint.hichara.com/ecosystem.config.js`
- 生产环境变量：`/www/wwwroot/aiprint.hichara.com/.env.production`
- 上传目录：`/www/wwwroot/aiprint.hichara.com/uploads`
- 应用日志：`/www/wwwroot/aiprint.hichara.com/logs/pm2-out.log`
- 错误日志：`/www/wwwroot/aiprint.hichara.com/logs/pm2-error.log`
- Nginx 示例：仓库根目录 [nginx.conf](/Users/gan/szsketch/nginx.conf)

## 部署模型

1. 用户访问 `https://aiprint.hichara.com`
2. 阿里云 DNS 把域名解析到 ECS 公网 IP
3. 宝塔 Nginx 接收 `80/443`
4. Nginx 反向代理到 `127.0.0.1:3000`
5. PM2 托管 `.next/standalone/server.js`
6. 应用通过 `DATABASE_URL` 访问 MySQL 或 RDS

## 首次部署前提

服务器需要具备：

- Node.js 20+ 或更高
- npm
- PM2
- 宝塔 Nginx
- Git

网络与安全组要求：

- `80/443/22` 对外可用
- `3000` 不对公网开放
- 域名 `aiprint.hichara.com` 已解析到目标 ECS
- ECS 能访问目标 MySQL / RDS

## 生产环境变量

在服务器上手工创建：

```bash
/www/wwwroot/aiprint.hichara.com/.env.production
```

模板见：

- [.env.production.example](/Users/gan/szsketch/.env.production.example)

至少要填：

- `DATABASE_URL`
- `SESSION_SECRET`
- `ARK_API_KEY`
- `GLM_API_KEY`
- `UPLOAD_DIR=/www/wwwroot/aiprint.hichara.com/uploads`

## 首次部署步骤

### 1. 创建站点目录

```bash
mkdir -p /www/wwwroot/aiprint.hichara.com
mkdir -p /www/wwwroot/aiprint.hichara.com/logs
mkdir -p /www/wwwroot/aiprint.hichara.com/uploads
```

### 2. 复制并填写生产环境变量

把仓库中的 `.env.production.example` 内容写入服务器的 `.env.production`，再填真实值。

### 3. 准备本地 deploy 配置

复制：

```bash
cp deploy.env.example deploy.env.local
```

然后在本机填写：

- `ECS_PUBLIC_IP=8.135.48.197`
- `SSH_KEY_PATH`
- `PROJECT_DIR`

### 4. 通过标准脚本部署

```bash
npm run deploy:prod
```

该脚本会自动完成：

- 本地代码同步到 ECS
- 远端 `npm ci --include=dev`
- 远端 `npx prisma generate`
- 远端 `npx prisma migrate deploy`
- 远端 `npm run build`
- 远端 `pm2 reload/start`
- 健康检查

## 宝塔 / Nginx 配置

在宝塔里：

1. `网站 -> 添加站点`
2. 域名填 `aiprint.hichara.com`
3. 根目录填 `/www/wwwroot/aiprint.hichara.com`
4. SSL 里申请并启用证书
5. 配置文件参考仓库根目录 [nginx.conf](/Users/gan/szsketch/nginx.conf)

关键点：

- `/_next/static/` 允许缓存
- `/uploads/` 直接映射到本地目录
- 其余请求反代到 `http://127.0.0.1:3000`
- 保留 `Upgrade`、`Host`、`X-Forwarded-*` 头

## 发布后验证

服务器本机：

```bash
curl http://127.0.0.1:3000/api/health
pm2 status aiprint-web
```

公网验证：

```bash
curl -I https://aiprint.hichara.com
curl https://aiprint.hichara.com/api/health
```

## 注意事项

- 不在服务器目录里手工 `git pull` 做正式发布
- 不把真实生产密钥写入仓库或聊天记录
- 如果要导入学生账号，先完成数据库迁移，再用仓库里的 `scripts/add-user.ts`
