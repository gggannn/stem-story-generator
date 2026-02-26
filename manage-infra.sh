#!/bin/bash
# ============================================
# 基础设施管理脚本 - 成本优化版
# ============================================
# 用途: 灵活控制 ECS 和 RDS，节省成本
#
# 使用方法:
#   ./manage-infra.sh stop    # 停止 ECS (保留 RDS 数据)
#   ./manage-infra.sh start   # 启动 ECS (连接现有 RDS)
#   ./manage-infra.sh status  # 查看资源状态
#   ./manage-infra.sh destroy # 删除所有资源 (包括 RDS，需确认)
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置
TERRAFORM_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/terraform" && pwd)"
export ALICLOUD_ACCESS_KEY="${ALICLOUD_ACCESS_KEY:-}"
export ALICLOUD_SECRET_KEY="${ALICLOUD_SECRET_KEY:-}"

# 日志函数
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

# ============================================
# 检查 Terraform
# ============================================
TERRAFORM_BIN="${TERRAFORM_DIR}/terraform"
if [ -f "$TERRAFORM_BIN" ]; then
    TERRAFORM_CMD="$TERRAFORM_BIN"
else
    TERRAFORM_CMD="terraform"
fi

cd "$TERRAFORM_DIR"

# ============================================
# 命令: status - 查看资源状态
# ============================================
cmd_status() {
    log_step "查看基础设施状态..."

    echo ""
    echo "=========================================="
    echo "📊 资源状态"
    echo "=========================================="

    # ECS 状态
    log_info "ECS 实例:"
    $TERRAFORM_CMD output -raw ecs_public_ip 2>/dev/null || echo "  ❌ ECS 未创建"

    # RDS 状态
    log_info "RDS 数据库:"
    $TERRAFORM_CMD output -raw rds_connection_string 2>/dev/null || echo "  ❌ RDS 未创建"

    echo ""
    echo "=========================================="
    echo "💰 月成本估算"
    echo "=========================================="
    echo "  ECS (t6-c1m2.large):   ~¥90-120/月"
    echo "  RDS (s1.small):        ~¥45/月 (运行) | ~¥18/月 (停止)"
    echo "  EIP (5Mbps):           ~¥5-20/月"
    echo ""
    echo "  💡 停止 ECS 可节省 ~¥90/月"
    echo "  💡 停止 RDS 可节省 ~¥27/月 (仅收存储费)"
    echo "=========================================="
}

# ============================================
# 命令: stop - 停止 ECS (保留 RDS)
# ============================================
cmd_stop() {
    log_step "停止 ECS (保留 RDS 数据)..."

    echo ""
    log_warn "⚠️  即将停止以下资源:"
    log_warn "   - ECS 实例"
    log_warn "   - 弹性公网 IP (EIP)"
    echo ""
    log_info "✅ 以下资源将被保留:"
    log_info "   - VPC 和 交换机"
    log_info "   - 安全组"
    log_info "   - RDS 数据库 (数据不会丢失)"
    echo ""

    read -p "确认停止 ECS? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        log_warn "操作已取消"
        exit 0
    fi

    echo ""
    log_step "停止 ECS 实例..."
    $TERRAFORM_CMD destroy -auto-approve \
        -target=alicloud_eip_association.main \
        -target=alicloud_eip.main \
        -target=alicloud_instance.main \
        -target=time_sleep.wait_for_ecs \
        -target=time_sleep.wait_for_rds

    echo ""
    log_info "✅ ECS 已停止，RDS 数据已保留！"
    echo ""
    log_info "💡 成本: 从 ~¥140-185/月 降至 ~¥18-63/月"
    log_info "   (仅 RDS 存储费 + EIP 保留费)"
    echo ""
    log_info "恢复服务: ./manage-infra.sh start"
}

# ============================================
# 命令: start - 启动 ECS
# ============================================
cmd_start() {
    log_step "启动 ECS (连接现有 RDS)..."

    echo ""
    log_info "正在启动 ECS 实例并连接到现有 RDS..."

    $TERRAFORM_CMD apply -auto-approve

    echo ""
    log_info "✅ ECS 已启动！"

    # 获取 IP
    ECS_IP=$($TERRAFORM_CMD output -raw ecs_public_ip)

    echo ""
    echo "=========================================="
    log_info "🎉 服务已恢复"
    echo "=========================================="
    log_info "📡 公网 IP: ${ECS_IP}"
    log_info "🌐 访问地址: http://${ECS_IP}/"
    log_info ""
    log_info "下一步: 运行部署脚本"
    log_info "  cd .. && ./deploy.sh"
    echo "=========================================="
}

# ============================================
# 命令: destroy - 删除所有资源
# ============================================
cmd_destroy() {
    log_step "删除所有资源 (包括 RDS 数据)..."

    echo ""
    log_warn "⚠️  警告: 此操作将删除所有资源，包括 RDS 数据库中的所有数据！"
    echo ""
    log_warn "将被删除的资源:"
    log_warn "   - ECS 实例"
    log_warn "   - RDS 数据库 (所有数据将丢失)"
    log_warn "   - VPC、交换机、安全组"
    log_warn "   - SSH 密钥对"
    log_warn "   - 弹性公网 IP"
    echo ""

    read -p "确认删除所有资源? (输入 'DELETE ALL' 确认): " confirm
    if [ "$confirm" != "DELETE ALL" ]; then
        log_warn "操作已取消"
        exit 0
    fi

    echo ""
    log_step "移除 RDS 的 destroy 保护..."

    # 注意: 需要先手动移除 lifecycle.prevent_destroy
    log_error "❌ 由于 RDS 设置了 prevent_destroy 保护，请手动操作:"
    echo ""
    echo "1. 编辑 terraform/main.tf"
    echo "2. 在 alicloud_db_instance.main 资源中删除以下行:"
    echo "   lifecycle {"
    echo "     prevent_destroy = true"
    echo "   }"
    echo ""
    echo "3. 然后运行: terraform destroy"
    echo ""
    log_info "💡 推荐使用: ./manage-infra.sh stop (保留数据)"
}

# ============================================
# 主程序
# ============================================
case "${1:-}" in
    stop)
        cmd_stop
        ;;
    start)
        cmd_start
        ;;
    status)
        cmd_status
        ;;
    destroy)
        cmd_destroy
        ;;
    "")
        echo "=========================================="
        echo "🛠️  基础设施管理脚本"
        echo "=========================================="
        echo ""
        echo "用法: ./manage-infra.sh <command>"
        echo ""
        echo "命令:"
        echo "  status   查看资源状态和成本"
        echo "  stop     停止 ECS (保留 RDS 数据) 💰 节省 ~¥90/月"
        echo "  start    启动 ECS (连接现有 RDS)"
        echo "  destroy  删除所有资源 (包括 RDS 数据)"
        echo ""
        echo "推荐工作流:"
        echo "  1. 不使用时: ./manage-infra.sh stop"
        echo "  2. 使用时:   ./manage-infra.sh start"
        echo ""
        echo "=========================================="
        ;;
    *)
        log_error "未知命令: $1"
        echo "可用命令: status, stop, start, destroy"
        exit 1
        ;;
esac
