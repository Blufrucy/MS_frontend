<template>
  <div class="dashboard">
    <el-row :gutter="20" v-loading="loading">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#409eff"><User /></el-icon>
            <div class="stat-info">
              <p class="stat-label">总用户数</p>
              <h2 class="stat-value">{{ stats.totalUsers }}</h2>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#67c23a"><ShoppingCart /></el-icon>
            <div class="stat-info">
              <p class="stat-label">总订单数</p>
              <h2 class="stat-value">{{ stats.totalOrders }}</h2>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#f56c6c"><Money /></el-icon>
            <div class="stat-info">
              <p class="stat-label">总销售额</p>
              <h2 class="stat-value">¥{{ stats.totalSales }}</h2>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#e6a23c"><Connection /></el-icon>
            <div class="stat-info">
              <p class="stat-label">在线用户</p>
              <h2 class="stat-value">{{ stats.currentOnline }}</h2>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="top-products" style="margin-top: 20px;">
      <template #header>
        <h3>热销商品 TOP 5</h3>
      </template>
      <el-table :data="stats.topProducts" stripe>
        <el-table-column prop="productId" label="商品ID" width="100" />
        <el-table-column prop="productName" label="商品名称" />
        <el-table-column prop="sales" label="销量" width="120" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getMonitorStats } from '@/api/admin'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const stats = ref({
  totalUsers: 0,
  totalOrders: 0,
  totalSales: 0,
  currentOnline: 0,
  topProducts: []
})

const fetchStats = async () => {
  loading.value = true
  try {
    const res = await getMonitorStats()
    stats.value = res.data
  } catch (error) {
    ElMessage.error('获取统计数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.stat-card {
  cursor: pointer;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  font-size: 48px;
}

.stat-info {
  flex: 1;
}

.stat-label {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #909399;
}

.stat-value {
  margin: 0;
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.top-products h3 {
  margin: 0;
  font-size: 16px;
}
</style>
