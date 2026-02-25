#!/bin/bash
# ============================================
# 阿里云 ECS + ACR 部署脚本
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 日志函数
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

# ============================================
# 1. 加载环境变量
# ============================================
log_step "加载部署配置..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_ENV="${SCRIPT_DIR}/deploy.env"

if [ ! -f "$DEPLOY_ENV" ]; then
    log_error "未找到 deploy.env 文件！"
    log_info "请复制 deploy.env.example 为 deploy.env 并填写配置"
    exit 1
fi

source "$DEPLOY_ENV"

# ============================================
# 自动从 Terraform 获取 ECS IP (如果未设置)
# ============================================
if [ -z "$ECS_PUBLIC_IP" ] || [ "$ECS_PUBLIC_IP" = "" ]; then
    log_info "ECS_PUBLIC_IP 未设置，尝试从 Terraform 获取..."

    TERRAFORM_DIR="${SCRIPT_DIR}/terraform"
    TERRAFORM_BIN="${TERRAFORM_DIR}/terraform"

    # 使用 terraform binary 如果存在，否则使用系统 terraform
    if [ -f "$TERRAFORM_BIN" ]; then
        TERRAFORM_CMD="$TERRAFORM_BIN"
    else
        TERRAFORM_CMD="terraform"
    fi

    # 检查是否在 terraform 目录或有 state
    if [ -f "${TERRAFORM_DIR}/terraform.tfstate" ] || $TERRAFORM_CMD state list &>/dev/null; then
        NEW_IP=$($TERRAFORM_CMD -chdir="$TERRAFORM_DIR" output -raw ecs_public_ip 2>/dev/null | tr -d '"')

        if [ -n "$NEW_IP" ] && [ "$NEW_IP" != "" ]; then
            ECS_PUBLIC_IP="$NEW_IP"
            log_info "✅ 自动获取到 ECS IP: ${ECS_PUBLIC_IP}"

            # 更新 deploy.env 文件
            if sed --version 2>/dev/null | grep -q GNU; then
                sed -i "s/^ECS_PUBLIC_IP=.*/ECS_PUBLIC_IP=${ECS_PUBLIC_IP}/" "$DEPLOY_ENV"
            else
                sed -i '' "s/^ECS_PUBLIC_IP=.*/ECS_PUBLIC_IP=${ECS_PUBLIC_IP}/" "$DEPLOY_ENV"
            fi
        else
            log_error "无法从 Terraform 获取 IP，请确保 ECS 已创建"
            exit 1
        fi
    else
        log_error "未找到 Terraform state，请先运行 'terraform apply'"
        exit 1
    fi
fi

# 验证必要变量
required_vars=(
    "ACR_NAMESPACE"
    "ACR_USERNAME"
    "ACR_PASSWORD"
    "SSH_KEY_PATH"
    "ECS_PUBLIC_IP"
    "PROJECT_DIR"
    "MYSQL_HOST"
    "MYSQL_PORT"
    "MYSQL_DATABASE"
    "MYSQL_USER"
    "MYSQL_PASSWORD"
    "JWT_SECRET"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        log_error "缺少必要变量: $var"
        exit 1
    fi
done

# 配置变量
ACR_REGISTRY="registry.cn-shanghai.aliyuncs.com"
IMAGE_NAME="${IMAGE_NAME:-stem-story}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
FULL_IMAGE="${ACR_REGISTRY}/${ACR_NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG}"

log_info "配置加载成功:"
log_info "  - ACR Registry: ${ACR_REGISTRY}"
log_info "  - Namespace: ${ACR_NAMESPACE}"
log_info "  - Image: ${IMAGE_NAME}:${IMAGE_TAG}"
log_info "  - ECS IP: ${ECS_PUBLIC_IP}"

# ============================================
# 2. 检查 Docker
# ============================================
log_step "检查 Docker 环境..."

if ! command -v docker &> /dev/null; then
    log_error "Docker 未安装！请先安装 Docker"
    exit 1
fi

if ! docker info &> /dev/null; then
    log_error "Docker 未运行！请启动 Docker"
    exit 1
fi

log_info "Docker 环境: $(docker --version | head -1)"

# ============================================
# 3. 检查 SSH 密钥
# ============================================
log_step "检查 SSH 密钥..."

if [ ! -f "$SSH_KEY_PATH" ]; then
    log_error "SSH 密钥文件不存在: $SSH_KEY_PATH"
    exit 1
fi

# 设置正确的权限
chmod 600 "$SSH_KEY_PATH" 2>/dev/null || true
log_info "SSH 密钥: $SSH_KEY_PATH"

# ============================================
# 4. 构建 Docker 镜像
# ============================================
log_step "构建 Docker 镜像..."

cd "$PROJECT_DIR"

if [ ! -f "Dockerfile" ]; then
    log_error "未找到 Dockerfile！"
    exit 1
fi

log_info "开始构建镜像 (AMD64 架构，适配 ECS)..."
docker buildx build \
    --platform linux/amd64 \
    --load \
    -t "${IMAGE_NAME}:${IMAGE_TAG}" \
    -t "${FULL_IMAGE}" \
    .

if [ $? -ne 0 ]; then
    log_error "镜像构建失败！"
    exit 1
fi

log_info "镜像构建成功！"

# ============================================
# 5. 登录阿里云 ACR
# ============================================
log_step "登录阿里云 ACR..."

log_info "登录到 ${ACR_REGISTRY}..."
echo "$ACR_PASSWORD" | docker login \
    --username="$ACR_USERNAME" \
    --password-stdin \
    "$ACR_REGISTRY"

if [ $? -ne 0 ]; then
    log_error "ACR 登录失败！请检查用户名和密码"
    exit 1
fi

log_info "ACR 登录成功！"

# ============================================
# 6. 推送镜像到 ACR
# ============================================
log_step "推送镜像到 ACR..."

log_info "推送镜像: ${FULL_IMAGE}"
docker push "${FULL_IMAGE}"

if [ $? -ne 0 ]; then
    log_error "镜像推送失败！"
    exit 1
fi

log_info "镜像推送成功！"

# ============================================
# 7. 在 ECS 上部署容器
# ============================================
log_step "在 ECS 上部署容器..."

SSH_OPTS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=30"

# 检查 SSH 连接
log_info "测试 SSH 连接..."
ssh $SSH_OPTS -i "$SSH_KEY_PATH" "root@${ECS_PUBLIC_IP}" "echo 'SSH 连接成功！'"

if [ $? -ne 0 ]; then
    log_error "SSH 连接失败！请检查:"
    log_error "  1. ECS IP 是否正确: ${ECS_PUBLIC_IP}"
    log_error "  2. SSH 密钥是否正确: $SSH_KEY_PATH"
    log_error "  3. 安全组是否开放 22 端口"
    exit 1
fi

# 部署脚本
DEPLOY_COMMANDS=$(cat <<'ENDSSH'
set -e

echo "=> 登录 ACR..."
echo "$ACR_PASSWORD" | docker login --username="$ACR_USERNAME" --password-stdin "$ACR_REGISTRY"

echo "=> 停止旧容器..."
docker stop "$IMAGE_NAME" 2>/dev/null || true
docker rm "$IMAGE_NAME" 2>/dev/null || true

echo "=> 拉取新镜像..."
docker pull "$FULL_IMAGE"

echo "=> 启动新容器..."
docker run -d \
    --name "$IMAGE_NAME" \
    --restart=always \
    -p 127.0.0.1:3000:3000 \
    -e NODE_ENV=production \
    -e MYSQL_HOST="$MYSQL_HOST" \
    -e MYSQL_PORT="$MYSQL_PORT" \
    -e MYSQL_DATABASE="$MYSQL_DATABASE" \
    -e MYSQL_USER="$MYSQL_USER" \
    -e MYSQL_PASSWORD="$MYSQL_PASSWORD" \
    -e MYSQL_SSL="$MYSQL_SSL" \
    -e DB_POOL_MIN="$DB_POOL_MIN" \
    -e DB_POOL_MAX="$DB_POOL_MAX" \
    -e JWT_SECRET="$JWT_SECRET" \
    "$FULL_IMAGE"

echo "=> 等待容器启动..."
sleep 5

echo "=> 检查容器状态..."
docker ps --filter "name=$IMAGE_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo "=> 检查应用健康..."
curl -f -s http://127.0.0.1:3000/ > /dev/null && echo "✅ 应用运行正常！" || echo "⚠️  应用可能未就绪，请稍后检查"

echo "=> 清理旧镜像..."
docker image prune -af --filter "until=24h" || true
ENDSSH
)

log_info "执行部署命令..."
ssh $SSH_OPTS -i "$SSH_KEY_PATH" "root@${ECS_PUBLIC_IP}" "export ACR_REGISTRY='${ACR_REGISTRY}' ACR_USERNAME='${ACR_USERNAME}' ACR_PASSWORD='${ACR_PASSWORD}' IMAGE_NAME='${IMAGE_NAME}' FULL_IMAGE='${FULL_IMAGE}' MYSQL_HOST='${MYSQL_HOST}' MYSQL_PORT='${MYSQL_PORT}' MYSQL_DATABASE='${MYSQL_DATABASE}' MYSQL_USER='${MYSQL_USER}' MYSQL_PASSWORD='${MYSQL_PASSWORD}' MYSQL_SSL='${MYSQL_SSL}' DB_POOL_MIN='${DB_POOL_MIN}' DB_POOL_MAX='${DB_POOL_MAX}' JWT_SECRET='${JWT_SECRET}'; ${DEPLOY_COMMANDS}"

if [ $? -ne 0 ]; then
    log_error "ECS 部署失败！"
    exit 1
fi

# ============================================
# 8. 验证部署
# ============================================
log_step "验证部署..."

sleep 3

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://${ECS_PUBLIC_IP}/" --max-time 10 || echo "000")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    log_info "HTTP 响应: ${HTTP_CODE}"
else
    log_warn "HTTP 响应: ${HTTP_CODE} (可能需要等待应用启动)"
fi

# ============================================
# 9. 完成
# ============================================
echo ""
log_info "=========================================="
log_info "🎉 部署完成！"
log_info "=========================================="
log_info "🌐 访问地址: http://${ECS_PUBLIC_IP}/"
log_info "📱 应用端口: 3000 (通过 Nginx 代理)"
log_info ""
log_info "查看日志:"
log_info "  ssh -i ${SSH_KEY_PATH} root@${ECS_PUBLIC_IP} 'docker logs -f ${IMAGE_NAME}'"
log_info ""
log_info "查看容器状态:"
log_info "  ssh -i ${SSH_KEY_PATH} root@${ECS_PUBLIC_IP} 'docker ps'"
log_info "=========================================="
