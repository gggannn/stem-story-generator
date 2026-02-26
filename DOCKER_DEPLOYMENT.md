# Docker 部署指南 - STEM Story Generator

## 概述

本项目提供生产环境标准的 Docker 部署方案，支持容器化部署和阿里云 RDS MySQL 数据库对接。

---

## 快速开始

### 1. 准备环境配置文件

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑配置文件，填入实际配置
vim .env
```

### 2. 核心配置项

#### LLM API 配置（必需）
```bash
LLM_API_KEY=sk-your-api-key-here
LLM_ENDPOINT=https://api.openai.com/v1/chat/completions
LLM_MODEL=gpt-4o-mini
```

支持的服务商：
- **OpenAI**: 使用默认配置
- **Azure OpenAI**: 修改 `LLM_ENDPOINT` 为 Azure 端点
- **国产模型**: 修改为对应的兼容端点（如通义千问、DeepSeek 等）

#### 阿里云 RDS 配置
```bash
MYSQL_HOST=rm-xxxxx.rds.aliyuncs.com
MYSQL_PORT=3306
MYSQL_DATABASE=stem_stories
MYSQL_USER=your_username
MYSQL_PASSWORD=your_password
MYSQL_SSL=true
```

**获取阿里云 RDS 连接信息：**
1. 登录阿里云控制台 → RDS 管理控制台
2. 选择目标实例 → 查看连接信息
3. 确保白名单包含部署服务器 IP

### 3. 构建并启动

```bash
# 构建镜像并启动服务
docker-compose up -d --build

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f app
```

### 4. 验证部署

访问健康检查端点：
```bash
curl http://localhost:3000/api/health
```

预期返回：
```json
{
  "status": "healthy",
  "timestamp": "2024-02-24T...",
  "service": "stem-story-generator",
  "checks": {
    "database": { "connected": true, "host": "rm-xxxxx.rds.aliyuncs.com" },
    "llm": { "configured": true, "model": "gpt-4o-mini" }
  }
}
```

---

## 生产环境部署

### 部署到服务器

1. **上传代码到服务器**
   ```bash
   scp -r stem-story-generator/ user@your-server:/opt/app/
   ```

2. **配置环境变量**
   ```bash
   ssh user@your-server
   cd /opt/app/stem-story-generator
   vim .env
   ```

3. **启动服务**
   ```bash
   docker-compose up -d
   ```

### 使用 Nginx 反向代理

创建 Nginx 配置 `/etc/nginx/sites-available/stem-stories`：

```nginx
upstream stem_backend {
    server localhost:3000;
}

server {
    listen 80;
    server_name your-domain.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL 证书配置
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://stem_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/stem-stories /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 容器管理

### 常用命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart app

# 查看日志（最后 100 行）
docker-compose logs --tail=100 app

# 进入容器
docker-compose exec app sh

# 重新构建镜像
docker-compose build --no-cache app

# 清理未使用的镜像和容器
docker system prune -a
```

### 资源监控

```bash
# 查看容器资源使用情况
docker stats stem-story-generator

# 查看容器详细信息
docker inspect stem-story-generator
```

---

## 数据库迁移（如需要）

当前版本主要依赖 LLM API，如需添加 MySQL 持久化：

### 1. 创建数据库表

```sql
CREATE TABLE IF NOT EXISTS stories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mode VARCHAR(20) NOT NULL,
  age INT NOT NULL,
  topic VARCHAR(50) NOT NULL,
  content JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_topic (topic),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2. 配置连接池

在 `.env` 中调整：
```bash
DB_POOL_MIN=2
DB_POOL_MAX=10
```

---

## 安全建议

1. **密钥管理**
   - 不要将 `.env` 文件提交到 Git
   - 使用 Docker Secrets 或 Kubernetes Secrets 管理敏感信息
   - 定期轮换 API 密钥和数据库密码

2. **网络隔离**
   - 使用内部网络连接 RDS
   - 配置防火墙规则限制访问

3. **SSL/TLS**
   - RDS 连接启用 SSL (`MYSQL_SSL=true`)
   - 应用层使用 HTTPS

4. **更新维护**
   - 定期更新基础镜像：`docker-compose pull`
   - 监控安全漏洞：`docker scan stem-story-generator:latest`

---

## 故障排查

### 容器无法启动

```bash
# 查看详细日志
docker-compose logs app

# 检查端口占用
netstat -tulpn | grep 3000
```

### 无法连接 RDS

1. 检查白名单配置
2. 验证网络连通性：`telnet <RDS_ENDPOINT> 3306`
3. 确认 SSL 设置

### LLM API 调用失败

```bash
# 检查环境变量
docker-compose exec app env | grep LLM

# 测试 API 连接
curl -X POST $LLM_ENDPOINT \
  -H "Authorization: Bearer $LLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"test"}]}'
```

---

## 性能优化建议

1. **构建缓存**：利用 Docker 层缓存加速构建
2. **镜像瘦身**：已使用 multi-stage 构建优化
3. **资源限制**：根据实际负载调整 CPU/内存限制
4. **日志轮转**：配置日志驱动防止磁盘占满
5. **CDN 加速**：静态资源可接入阿里云 CDN

---

## 阿里云 RDS 接入完整示例

```bash
# .env 文件配置
MYSQL_HOST=rm-bp1xxxxx.mysql.rds.aliyuncs.com
MYSQL_PORT=3306
MYSQL_DATABASE=stem_stories
MYSQL_USER=stem_user
MYSQL_PASSWORD=YourSecurePassword123!
MYSQL_SSL=true

# 连接池配置
DB_POOL_MIN=5
DB_POOL_MAX=20
```

**白名单设置：**
- 在 RDS 控制台添加服务器公网 IP 到白名单
- 或使用 VPC 内网连接（推荐）

---

## 支持

如有问题，请提交 Issue 或联系维护团队。
