# EasyTeam 部署指南

> STEM Story Generator - 阿里云 ECS 部署文档

## 📋 目录

- [快速开始](#快速开始)
- [基础设施信息](#基础设施信息)
- [部署流程](#部署流程)
- [开机/关机流程](#开机关机流程)
- [常用命令](#常用命令)
- [故障排查](#故障排查)

---

## 🚀 快速开始

### 一键开机（完整部署流程）

```bash
# 1. 进入 terraform 目录并创建资源
cd /Users/jessi/ai-project/easysteam/terraform
export ALICLOUD_ACCESS_KEY="YOUR_ACCESS_KEY"
export ALICLOUD_SECRET_KEY="YOUR_SECRET_KEY"
/tmp/terraform apply -auto-approve

# 2. 返回项目根目录并运行部署脚本（自动获取 IP）
cd /Users/jessi/ai-project/easysteam
./deploy.sh

# 3. 验证访问（使用输出的 IP）
curl http://<输出的IP>/
```

> 💡 **提示**: `deploy.sh` 现在会自动从 Terraform 获取最新的 ECS IP，无需手动修改 `deploy.env`！

---

## 📦 基础设施信息

### 阿里云 ACR 配置

| 配置项 | 值 |
|--------|-----|
| Registry | `registry.cn-shanghai.aliyuncs.com` |
| 命名空间 | `easysteam-repo` |
| 镜像名 | `stem-story` |
| 用户名 | `jessihebe` |
| 密码 | `YOUR_ACR_PASSWORD` |

### ECS 配置

| 配置项 | 值 |
|--------|-----|
| 区域 | `cn-shanghai` |
| 可用区 | `cn-shanghai-b` |
| 实例规格 | `ecs.t6-c1m2.large` (2核4G) |
| 镜像 | `ubuntu_22_04_x64_20G_alibase_20260119.vhd` |
| 系统盘 | 40GB ESSD |
| 网络 | VPC + 交换机 + 安全组 |

### SSH 密钥

| 配置项 | 值 |
|--------|-----|
| 密钥名称 | `stem-story-key` |
| 私钥路径 | `~/.ssh/stem-story-key` |
| 公钥指纹 | `SHA256:h2J8g7v3Q4r2K8m9P1q7R3w6T5Y8n0` |

---

## 🔄 部署流程

### 1. 基础设施部署 (Terraform)

```bash
cd /Users/jessi/ai-project/easysteam/terraform

# 首次初始化
/tmp/terraform init

# 创建资源
export ALICLOUD_ACCESS_KEY="YOUR_ACCESS_KEY"
export ALICLOUD_SECRET_KEY="YOUR_SECRET_KEY"
/tmp/terraform apply -auto-approve
```

### 2. 构建并推送 Docker 镜像

```bash
cd /Users/jessi/ai-project/easysteam/stem-story-generator

# 构建并推送 AMD64 镜像（适配 ECS）
docker buildx build --platform linux/amd64 \
  -t registry.cn-shanghai.aliyuncs.com/easysteam-repo/stem-story:latest \
  --push .
```

### 3. 部署应用

```bash
cd /Users/jessi/ai-project/easysteam

# 更新 deploy.env 中的 ECS_PUBLIC_IP
# 然后运行部署脚本
./deploy.sh
```

---

## ⚡ 开机/关机流程

### 开机流程

1. **创建 ECS** (约 1-2 分钟)
   ```bash
   cd /Users/jessi/ai-project/easysteam/terraform
   /tmp/terraform apply -auto-approve
   ```

2. **部署应用** (约 30 秒) - **自动获取 IP**
   ```bash
   cd /Users/jessi/ai-project/easysteam
   ./deploy.sh
   ```

3. **验证访问**
   ```bash
   curl http://<输出的IP>/
   ```

### 关机流程（节约成本）

```bash
cd /Users/jessi/ai-project/easysteam/terraform
/tmp/terraform destroy -auto-approve
```

> ⚠️ **注意**: destroy 会删除所有资源，包括 ECS 实例、EIP、VPC 等。数据不会保留。

---

## 🛠️ 常用命令

### Terraform 命令

```bash
cd /Users/jessi/ai-project/easysteam/terraform

# 查看当前状态
/tmp/terraform show

# 查看输出（IP 地址等）
/tmp/terraform output

# 查看特定输出
/tmp/terraform output ecs_public_ip

# 刷新状态（不改变资源）
/tmp/terraform refresh

# 查看变更计划
/tmp/terraform plan
```

### ECS 操作

```bash
# SSH 连接
ssh -i ~/.ssh/stem-story-key root@<IP>

# 查看容器状态
ssh root@<IP> 'docker ps'

# 查看容器日志
ssh root@<IP> 'docker logs -f stem-story'

# 重启容器
ssh root@<IP> 'docker restart stem-story'

# 查看 Nginx 状态
ssh root@<IP> 'systemctl status nginx'
```

### Docker 操作

```bash
# 登录 ACR
echo "i!5vGdM!xmgZVp7" | docker login --username=jessihebe --password-stdin registry.cn-shanghai.aliyuncs.com

# 本地构建镜像
cd /Users/jessi/ai-project/easysteam/stem-story-generator
docker build -t stem-story:latest .

# 本地运行测试
docker run -p 3000:3000 stem-story:latest
```

---

## 🔍 故障排查

### 问题 1: Docker 镜像架构不匹配

**错误**: `no matching manifest for linux/amd64`

**解决**: 使用 `--platform linux/amd64` 构建和推送
```bash
docker buildx build --platform linux/amd64 \
  -t registry.cn-shanghai.aliyuncs.com/easysteam-repo/stem-story:latest \
  --push /Users/jessi/ai-project/easysteam/stem-story-generator
```

### 问题 2: SSH 连接失败

**检查**:
1. 确认 IP 地址正确
2. 确认私钥路径正确
3. 确认安全组开放 22 端口

### 问题 3: 应用无法访问

**检查步骤**:
1. 容器是否运行: `docker ps`
2. 容器日志: `docker logs stem-story`
3. Nginx 状态: `systemctl status nginx`
4. 安全组开放 80 端口

### 问题 4: Terraform 状态不一致

**解决**:
```bash
# 刷新状态
/tmp/terraform refresh

# 如果仍有问题，重新初始化
rm -rf .terraform
/tmp/terraform init
```

---

## 📁 项目结构

```
/Users/jessi/ai-project/easysteam/
├── deploy.sh              # 部署脚本
├── deploy.env             # 部署配置
├── DEPLOYMENT.md          # 本文档
├── terraform/
│   ├── main.tf           # Terraform 主配置
│   ├── variables.tf      # 变量定义
│   ├── outputs.tf        # 输出定义
│   ├── terraform.tfvars  # 变量值
│   └── user-data.sh      # ECS 初始化脚本 (Ubuntu)
└── stem-story-generator/
    ├── Dockerfile        # Docker 构建文件
    ├── package.json      # Node.js 依赖
    └── ...               # 源代码
```

---

## 📝 配置文件说明

### deploy.env 关键配置

```bash
# ACR 配置
ACR_NAMESPACE=easysteam-repo
ACR_USERNAME=jessihebe
ACR_PASSWORD=i!5vGdM!xmgZVp7

# ECS 配置
ECS_PUBLIC_IP=<需要更新为实际IP>
SSH_KEY_PATH=~/.ssh/stem-story-key

# Docker 镜像配置
IMAGE_NAME=stem-story
IMAGE_TAG=latest

# 项目路径
PROJECT_DIR=/Users/jessi/ai-project/easysteam/stem-story-generator
```

---

## 🎯 下次启动 Claude 时的提示

当你下次启动 Claude 时，可以这样说：

> "我有一个阿里云 ECS 部署项目，在 /Users/jessi/ai-project/easysteam/ 目录。请查看 DEPLOYMENT.md 了解部署流程。当前 ECS 已关机，需要开机并部署应用。"

然后 Claude 会：
1. 读取本文档了解配置
2. 执行 terraform apply 创建资源
3. 获取新 IP 并部署应用
4. 验证服务状态

---

## 📞 技术支持

- 阿里云文档: https://www.alibabacloud.com/help/zh/
- Terraform 文档: https://www.terraform.io/docs/
- Docker 文档: https://docs.docker.com/

---

*最后更新: 2026-02-24*
