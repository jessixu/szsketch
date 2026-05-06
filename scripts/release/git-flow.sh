#!/bin/bash

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }
log_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

usage() {
  cat <<'EOF'
Usage:
  bash ./scripts/release/git-flow.sh start-release <x.y.z>
  bash ./scripts/release/git-flow.sh finish-release <x.y.z>
  bash ./scripts/release/git-flow.sh start-hotfix <x.y.z>
  bash ./scripts/release/git-flow.sh finish-hotfix <x.y.z>

Examples:
  npm run release:start -- 0.1.0
  npm run release:finish -- 0.1.0
  npm run hotfix:start -- 0.1.1
  npm run hotfix:finish -- 0.1.1
EOF
}

ensure_clean_worktree() {
  if [ -n "$(git status --porcelain)" ]; then
    log_error "工作区不干净，请先提交或暂存改动。"
    exit 1
  fi
}

ensure_version() {
  local version="$1"

  if [[ ! "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    log_error "版本号必须是 x.y.z 形式，例如 0.1.0。"
    exit 1
  fi
}

ensure_remote_branch() {
  local branch="$1"

  if ! git ls-remote --exit-code --heads origin "$branch" >/dev/null 2>&1; then
    log_error "远端缺少 origin/$branch，请先推送或确认仓库初始化。"
    exit 1
  fi
}

checkout_tracking_branch() {
  local branch="$1"

  if git show-ref --verify --quiet "refs/heads/$branch"; then
    git checkout "$branch"
  else
    git checkout -b "$branch" "origin/$branch"
  fi
}

ensure_branch_missing() {
  local branch="$1"

  if git show-ref --verify --quiet "refs/heads/$branch"; then
    log_error "本地已存在分支 $branch。"
    exit 1
  fi

  if git ls-remote --exit-code --heads origin "$branch" >/dev/null 2>&1; then
    log_error "远端已存在分支 $branch。"
    exit 1
  fi
}

ensure_local_branch() {
  local branch="$1"

  if ! git show-ref --verify --quiet "refs/heads/$branch"; then
    log_error "本地缺少分支 $branch。"
    exit 1
  fi
}

ensure_tag_missing() {
  local tag="$1"

  if git rev-parse "$tag" >/dev/null 2>&1; then
    log_error "tag $tag 已存在。"
    exit 1
  fi
}

current_version() {
  node -p "require('./package.json').version"
}

sync_branch() {
  local branch="$1"

  ensure_remote_branch "$branch"
  checkout_tracking_branch "$branch"
  git pull --ff-only origin "$branch"
}

bump_version() {
  local version="$1"

  node "${SCRIPT_DIR}/bump-version.mjs" "$version"
  git add package.json package-lock.json
}

start_release() {
  local version="$1"
  local release_branch="release/$version"

  ensure_version "$version"
  ensure_clean_worktree

  log_step "同步 develop"
  git fetch origin --tags
  ensure_branch_missing "$release_branch"
  sync_branch "develop"

  log_step "创建 $release_branch"
  git checkout -b "$release_branch"

  log_step "更新版本号到 $version"
  bump_version "$version"
  git commit -m "chore(release): bump version to $version"

  log_info "已创建 $release_branch。"
  echo "下一步："
  echo "  1. 在 $release_branch 上只做发版收敛改动"
  echo "  2. 执行 npm run release:verify"
  echo "  3. 执行 npm run release:finish -- $version"
}

finish_release() {
  local version="$1"
  local release_branch="release/$version"
  local tag="v$version"

  ensure_version "$version"
  ensure_clean_worktree
  ensure_local_branch "$release_branch"
  ensure_tag_missing "$tag"

  log_step "校验 $release_branch"
  git checkout "$release_branch"

  if [ "$(current_version)" != "$version" ]; then
    log_error "$release_branch 上的 package.json 版本不是 $version。"
    exit 1
  fi

  log_step "同步 main 并合并 $release_branch"
  git fetch origin --tags
  sync_branch "main"
  git merge --no-ff "$release_branch" -m "release: merge $release_branch into main"

  log_step "打 tag $tag"
  git tag -a "$tag" -m "$tag"

  log_step "回合并到 develop"
  sync_branch "develop"
  git merge --no-ff main -m "chore: back-merge main ($tag) into develop"

  log_info "release 已在本地完成。"
  echo "接下来建议执行："
  echo "  git push origin main develop"
  echo "  git push origin $tag"
  echo "  git push origin --delete $release_branch"
  echo "  git branch -d $release_branch"
  echo "  npm run deploy:prod"
}

start_hotfix() {
  local version="$1"
  local hotfix_branch="hotfix/$version"

  ensure_version "$version"
  ensure_clean_worktree

  log_step "同步 main"
  git fetch origin --tags
  ensure_branch_missing "$hotfix_branch"
  sync_branch "main"

  log_step "创建 $hotfix_branch"
  git checkout -b "$hotfix_branch"

  log_step "更新版本号到 $version"
  bump_version "$version"
  git commit -m "chore(hotfix): bump version to $version"

  log_info "已创建 $hotfix_branch。"
  echo "下一步："
  echo "  1. 在 $hotfix_branch 上只修线上阻断问题"
  echo "  2. 执行 npm run release:verify"
  echo "  3. 执行 npm run hotfix:finish -- $version"
}

finish_hotfix() {
  local version="$1"
  local hotfix_branch="hotfix/$version"
  local tag="v$version"

  ensure_version "$version"
  ensure_clean_worktree
  ensure_local_branch "$hotfix_branch"
  ensure_tag_missing "$tag"

  log_step "校验 $hotfix_branch"
  git checkout "$hotfix_branch"

  if [ "$(current_version)" != "$version" ]; then
    log_error "$hotfix_branch 上的 package.json 版本不是 $version。"
    exit 1
  fi

  log_step "同步 main 并合并 $hotfix_branch"
  git fetch origin --tags
  sync_branch "main"
  git merge --no-ff "$hotfix_branch" -m "hotfix: merge $hotfix_branch into main"

  log_step "打 tag $tag"
  git tag -a "$tag" -m "$tag"

  log_step "回合并到 develop"
  sync_branch "develop"
  git merge --no-ff main -m "chore: back-merge main ($tag) into develop"

  log_info "hotfix 已在本地完成。"
  echo "接下来建议执行："
  echo "  git push origin main develop"
  echo "  git push origin $tag"
  echo "  git push origin --delete $hotfix_branch"
  echo "  git branch -d $hotfix_branch"
  echo "  npm run deploy:prod"
}

main() {
  local command="${1:-}"
  local version="${2:-}"

  if [ -z "$command" ] || [ -z "$version" ]; then
    usage
    exit 1
  fi

  cd "$REPO_ROOT"

  case "$command" in
    start-release)
      start_release "$version"
      ;;
    finish-release)
      finish_release "$version"
      ;;
    start-hotfix)
      start_hotfix "$version"
      ;;
    finish-hotfix)
      finish_hotfix "$version"
      ;;
    *)
      usage
      exit 1
      ;;
  esac
}

main "$@"
