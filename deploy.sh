#!/bin/bash
# 正式部署脚本：本地代码同步到阿里云 ECS，然后在远端执行 Prisma + Next.js + PM2 发布

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

REMOTE_USER="${REMOTE_USER:-root}"
REMOTE_HOST="${ECS_PUBLIC_IP:-}"
PROJECT_DIR="${PROJECT_DIR:-$SCRIPT_DIR}"
REMOTE_PROJECT_DIR="${REMOTE_PROJECT_DIR:-/www/wwwroot/aiprint.hichara.com}"
REMOTE_ENV_FILE="${REMOTE_ENV_FILE:-${REMOTE_PROJECT_DIR}/.env.production}"
PM2_APP_NAME="${PM2_APP_NAME:-aiprint-web}"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-http://127.0.0.1:3000/api/health}"

required_vars=(
  "SSH_KEY_PATH"
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

if [ ! -f "$SSH_KEY_PATH" ]; then
  log_error "SSH_KEY_PATH 不存在: $SSH_KEY_PATH"
  exit 1
fi

chmod 600 "$SSH_KEY_PATH" 2>/dev/null || true

SSH_OPTS=(-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=30 -i "$SSH_KEY_PATH")
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

log_step "检查 SSH 连接"
ssh "${SSH_OPTS[@]}" "$REMOTE_TARGET" "echo 'SSH 连接成功'" >/dev/null

log_step "检查远端运行依赖"
ssh "${SSH_OPTS[@]}" "$REMOTE_TARGET" "
  command -v node >/dev/null 2>&1 || { echo '缺少 node'; exit 1; }
  command -v npm >/dev/null 2>&1 || { echo '缺少 npm'; exit 1; }
  command -v pm2 >/dev/null 2>&1 || { echo '缺少 pm2'; exit 1; }
  [ -f '$REMOTE_ENV_FILE' ] || { echo '缺少 .env.production'; exit 1; }
"

log_step "同步代码到 ECS"
tar \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.env.local' \
  --exclude='.env.production' \
  --exclude='deploy.env.local' \
  --exclude='test-results' \
  --exclude='playwright-report' \
  --exclude='.DS_Store' \
  -czf - \
  -C "$PROJECT_DIR" . | ssh "${SSH_OPTS[@]}" "$REMOTE_TARGET" "
    mkdir -p '$REMOTE_PROJECT_DIR'
    tar -xzf - -C '$REMOTE_PROJECT_DIR'
  "

log_step "远端安装、构建并发布"
ssh "${SSH_OPTS[@]}" "$REMOTE_TARGET" "
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
ssh "${SSH_OPTS[@]}" "$REMOTE_TARGET" "
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
