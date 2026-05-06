# szsketch Git Flow 发布流程

## 核心原则

- `main` 只接收已经可上线的 release / hotfix 合并结果
- `develop` 是日常集成分支
- `release/*` 从 `develop` 拉出，只做发版收敛
- `hotfix/*` 从 `main` 拉出，只修线上阻断问题
- 服务器不是源码事实来源，正式部署统一走 [deploy.sh](/Users/gan/szsketch/deploy.sh)

## 标准发布命令

```bash
npm run release:start -- 0.1.0
npm run release:verify
npm run release:finish -- 0.1.0
git push origin main develop
git push origin v0.1.0
git push origin --delete release/0.1.0
git branch -d release/0.1.0
npm run deploy:prod
```

## 发布门禁

```bash
npm run release:verify
```

当前包含：

- `npm run test:deploy-readiness`
- `npm run lint`
- `npm run build`

## Hotfix 命令

```bash
npm run hotfix:start -- 0.1.1
npm run release:verify
npm run hotfix:finish -- 0.1.1
git push origin main develop
git push origin v0.1.1
git push origin --delete hotfix/0.1.1
git branch -d hotfix/0.1.1
npm run deploy:prod
```
