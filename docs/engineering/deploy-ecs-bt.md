# szai.club 部署手册

本文只记录当前建议采用的真实线上方案。

## 方案范围

- 产品：`szsketch`
- 对外域名：`https://szai.club/`
- 服务器：腾讯云服务器
- 当前生产机公网 IP：`43.134.183.223`
- SSH 用户：`ubuntu`
- Web 层：Nginx
- 应用层：Node.js + PM2
- 应用目录：`/var/www/szsketch`
- PM2 应用名：`szsketch`
- 本机监听：`127.0.0.1:3000`
- 健康检查：`https://szai.club/api/health`

## 目录约定

- 项目根目录：`/var/www/szsketch`
- PM2 配置：`/var/www/szsketch/ecosystem.config.js`
- 生产环境变量：`/var/www/szsketch/.env`
- 上传目录：`/var/www/szsketch/uploads`
- 应用日志：`/var/log/szsketch/out.log`
- 错误日志：`/var/log/szsketch/error.log`
- Nginx 示例：仓库根目录 [nginx.conf](/Users/jessi/ai-project/szsketch/nginx.conf)

## 部署模型

1. 用户访问 `https://szai.club/`
2. DNS 把域名解析到腾讯云服务器公网 IP
3. Nginx 接收 `80/443`
4. Nginx 反向代理到 `127.0.0.1:3000`
5. PM2 托管 `next start -p 3000`
6. 应用通过 `DATABASE_URL` 访问数据库

## 首次部署前提

服务器需要具备：

- Node.js 20+ 或更高
- npm
- PM2
- Nginx
- Git

网络与安全组要求：

- `80/443/22` 对外可用
- `3000` 不对公网开放
- 域名 `szai.club` 已解析到 `43.134.183.223`
- 服务器能访问目标数据库和 AI 服务

## 生产环境变量

在服务器上手工创建：

```bash
/var/www/szsketch/.env
```

模板见：

- [.env.production.example](/Users/jessi/ai-project/szsketch/.env.production.example)

至少要填：

- `DATABASE_URL`
- `SESSION_SECRET`
- `ARK_API_KEY`
- `GLM_API_KEY`
- `UPLOAD_DIR=/var/www/szsketch/uploads`

## 首次部署步骤

### 1. 创建站点目录

```bash
sudo mkdir -p /var/www/szsketch
sudo mkdir -p /var/log/szsketch
sudo mkdir -p /var/www/szsketch/uploads
sudo chown -R ubuntu:ubuntu /var/www/szsketch /var/log/szsketch
```

### 2. 复制并填写生产环境变量

把仓库中的 `.env.production.example` 内容写入服务器的 `/var/www/szsketch/.env`，再填真实值。

### 3. 准备本地 deploy 配置

复制：

```bash
cp deploy.env.example deploy.env.local
```

然后在本机填写：

- `ECS_PUBLIC_IP=43.134.183.223`
- `REMOTE_USER=ubuntu`
- `PROJECT_DIR=/Users/jessi/ai-project/szsketch`
- `REMOTE_PROJECT_DIR=/var/www/szsketch`
- `REMOTE_ENV_FILE=/var/www/szsketch/.env`
- `PM2_APP_NAME=szsketch`

SSH 登录二选一：

- 有密钥时填写 `SSH_KEY_PATH`
- 使用密码时只在本机 `deploy.env.local` 填写 `SSH_PASSWORD`，不要提交到 git

### 4. 通过标准脚本部署

```bash
npm run deploy:prod
```

该脚本会自动完成：

- 用 `git archive HEAD` 同步已提交代码到服务器
- 远端 `npm ci --include=dev`
- 远端 `npx prisma generate`
- 远端 `npx prisma migrate deploy`
- 远端 `npm run build`
- 远端 `pm2 reload/start`
- 健康检查

## Nginx 配置

关键点：

- `/_next/static/` 允许缓存
- `/uploads/` 直接映射到本地目录
- 其余请求反代到 `http://127.0.0.1:3000`
- 保留 `Upgrade`、`Host`、`X-Forwarded-*` 头

## 发布后验证

服务器本机：

```bash
curl http://127.0.0.1:3000/api/health
pm2 status szsketch
```

公网验证：

```bash
curl -I https://szai.club/
curl https://szai.club/api/health
curl -I https://szai.club/animal_img/baize.png
```

## 注意事项

- 不在服务器目录里手工 `git pull` 做正式发布
- 正式部署前先提交代码；脚本只发布 `HEAD`，不会发布未提交改动或未跟踪素材
- 不把真实生产密钥写入仓库或聊天记录
- 根目录原始 `animal_img/` 不提交；山海经页面缩略图依赖已提交的 `public/animal_img/`
- 如果要导入学生账号，先完成数据库迁移，再用仓库里的 `scripts/add-user.ts`
