#!/bin/bash
# ============================================
# ECS 用户数据脚本
# 功能: 安装 Docker 和 Nginx，配置反向代理
# ============================================

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ============================================
# 1. 配置 Docker 镜像加速（阿里云）
# ============================================
log_info "配置 Docker 镜像加速..."
mkdir -p /etc/docker
cat > /etc/docker/daemon.json <<EOF
{
  "registry-mirrors": [
    "https://registry.cn-shanghai.aliyuncs.com",
    "https://docker.mirrors.ustc.edu.cn"
  ],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

# ============================================
# 2. 安装 Docker
# ============================================
log_info "安装 Docker..."
if command -v docker &> /dev/null; then
    log_warn "Docker 已安装，跳过..."
else
    # 安装 Docker (Ubuntu)
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -qq > /dev/null 2>&1
    apt-get install -y -qq docker.io docker-compose > /dev/null 2>&1

    # 启动 Docker
    systemctl enable docker > /dev/null 2>&1
    systemctl start docker > /dev/null 2>&1

    log_info "Docker 安装完成！"
fi

# 验证 Docker
docker version || {
    log_error "Docker 安装失败！"
    exit 1
}

# ============================================
# 3. 安装 Nginx
# ============================================
log_info "安装 Nginx..."
if command -v nginx &> /dev/null; then
    log_warn "Nginx 已安装，跳过..."
else
    apt-get install -y -qq nginx > /dev/null 2>&1
    systemctl enable nginx > /dev/null 2>&1
    log_info "Nginx 安装完成！"
fi

# ============================================
# 4. 配置 Nginx 反向代理
# ============================================
log_info "配置 Nginx 反向代理..."

cat > /etc/nginx/conf.d/stem-story.conf <<'NGINX_CONF'
# STEM Story Generator - Nginx 反向代理配置

server {
    listen 80;
    server_name _;

    # 日志
    access_log /var/log/nginx/stem-story-access.log;
    error_log /var/log/nginx/stem-story-error.log;

    # 客户端最大请求体大小
    client_max_body_size 10M;

    # 代理到 Next.js 应用
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        # WebSocket 支持
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';

        # 标准代理头
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # 禁用缓存
        proxy_cache_bypass $http_upgrade;
    }

    # 健康检查端点
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
NGINX_CONF

# 删除默认配置 (Ubuntu 使用 sites-enabled)
rm -f /etc/nginx/sites-enabled/default

# 测试 Nginx 配置
nginx -t || {
    log_error "Nginx 配置有误！"
    exit 1
}

# 启动 Nginx
systemctl restart nginx
log_info "Nginx 配置完成！"

# ============================================
# 5. 配置防火墙 (Ubuntu 使用 ufw)
# ============================================
if command -v ufw &> /dev/null; then
    if ufw status | grep -q "Status: active"; then
        log_info "配置防火墙规则..."
        ufw allow 80/tcp > /dev/null 2>&1 || true
        ufw allow 443/tcp > /dev/null 2>&1 || true
        ufw allow 22/tcp > /dev/null 2>&1 || true
    fi
fi

# ============================================
# 6. 创建部署目录
# ============================================
log_info "创建部署目录..."
mkdir -p /opt/stem-story
mkdir -p /var/log/stem-story

# ============================================
# 完成信息
# ============================================
log_info "=========================================="
log_info "ECS 初始化完成！"
log_info "=========================================="
log_info "Docker 版本: $(docker --version | head -1)"
log_info "Nginx 版本: $(nginx -v 2>&1)"
log_info "=========================================="
