<template>
  <div class="seckill-page page-container">
    <div class="page-header">
      <h1>
        <el-icon><Timer /></el-icon>
        限时秒杀
      </h1>
      <p>超值优惠，抢到就是赚到</p>
    </div>

    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="进行中" name="1" />
      <el-tab-pane label="未开始" name="0" />
      <el-tab-pane label="已结束" name="2" />
    </el-tabs>

    <div class="products-grid" v-loading="loading">
      <div class="product-card" v-for="product in products" :key="product.id" @click="goToDetail(product.id)">
        <div class="product-image-wrapper">
          <img :src="product.productImageUrl || product.imageUrl || getPlaceholder()" class="product-image" @error="handleImageError" />
          <div class="status-badge" :class="'status-' + product.status">
            {{ getStatusText(product.status) }}
          </div>
        </div>
        <div class="product-info">
          <h3 class="product-name">{{ product.productName || '商品名称' }}</h3>
          
          <div class="price-section">
            <div class="price-box">
              <span class="price-label">秒杀价</span>
              <span class="seckill-price">{{ product.seckillPrice }}</span>
            </div>
            <span class="original-price" v-if="product.originalPrice">¥{{ product.originalPrice }}</span>
          </div>

          <div class="stock-section">
            <div class="stock-bar">
              <div class="stock-progress" :style="{ width: getStockPercentage(product) + '%' }"></div>
            </div>
            <p class="stock-text">已抢 {{ getStockPercentage(product) }}% · 剩余 {{ product.availableStock }} 件</p>
          </div>
          
          <div class="time-info" v-if="product.status === 0">
            <el-icon><Clock /></el-icon>
            <span>{{ formatTime(product.startTime) }} 开始</span>
          </div>
          <div class="time-info" v-else-if="product.status === 1">
            <el-icon><Clock /></el-icon>
            <span>{{ formatTime(product.endTime) }} 结束</span>
          </div>
          <div class="time-info ended" v-else>
            <el-icon><CircleClose /></el-icon>
            <span>活动已结束</span>
          </div>
        </div>
      </div>
    </div>

    <el-empty v-if="!loading && products.length === 0" description="暂无商品" />

    <el-pagination
      v-if="total > 0"
      v-model:current-page="page"
      v-model:page-size="size"
      :total="total"
      layout="total, prev, pager, next"
      @current-change="fetchProducts"
      class="pagination"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getSeckillProductList } from '@/api/product'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const products = ref([])
const activeTab = ref('1')
const page = ref(1)
const size = ref(12)
const total = ref(0)

const fetchProducts = async () => {
  loading.value = true
  try {
    const res = await getSeckillProductList({
      page: page.value,
      size: size.value
    })
    
    // 前端过滤状态
    const allProducts = res.data.list || []
    const statusFilter = parseInt(activeTab.value)
    products.value = allProducts.filter(p => p.status === statusFilter)
    total.value = products.value.length
  } catch (error) {
    ElMessage.error('获取商品失败')
  } finally {
    loading.value = false
  }
}

const handleTabChange = () => {
  page.value = 1
  fetchProducts()
}

const getStockPercentage = (product) => {
  return ((product.stock - product.availableStock) / product.stock * 100).toFixed(0)
}

const getProgressColor = (product) => {
  const percentage = getStockPercentage(product)
  if (percentage < 30) return '#67c23a'
  if (percentage < 70) return '#e6a23c'
  return '#f56c6c'
}

const getStatusType = (status) => {
  const types = { 0: 'info', 1: 'success', 2: 'danger' }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = { 0: '未开始', 1: '进行中', 2: '已结束' }
  return texts[status] || '未知'
}

const formatTime = (time) => {
  return new Date(time).toLocaleString('zh-CN')
}

const goToDetail = (id) => {
  router.push(`/seckill/${id}`)
}

const getPlaceholder = () => {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjIwIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+5ZWG5ZOB5Zu+54mHPC90ZXh0Pjwvc3ZnPg=='
}

const handleImageError = (e) => {
  e.target.src = getPlaceholder()
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 24px;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-header h1 {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-size: 32px;
  margin: 0 0 8px 0;
  color: #303133;
}

.page-header p {
  font-size: 16px;
  color: #909399;
  margin: 0;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

@media (max-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.product-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.product-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;
  background: #f5f5f5;
}

.product-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  color: #fff;
}

.status-badge.status-0 {
  background: linear-gradient(135deg, #909399, #606266);
}

.status-badge.status-1 {
  background: linear-gradient(135deg, #ff6b6b, #ff4d4f);
  animation: pulse 2s infinite;
}

.status-badge.status-2 {
  background: linear-gradient(135deg, #c0c4cc, #909399);
}

.product-info {
  padding: 20px;
}

.product-name {
  font-size: 16px;
  margin: 0 0 16px 0;
  height: 44px;
  line-height: 22px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  color: #303133;
  font-weight: 500;
}

.price-section {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 16px;
}

.price-box {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.price-label {
  font-size: 12px;
  color: #909399;
}

.seckill-price {
  font-size: 28px;
  color: #ff4d4f;
  font-weight: bold;
  line-height: 1;
}

.seckill-price::before {
  content: '¥';
  font-size: 18px;
}

.original-price {
  font-size: 14px;
  color: #909399;
  text-decoration: line-through;
  align-self: flex-end;
  margin-bottom: 4px;
}

.stock-section {
  margin-bottom: 12px;
}

.stock-bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.stock-progress {
  height: 100%;
  background: linear-gradient(90deg, #ff6b6b, #ff4d4f);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.stock-text {
  font-size: 12px;
  color: #606266;
  margin: 0;
}

.time-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 6px;
}

.time-info.ended {
  color: #909399;
}

.pagination {
  margin-top: 32px;
  display: flex;
  justify-content: center;
}
</style>
