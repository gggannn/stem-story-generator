# ============================================
# Terraform 输出定义
# ============================================

output "ecs_public_ip" {
  description = "ECS 公网 IP 地址"
  value       = alicloud_eip.main.ip_address
}

output "ecs_instance_id" {
  description = "ECS 实例 ID"
  value       = alicloud_instance.main.id
}

output "ssh_connect_command" {
  description = "SSH 连接命令"
  value       = "ssh -i ~/.ssh/${var.project_name}-key root@${alicloud_eip.main.ip_address}"
}

output "app_access_url" {
  description = "应用访问 URL"
  value       = "http://${alicloud_eip.main.ip_address}/"
}

output "vpc_id" {
  description = "VPC ID"
  value       = alicloud_vpc.main.id
}

output "security_group_id" {
  description = "安全组 ID"
  value       = alicloud_security_group.main.id
}

output "docker_pull_command" {
  description = "Docker 拉取镜像命令"
  value       = "docker pull registry.cn-shanghai.aliyuncs.com/YOUR_NAMESPACE/${var.docker_image_name}:${var.docker_image_tag}"
}

# ============================================
# 部署后信息输出
# ============================================
output "deployment_instructions" {
  description = "部署说明"
  value = <<-EOT
    ============================================
    🎉 ECS 创建成功！
    ============================================

    📡 公网 IP: ${alicloud_eip.main.ip_address}
    🌐 访问地址: http://${alicloud_eip.main.ip_address}/

    🔑 SSH 连接:
       ssh -i ~/.ssh/easysteam_deploy_key root@${alicloud_eip.main.ip_address}

    📦 下一步: 运行部署脚本
       cd /Users/jessi/ai-project/easysteam
       ./deploy.sh

    ============================================
  EOT
}

# ============================================
# RDS 输出
# ============================================
output "rds_connection_string" {
  description = "RDS 连接字符串"
  value       = alicloud_db_instance.main.connection_string
}

output "rds_port" {
  description = "RDS 端口"
  value       = alicloud_db_instance.main.port
}

output "rds_database_name" {
  description = "数据库名称"
  value       = alicloud_db_database.stem_stories.name
}

output "rds_username" {
  description = "数据库用户名"
  value       = var.db_username
  sensitive   = true
}

output "rds_password" {
  description = "数据库密码"
  value       = var.db_password
  sensitive   = true
}

output "db_connection_info" {
  description = "数据库连接信息 (用于 deploy.env)"
  value = {
    MYSQL_HOST     = alicloud_db_instance.main.connection_string
    MYSQL_PORT     = alicloud_db_instance.main.port
    MYSQL_DATABASE = alicloud_db_database.stem_stories.name
    MYSQL_USER     = var.db_username
    MYSQL_PASSWORD = var.db_password
  }
  sensitive   = true
}
