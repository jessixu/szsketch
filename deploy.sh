#!/bin/bash
# 正式部署脚本：本地代码同步到腾讯云服务器，然后在远端执行 Prisma + Next.js + PM2 发布

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_ENV="${SCRIPT_DIR}/deploy.env.local"

if [ ! -f "$DEPLOY_ENV" ]; then
  log_error "未找到 deploy.env.local"
  log_info "请复制 deploy.env.example 为 deploy.env.local，并填写服务器连接信息"
  exit 1
fi

source "$DEPLOY_ENV"

REMOTE_USER="${REMOTE_USER:-ubuntu}"
REMOTE_HOST="${ECS_PUBLIC_IP:-}"
PROJECT_DIR="${PROJECT_DIR:-$SCRIPT_DIR}"
REMOTE_PROJECT_DIR="${REMOTE_PROJECT_DIR:-/var/www/szsketch}"
REMOTE_ENV_FILE="${REMOTE_ENV_FILE:-${REMOTE_PROJECT_DIR}/.env}"
PM2_APP_NAME="${PM2_APP_NAME:-szsketch}"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-http://127.0.0.1:3000/api/health}"

required_vars=(
  "ECS_PUBLIC_IP"
  "PROJECT_DIR"
  "REMOTE_PROJECT_DIR"
  "REMOTE_ENV_FILE"
  "PM2_APP_NAME"
)

for var in "${required_vars[@]}"; do
  if [ -z "${!var:-}" ]; then
    log_error "缺少必要变量: $var"
    exit 1
  fi
done

if [ ! -d "$PROJECT_DIR" ]; then
  log_error "PROJECT_DIR 不存在: $PROJECT_DIR"
  exit 1
fi

SSH_OPTS=(-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=30)
SSH_CMD=(ssh "${SSH_OPTS[@]}")

if [ -n "${SSH_KEY_PATH:-}" ]; then
  if [ ! -f "$SSH_KEY_PATH" ]; then
    log_error "SSH_KEY_PATH 不存在: $SSH_KEY_PATH"
    exit 1
  fi
  chmod 600 "$SSH_KEY_PATH" 2>/dev/null || true
  SSH_CMD=(ssh "${SSH_OPTS[@]}" -i "$SSH_KEY_PATH")
elif [ -n "${SSH_PASSWORD:-}" ]; then
  if ! command -v sshpass >/dev/null 2>&1; then
    log_error "使用 SSH_PASSWORD 需要先安装 sshpass"
    exit 1
  fi
  export SSHPASS="$SSH_PASSWORD"
  SSH_CMD=(sshpass -e ssh "${SSH_OPTS[@]}")
else
  log_error "请在 deploy.env.local 中配置 SSH_KEY_PATH 或 SSH_PASSWORD"
  exit 1
fi

REMOTE_TARGET="${REMOTE_USER}@${REMOTE_HOST}"

log_step "检查本地项目状态"
cd "$PROJECT_DIR"
if [ ! -f "package.json" ] || [ ! -f "ecosystem.config.js" ]; then
  log_error "PROJECT_DIR 不是可部署的 szsketch 仓库根目录"
  exit 1
fi

log_info "发布模式: 本地 git flow 冻结 + deploy.sh 远端部署"
log_info "本地项目目录: $PROJECT_DIR"
log_info "目标服务器: $REMOTE_TARGET"
log_info "目标目录: $REMOTE_PROJECT_DIR"

if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  log_error "存在未提交的已跟踪文件变更。请先提交代码再部署，避免线上版本和 git 不一致。"
  git status --short --untracked-files=no
  exit 1
fi

log_step "检查 SSH 连接"
"${SSH_CMD[@]}" "$REMOTE_TARGET" "echo 'SSH 连接成功'" >/dev/null

log_step "检查远端运行依赖"
"${SSH_CMD[@]}" "$REMOTE_TARGET" "
  command -v node >/dev/null 2>&1 || { echo '缺少 node'; exit 1; }
  command -v npm >/dev/null 2>&1 || { echo '缺少 npm'; exit 1; }
  command -v pm2 >/dev/null 2>&1 || { echo '缺少 pm2'; exit 1; }
  [ -f '$REMOTE_ENV_FILE' ] || { echo '缺少生产环境变量文件: $REMOTE_ENV_FILE'; exit 1; }
"

log_step "同步代码到 ECS"
git archive --format=tar HEAD | gzip | "${SSH_CMD[@]}" "$REMOTE_TARGET" "
    mkdir -p '$REMOTE_PROJECT_DIR'
    tar -xzf - -C '$REMOTE_PROJECT_DIR'
  "

log_step "远端安装、构建并发布"
"${SSH_CMD[@]}" "$REMOTE_TARGET" "
  set -euo pipefail
  cd '$REMOTE_PROJECT_DIR'
  mkdir -p logs uploads

  set -a
  source '$REMOTE_ENV_FILE'
  set +a

  npm ci --include=dev
  npx prisma generate
  npx prisma migrate deploy
  npm run build

  if pm2 describe '$PM2_APP_NAME' >/dev/null 2>&1; then
    pm2 reload ecosystem.config.js --update-env
  else
    pm2 start ecosystem.config.js
  fi

  pm2 save

  if command -v bt >/dev/null 2>&1; then
    bt reload >/dev/null 2>&1 || true
  fi
"

log_step "验证部署结果"
"${SSH_CMD[@]}" "$REMOTE_TARGET" "
  set -e
  curl -fsS '$HEALTHCHECK_URL'
  pm2 status '$PM2_APP_NAME'
"

echo ""
echo "============================================"
echo -e "${GREEN}部署完成${NC}"
echo "============================================"
echo "服务器: ${REMOTE_TARGET}"
echo "目录: ${REMOTE_PROJECT_DIR}"
echo "PM2 应用: ${PM2_APP_NAME}"
echo "健康检查: ${HEALTHCHECK_URL}"
echo "============================================"
