#!/bin/bash
# ============================================
# 阿里云 ECS 部署脚本
# ============================================
# 使用方法: bash scripts/deploy-aliyun.sh [环境]
# 示例: bash scripts/deploy-aliyun.sh production

set -e

# 配置
PROJECT_NAME="stem-story-generator"
REMOTE_USER="root"  # 修改为你的 ECS 用户名
REMOTE_HOST=""      # 修改为你的 ECS 公网 IP
REMOTE_PATH="/opt/app/$PROJECT_NAME"
DOCKER_COMPOSE_FILE="docker-compose.yml"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# 检查参数
if [ -z "$REMOTE_HOST" ]; then
  log_error "请先设置 REMOTE_HOST 变量"
  echo "编辑脚本: REMOTE_HOST=\"your-ecs-ip\""
  exit 1
fi

# 确认部署
log_warn "准备部署到: $REMOTE_USER@$REMOTE_HOST"
read -p "确认继续? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  log_info "部署已取消"
  exit 0
fi

# ============================================
# 1. 本地构建镜像
# ============================================
log_info "构建 Docker 镜像..."
docker build -t $PROJECT_NAME:latest .

# ============================================
# 2. 创建部署包
# ============================================
log_info "创建部署包..."
TMP_DIR=$(mktemp -d)
cp -r . $TMP_DIR/
cd $TMP_DIR
tar czf ../$PROJECT_NAME.tar.gz \
  Dockerfile \
  docker-compose.yml \
  .env.example \
  .next/static \
  public \
  src \
  package*.json \
  next.config.ts \
  tsconfig.json \
  postcss.config.mjs \
  eslint.config.mjs
cd -
rm -rf $TMP_DIR

# ============================================
# 3. 上传到服务器
# ============================================
log_info "上传文件到服务器..."
scp $PROJECT_NAME.tar.gz $REMOTE_USER@$REMOTE_HOST:/tmp/

# ============================================
# 4. 服务器端部署
# ============================================
log_info "服务器端部署..."
ssh $REMOTE_USER@$REMOTE_HOST << 'ENDSSH'
set -e

PROJECT_NAME="stem-story-generator"
REMOTE_PATH="/opt/app/$PROJECT_NAME"

# 创建目录
sudo mkdir -p $REMOTE_PATH

# 停止旧服务
cd $REMOTE_PATH
if [ -f docker-compose.yml ]; then
  sudo docker-compose down
fi

# 解压新文件
sudo tar xzf /tmp/$PROJECT_NAME.tar.gz -C $REMOTE_PATH

# 加载镜像
sudo docker load -i /tmp/$PROJECT_NAME.tar.gz

# 检查环境变量
if [ ! -f .env ]; then
  log_warn "未找到 .env 文件，使用模板创建..."
  sudo cp .env.example .env
  echo "请编辑 .env 文件填入实际配置"
fi

# 启动服务
sudo docker-compose up -d

# 清理
rm /tmp/$PROJECT_NAME.tar.gz

# 显示状态
sudo docker-compose ps
sudo docker-compose logs --tail=20
ENDSSH

# ============================================
# 5. 验证部署
# ============================================
log_info "验证部署..."
sleep 5
ssh $REMOTE_USER@$REMOTE_HOST "curl -sf http://localhost:3000/api/health | jq '.'"

log_info "部署完成！"
echo ""
echo "访问地址: http://$REMOTE_HOST:3000"
echo "查看日志: ssh $REMOTE_USER@$REMOTE_HOST 'cd $REMOTE_PATH && docker-compose logs -f'"
