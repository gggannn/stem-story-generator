# ============================================
# Terraform 变量定义
# ============================================

variable "region" {
  description = "阿里云区域"
  type        = string
  default     = "cn-shanghai"
}

variable "availability_zone" {
  description = "可用区"
  type        = string
  default     = "cn-shanghai-b"
}

variable "project_name" {
  description = "项目名称，用于命名资源"
  type        = string
  default     = "stem-story"
}

# ============================================
# ECS 实例配置
# ============================================
variable "instance_type" {
  description = "ECS 实例规格 (按量计费最小规格)"
  type        = string
  default     = "ecs.t6-c1m2.large"  # 1核2G，按量计费性价比高

  # 可选的其他规格:
  # - ecs.g6.large (1核2G，更稳定)
  # - ecs.t6-c1m2.large (1核2G，性价比最高)
  # - ecs.g6.xlarge (2核4G，性能更好)
}

variable "image_id" {
  description = "ECS 镜像 ID"
  type        = string
  default     = "ubuntu_22_04_x64_20G_alibase_20260119.vhd"  # Ubuntu 22.04
}

variable "system_disk_size" {
  description = "系统盘大小 (GB)"
  type        = number
  default     = 40
}

# ============================================
# SSH 密钥配置
# ============================================
variable "ssh_public_key" {
  description = "SSH 公钥内容，用于登录 ECS"
  type        = string
  sensitive   = true
}

# ============================================
# 阿里云认证配置
# ============================================
variable "access_key" {
  description = "阿里云 Access Key ID"
  type        = string
  sensitive   = true
}

variable "access_key_secret" {
  description = "阿里云 Access Key Secret"
  type        = string
  sensitive   = true
}

variable "ssh_source_cidr" {
  description = "允许访问 SSH 的来源 IP 段 (0.0.0.0/0 表示允许所有，建议限制为自己的 IP)"
  type        = string
  default     = "0.0.0.0/0"
}

# ============================================
# 公网 IP 配置
# ============================================
variable "eip_bandwidth" {
  description = "弹性公网 IP 带宽 (Mbps)"
  type        = number
  default     = 5
}

# ============================================
# Docker/ACR 配置
# ============================================
variable "docker_image_name" {
  description = "Docker 镜像名称"
  type        = string
  default     = "stem-story"
}

variable "docker_image_tag" {
  description = "Docker 镜像标签"
  type        = string
  default     = "latest"
}

# ============================================
# RDS MySQL 配置
# ============================================
variable "db_instance_type" {
  description = "RDS 实例规格 (rds.mysql.s1.small = 1核2GB, ~¥45/月)"
  type        = string
  default     = "rds.mysql.s1.small"
}

variable "db_storage" {
  description = "RDS 存储空间 (GB)"
  type        = number
  default     = 20
}

variable "db_name" {
  description = "数据库名称"
  type        = string
  default     = "stem_stories"
}

variable "db_username" {
  description = "数据库用户名"
  type        = string
  default     = "stem_user"
}

variable "db_password" {
  description = "数据库密码"
  type        = string
  sensitive   = true
}
