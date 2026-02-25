# ============================================
# Terraform 配置 - 阿里云杭州区域部署
# ============================================

terraform {
  required_version = ">= 1.0"
  required_providers {
    alicloud = {
      source  = "aliyun/alicloud"
      version = "~> 1.230"
    }
  }
}

# ============================================
# Provider 配置
# ============================================
provider "alicloud" {
  region = var.region
}

# ============================================
# 网络资源 - VPC
# ============================================
resource "alicloud_vpc" "main" {
  vpc_name   = "${var.project_name}-vpc"
  cidr_block = "10.0.0.0/16"

  tags = {
    Name  = "${var.project_name}-vpc"
    Project = var.project_name
  }
}

# ============================================
# 网络资源 - 交换机
# ============================================
resource "alicloud_vswitch" "main" {
  vpc_id     = alicloud_vpc.main.id
  cidr_block = "10.0.1.0/24"
  zone_id    = var.availability_zone

  vswitch_name = "${var.project_name}-vswitch"

  tags = {
    Name  = "${var.project_name}-vswitch"
    Project = var.project_name
  }
}

# ============================================
# 安全组
# ============================================
resource "alicloud_security_group" "main" {
  name   = "${var.project_name}-sg"
  vpc_id = alicloud_vpc.main.id

  tags = {
    Name  = "${var.project_name}-sg"
    Project = var.project_name
  }
}

# 安全组规则 - 允许特定来源 SSH 访问（可选限制来源 IP）
resource "alicloud_security_group_rule" "allow_ssh" {
  type              = "ingress"
  ip_protocol       = "tcp"
  port_range        = "22/22"
  security_group_id = alicloud_security_group.main.id
  cidr_ip           = var.ssh_source_cidr
  description       = "Allow SSH access"
}

# 安全组规则 - 允许 HTTP 访问
resource "alicloud_security_group_rule" "allow_http" {
  type              = "ingress"
  ip_protocol       = "tcp"
  port_range        = "80/80"
  security_group_id = alicloud_security_group.main.id
  cidr_ip           = "0.0.0.0/0"
  description       = "Allow HTTP access"
}

# 安全组规则 - 允许 HTTPS 访问
resource "alicloud_security_group_rule" "allow_https" {
  type              = "ingress"
  ip_protocol       = "tcp"
  port_range        = "443/443"
  security_group_id = alicloud_security_group.main.id
  cidr_ip           = "0.0.0.0/0"
  description       = "Allow HTTPS access"
}

# 安全组规则 - 允许所有出站流量
resource "alicloud_security_group_rule" "allow_all_outbound" {
  type              = "egress"
  ip_protocol       = "all"
  port_range        = "-1/-1"
  security_group_id = alicloud_security_group.main.id
  cidr_ip           = "0.0.0.0/0"
  description       = "Allow all outbound traffic"
}

# ============================================
# SSH 密钥对
# ============================================
resource "alicloud_key_pair" "deploy" {
  key_pair_name = "${var.project_name}-key"
  public_key    = var.ssh_public_key
}

# ============================================
# ECS 实例
# ============================================
resource "alicloud_instance" "main" {
  # 基础配置
  instance_name        = "${var.project_name}-ecs"
  image_id             = var.image_id
  instance_type        = var.instance_type
  availability_zone    = var.availability_zone

  # 网络配置
  vswitch_id           = alicloud_vswitch.main.id
  security_groups      = [alicloud_security_group.main.id]

  # 计费配置 - 按量付费
  instance_charge_type = "PostPaid"
  spot_strategy        = "NoSpot"

  # 认证配置
  key_name             = alicloud_key_pair.deploy.key_name

  # 系统盘配置
  system_disk_category = "cloud_essd"
  system_disk_size     = var.system_disk_size

  # 用户数据脚本 - 安装 Docker 和 Nginx
  user_data = file("${path.module}/user-data.sh")

  # 标签
  tags = {
    Name  = "${var.project_name}-ecs"
    Project = var.project_name
  }

  # 确保在公网 IP 分配后再启动
  depends_on = [alicloud_vswitch.main]
}

# ============================================
# 弹性公网 IP
# ============================================
resource "alicloud_eip" "main" {
  bandwidth            = var.eip_bandwidth
  internet_charge_type = "PayByTraffic"
  name                 = "${var.project_name}-eip"

  tags = {
    Name  = "${var.project_name}-eip"
    Project = var.project_name
  }
}

# 将 EIP 绑定到 ECS
resource "alicloud_eip_association" "main" {
  allocation_id        = alicloud_eip.main.id
  instance_id          = alicloud_instance.main.id
}

# ============================================
# 等待 ECS 完全启动
# ============================================
resource "time_sleep" "wait_for_ecs" {
  create_duration = "60s"
  depends_on      = [alicloud_eip_association.main]
}

# ============================================
# RDS MySQL 数据库实例
# ============================================
resource "alicloud_db_instance" "main" {
  engine               = "MySQL"
  engine_version       = "8.0"
  instance_type        = var.db_instance_type
  instance_storage     = var.db_storage
  instance_charge_type = "Postpaid"

  # 网络配置 - 使用现有 VPC
  vswitch_id           = alicloud_vswitch.main.id

  # 连接配置
  instance_name        = "${var.project_name}-rds"
  connection_string_prefix = "${var.project_name}-mysql"

  tags = {
    Name    = "${var.project_name}-rds"
    Project = var.project_name
  }

  # 防止意外删除 RDS（保护数据）
  lifecycle {
    prevent_destroy = true
  }
}

# ============================================
# RDS 数据库账户
# ============================================
resource "alicloud_db_account" "app_account" {
  db_instance_id = alicloud_db_instance.main.id
  account_name   = var.db_username
  account_password = var.db_password
  account_type   = "Normal"
  account_description = "Application database account"
}

# ============================================
# RDS 数据库（Schema）
# ============================================
resource "alicloud_db_database" "stem_stories" {
  instance_id = alicloud_db_instance.main.id
  name        = var.db_name
  character_set = "utf8mb4"
  description  = "STEM Story Generator Database"
}

# ============================================
# RDS 数据库权限
# ============================================
resource "alicloud_db_account_privilege" "app_privileges" {
  instance_id  = alicloud_db_instance.main.id
  account_name = var.db_username
  db_names     = [alicloud_db_database.stem_stories.name]
  privilege    = "ReadWrite"
}

# ============================================
# 注: RDS 访问控制通过 IP 白名单管理，不是安全组规则
# 请在阿里云控制台配置 RDS 白名单，添加 VPC CIDR (10.0.1.0/24)
# ============================================

# ============================================
# 等待 RDS 就绪
# ============================================
resource "time_sleep" "wait_for_rds" {
  create_duration = "180s"
  depends_on      = [alicloud_db_instance.main]
}
