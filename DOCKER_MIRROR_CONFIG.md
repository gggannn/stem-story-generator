# Docker 镜像源配置指南

由于 Docker Hub (docker.io) 在国内无法直接访问，需要配置镜像源。

## 方案一：配置 Docker Desktop 镜像源（推荐）

1. 打开 Docker Desktop
2. 点击右上角齿轮图标 ⚙️ (Settings)
3. 选择 "Docker Engine"
4. 在 JSON 配置中添加以下内容：

```json
{
  "builder": {
    "gc": {
      "defaultKeepStorage": "20GB",
      "enabled": true
    }
  },
  "experimental": false,
  "registry-mirrors": [
    "https://docker.1panel.live",
    "https://docker.unsee.tech",
    "https://docker.ckyl.me"
  ]
}
```

5. 点击 "Apply & Restart"

## 方案二：命令行配置（Linux）

```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "registry-mirrors": [
    "https://docker.1panel.live"
  ]
}
EOF

sudo systemctl daemon-reload
sudo systemctl restart docker
```

验证配置：
```bash
docker info | grep -A 5 "Registry Mirrors"
```

## 方案三：使用阿里云容器镜像服务

1. 登录阿里云控制台
2. 搜索「容器镜像服务 ACR」
3. 获取专属镜像加速地址（类似 `https://xxxxxx.mirror.aliyuncs.com`）
4. 按方案一或方案二配置

## 配置完成后验证

```bash
# 测试拉取镜像
docker pull node:23-alpine

# 如果成功，则继续构建项目镜像
cd stem-story-generator
docker build -t stem-story-generator:test .
```

## 常用国内镜像源列表

| 镜像源 | 地址 |
|--------|------|
| 1Panel | https://docker.1panel.live |
| Unsee | https://docker.unsee.tech |
| CKYL | https://docker.ckyl.me |
| 阿里云 | https://[your-id].mirror.aliyuncs.com |

---

**配置完成后请重新运行验证脚本：**
```bash
bash scripts/verify-docker.sh
```
