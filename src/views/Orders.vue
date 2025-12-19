<template>
  <div class="orders-page page-container">
    <div class="page-header">
      <h1>我的订单</h1>
    </div>

    <!-- 订单状态筛选 -->
    <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="order-tabs">
      <el-tab-pane label="全部订单" name="all"></el-tab-pane>
      <el-tab-pane label="待支付" name="0"></el-tab-pane>
      <el-tab-pane label="已支付" name="1"></el-tab-pane>
      <el-tab-pane label="已取消" name="2"></el-tab-pane>
    </el-tabs>

    <!-- 订单列表 -->
    <div v-loading="loading" class="orders-container">
      <el-empty v-if="!loading && orders.length === 0" description="暂无订单" />
      
      <div v-else class="order-list">
        <el-card v-for="order in filteredOrders" :key="order.id" class="order-card" shadow="hover">
          <div class="order-header">
            <div class="order-info">
              <span class="order-no">订单号: {{ order.orderNo }}</span>
              <span class="order-time">{{ formatTime(order.createdAt) }}</span>
            </div>
            <el-tag :type="getStatusType(order.status)" size="large">
              {{ getStatusText(order.status) }}
            </el-tag>
          </div>

          <div class="order-content">
            <div class="product-info">
              <el-image 
                v-if="order.imageUrl"
                :src="order.imageUrl" 
                class="product-image"
                fit="cover"
              >
                <template #error>
                  <div class="image-slot">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="product-details">
                <div class="product-name">{{ order.productName }}</div>
                <div class="product-quantity">数量: {{ order.quantity }}</div>
              </div>
            </div>

            <div class="order-amount">
              <div class="amount-label">订单金额</div>
              <div class="amount-value">¥{{ order.totalAmount }}</div>
            </div>

            <div class="order-actions">
              <el-button 
                v-if="order.status === 0" 
                type="primary" 
                @click="handlePay(order)"
                :loading="payingOrderNo === order.orderNo"
              >
                立即支付
              </el-button>
              <el-button 
                v-if="order.status === 0" 
                @click="handleCancel(order)"
                :loading="cancelingOrderNo === order.orderNo"
              >
                取消订单
              </el-button>
              <el-button @click="handleViewDetail(order)">
                查看详情
              </el-button>
            </div>
          </div>

          <div v-if="order.paymentTime" class="payment-time">
            支付时间: {{ formatTime(order.paymentTime) }}
          </div>
        </el-card>
      </div>
    </div>

    <!-- 订单详情对话框 -->
    <el-dialog 
      v-model="detailDialogVisible" 
      title="订单详情" 
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="currentOrder" class="order-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="订单号">
            {{ currentOrder.orderNo }}
          </el-descriptions-item>
          <el-descriptions-item label="商品名称">
            {{ currentOrder.productName }}
          </el-descriptions-item>
          <el-descriptions-item label="购买数量">
            {{ currentOrder.quantity }}
          </el-descriptions-item>
          <el-descriptions-item label="订单金额">
            <span class="amount-highlight">¥{{ currentOrder.totalAmount }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(currentOrder.status)">
              {{ getStatusText(currentOrder.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatTime(currentOrder.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentOrder.paymentTime" label="支付时间">
            {{ formatTime(currentOrder.paymentTime) }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentOrder.addressId" label="收货地址">
            <div class="address-info">
              <el-icon><Location /></el-icon>
              <span>{{ getAddressText(currentOrder.addressId) }}</span>
            </div>
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="currentOrder.imageUrl" class="detail-image">
          <el-image :src="currentOrder.imageUrl" fit="contain" />
        </div>
      </div>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture, Location } from '@element-plus/icons-vue'
import { getUserOrders, cancelOrder, payOrder } from '@/api/order'
import { getAddressList } from '@/api/address'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 状态
const loading = ref(false)
const orders = ref([])
const activeTab = ref('all')
const detailDialogVisible = ref(false)
const currentOrder = ref(null)
const payingOrderNo = ref('')
const cancelingOrderNo = ref('')
const addressMap = ref(new Map()) // 地址ID到地址信息的映射

// 过滤后的订单列表
const filteredOrders = computed(() => {
  if (activeTab.value === 'all') {
    return orders.value
  }
  return orders.value.filter(order => order.status === Number(activeTab.value))
})

// 获取订单列表
const fetchOrders = async () => {
  if (!userStore.userInfo?.id) {
    ElMessage.warning('请先登录')
    return
  }

  loading.value = true
  try {
    const res = await getUserOrders(userStore.userInfo.id)
    if (res.code === 200) {
      orders.value = res.data || []
    } else {
      ElMessage.error(res.message || '获取订单列表失败')
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 标签页切换
const handleTabChange = () => {
  // 可以在这里添加额外的逻辑
}

// 查看订单详情
const handleViewDetail = (order) => {
  currentOrder.value = order
  detailDialogVisible.value = true
}

// 支付订单
const handlePay = async (order) => {
  try {
    await ElMessageBox.confirm(
      `确认支付订单 ${order.orderNo}？`,
      '支付确认',
      {
        confirmButtonText: '确认支付',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    payingOrderNo.value = order.orderNo
    const res = await payOrder(order.orderNo)
    
    if (res.code === 200) {
      ElMessage.success('支付成功')
      await fetchOrders() // 刷新订单列表
    } else {
      ElMessage.error(res.message || '支付失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('支付失败:', error)
      ElMessage.error('支付失败')
    }
  } finally {
    payingOrderNo.value = ''
  }
}

// 取消订单
const handleCancel = async (order) => {
  try {
    await ElMessageBox.confirm(
      `确认取消订单 ${order.orderNo}？`,
      '取消订单',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    cancelingOrderNo.value = order.orderNo
    const res = await cancelOrder(order.orderNo)
    
    if (res.code === 200) {
      ElMessage.success('订单已取消')
      await fetchOrders() // 刷新订单列表
    } else {
      ElMessage.error(res.message || '取消订单失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订单失败:', error)
      ElMessage.error('取消订单失败')
    }
  } finally {
    cancelingOrderNo.value = ''
  }
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '待支付',
    1: '已支付',
    2: '已取消'
  }
  return statusMap[status] || '未知'
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    0: 'warning',
    1: 'success',
    2: 'info'
  }
  return typeMap[status] || ''
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return '-'
  const date = new Date(time)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 获取地址列表并建立映射
const fetchAddresses = async () => {
  try {
    const res = await getAddressList()
    console.log('订单页-地址列表响应:', res) // 调试日志
    if (res.code === 200 && res.data) {
      // 后端直接返回数组，不是 { list: [] } 格式
      const addressList = Array.isArray(res.data) ? res.data : []
      console.log('订单页-地址列表:', addressList) // 调试日志
      const map = new Map()
      addressList.forEach(addr => {
        map.set(addr.id, addr)
      })
      addressMap.value = map
    }
  } catch (error) {
    console.error('获取地址列表失败:', error)
  }
}

// 获取地址显示文本
const getAddressText = (addressId) => {
  if (!addressId) return '未设置收货地址'
  const addr = addressMap.value.get(addressId)
  if (!addr) return `地址ID: ${addressId}`
  return `${addr.receiverName} ${addr.phone} ${addr.province}${addr.city}${addr.district}${addr.detailAddress}`
}

// 页面加载时获取订单列表和地址列表
onMounted(async () => {
  await fetchAddresses()
  await fetchOrders()
})
</script>

<style scoped>
.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 24px;
}

.orders-page {
  padding: 0;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.order-tabs {
  margin-bottom: 20px;
}

.orders-container {
  min-height: 400px;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  transition: all 0.3s;
}

.order-card:hover {
  transform: translateY(-2px);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 16px;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-no {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.order-time {
  font-size: 12px;
  color: #909399;
}

.order-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 24px;
}

.product-details {
  flex: 1;
}

.product-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
}

.product-quantity {
  font-size: 14px;
  color: #606266;
}

.order-amount {
  text-align: center;
  padding: 0 20px;
}

.amount-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.amount-value {
  font-size: 20px;
  font-weight: 600;
  color: #f56c6c;
}

.order-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 100px;
}

.payment-time {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
  font-size: 12px;
  color: #909399;
}

.order-detail {
  padding: 10px 0;
}

.amount-highlight {
  font-size: 18px;
  font-weight: 600;
  color: #f56c6c;
}

.detail-image {
  margin-top: 20px;
  text-align: center;
}

.detail-image .el-image {
  max-width: 100%;
  max-height: 300px;
}

.address-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
}

@media (max-width: 768px) {
  .order-content {
    flex-direction: column;
    align-items: stretch;
  }

  .order-amount {
    padding: 12px 0;
    border-top: 1px solid #ebeef5;
    border-bottom: 1px solid #ebeef5;
  }

  .order-actions {
    flex-direction: row;
    min-width: auto;
  }
}
</style>
