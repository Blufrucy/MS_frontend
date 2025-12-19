<template>
  <div class="admin-orders">
    <div class="page-header">
      <h2>订单管理</h2>
      <el-button type="primary" @click="fetchOrders" :loading="loading">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>

    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="订单号">
          <el-input 
            v-model="filterForm.orderNo" 
            placeholder="请输入订单号"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select 
            v-model="filterForm.status" 
            placeholder="全部状态"
            clearable
            style="width: 150px"
          >
            <el-option label="待支付" :value="0" />
            <el-option label="已支付" :value="1" />
            <el-option label="已取消" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="订单类型">
          <el-select 
            v-model="filterForm.orderType" 
            placeholder="全部类型"
            clearable
            style="width: 150px"
          >
            <el-option label="秒杀订单" value="seckill" />
            <el-option label="普通订单" value="normal" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 订单列表 -->
    <el-card class="table-card">
      <el-table 
        :data="filteredOrders" 
        v-loading="loading"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="订单ID" width="80" />
        <el-table-column prop="orderNo" label="订单号" width="200">
          <template #default="{ row }">
            <div class="order-no-cell">
              <el-tag 
                :type="row.orderNo.startsWith('SK') ? 'danger' : 'primary'" 
                size="small"
              >
                {{ row.orderNo.startsWith('SK') ? '秒杀' : '普通' }}
              </el-tag>
              <span>{{ row.orderNo }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column prop="productName" label="商品名称" min-width="150" />
        <el-table-column prop="quantity" label="数量" width="80" align="center" />
        <el-table-column prop="totalAmount" label="订单金额" width="120" align="right">
          <template #default="{ row }">
            <span class="amount">¥{{ row.totalAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              size="small" 
              link
              @click="handleViewDetail(row)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 统计信息 -->
      <div class="statistics">
        <el-descriptions :column="4" border>
          <el-descriptions-item label="总订单数">
            {{ statistics.total }}
          </el-descriptions-item>
          <el-descriptions-item label="待支付">
            {{ statistics.pending }}
          </el-descriptions-item>
          <el-descriptions-item label="已支付">
            {{ statistics.paid }}
          </el-descriptions-item>
          <el-descriptions-item label="已取消">
            {{ statistics.cancelled }}
          </el-descriptions-item>
          <el-descriptions-item label="总销售额" :span="2">
            <span class="total-sales">¥{{ statistics.totalSales }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="秒杀订单">
            {{ statistics.seckillOrders }}
          </el-descriptions-item>
          <el-descriptions-item label="普通订单">
            {{ statistics.normalOrders }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>

    <!-- 订单详情对话框 -->
    <el-dialog 
      v-model="detailDialogVisible" 
      title="订单详情" 
      width="700px"
      :close-on-click-modal="false"
    >
      <div v-if="currentOrder" class="order-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单ID">
            {{ currentOrder.id }}
          </el-descriptions-item>
          <el-descriptions-item label="订单号">
            {{ currentOrder.orderNo }}
          </el-descriptions-item>
          <el-descriptions-item label="订单类型">
            <el-tag :type="currentOrder.orderNo.startsWith('SK') ? 'danger' : 'primary'">
              {{ currentOrder.orderNo.startsWith('SK') ? '秒杀订单' : '普通订单' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(currentOrder.status)">
              {{ getStatusText(currentOrder.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="用户ID">
            {{ currentOrder.userId }}
          </el-descriptions-item>
          <el-descriptions-item label="商品ID">
            {{ currentOrder.productId }}
          </el-descriptions-item>
          <el-descriptions-item label="商品名称" :span="2">
            {{ currentOrder.productName }}
          </el-descriptions-item>
          <el-descriptions-item label="购买数量">
            {{ currentOrder.quantity }}
          </el-descriptions-item>
          <el-descriptions-item label="订单金额">
            <span class="amount-highlight">¥{{ currentOrder.totalAmount }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">
            {{ formatTime(currentOrder.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentOrder.paymentTime" label="支付时间" :span="2">
            {{ formatTime(currentOrder.paymentTime) }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentOrder.seckillProductId" label="秒杀商品ID" :span="2">
            {{ currentOrder.seckillProductId }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentOrder.addressId" label="收货地址ID" :span="2">
            {{ currentOrder.addressId }}
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
import { ElMessage } from 'element-plus'
import { Refresh, Search, RefreshLeft } from '@element-plus/icons-vue'
import { getAllOrders } from '@/api/order'

const loading = ref(false)
const orders = ref([])
const detailDialogVisible = ref(false)
const currentOrder = ref(null)

const filterForm = ref({
  orderNo: '',
  status: null,
  orderType: null
})

// 过滤后的订单列表
const filteredOrders = computed(() => {
  let result = orders.value

  // 按订单号筛选
  if (filterForm.value.orderNo) {
    result = result.filter(order => 
      order.orderNo.toLowerCase().includes(filterForm.value.orderNo.toLowerCase())
    )
  }

  // 按状态筛选
  if (filterForm.value.status !== null && filterForm.value.status !== '') {
    result = result.filter(order => order.status === filterForm.value.status)
  }

  // 按订单类型筛选
  if (filterForm.value.orderType) {
    if (filterForm.value.orderType === 'seckill') {
      result = result.filter(order => order.orderNo.startsWith('SK'))
    } else if (filterForm.value.orderType === 'normal') {
      result = result.filter(order => order.orderNo.startsWith('PD'))
    }
  }

  return result
})

// 统计信息
const statistics = computed(() => {
  const total = orders.value.length
  const pending = orders.value.filter(o => o.status === 0).length
  const paid = orders.value.filter(o => o.status === 1).length
  const cancelled = orders.value.filter(o => o.status === 2).length
  const totalSales = orders.value
    .filter(o => o.status === 1)
    .reduce((sum, o) => sum + parseFloat(o.totalAmount), 0)
    .toFixed(2)
  const seckillOrders = orders.value.filter(o => o.orderNo.startsWith('SK')).length
  const normalOrders = orders.value.filter(o => o.orderNo.startsWith('PD')).length

  return {
    total,
    pending,
    paid,
    cancelled,
    totalSales,
    seckillOrders,
    normalOrders
  }
})

// 获取所有订单
const fetchOrders = async () => {
  loading.value = true
  try {
    const res = await getAllOrders()
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

// 查看订单详情
const handleViewDetail = (order) => {
  currentOrder.value = order
  detailDialogVisible.value = true
}

// 筛选
const handleFilter = () => {
  // 筛选逻辑已在 computed 中实现
}

// 重置筛选
const handleReset = () => {
  filterForm.value = {
    orderNo: '',
    status: null,
    orderType: null
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

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.admin-orders {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.filter-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.order-no-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.amount {
  color: #f56c6c;
  font-weight: 600;
}

.statistics {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.total-sales {
  font-size: 20px;
  font-weight: bold;
  color: #f56c6c;
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
</style>
