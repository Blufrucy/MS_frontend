<template>
  <div class="home">
    <!-- 轮播图 -->
    <el-carousel height="400px" class="banner">
      <el-carousel-item v-for="item in banners" :key="item">
        <div class="banner-item" :style="{ background: item.color }">
          <h1>{{ item.title }}</h1>
          <p>{{ item.subtitle }}</p>
        </div>
      </el-carousel-item>
    </el-carousel>

    <!-- 秒杀专区 -->
    <div class="section">
      <div class="section-header">
        <div class="title-wrapper">
          <el-icon class="title-icon" :size="32" color="#ff4d4f"><Timer /></el-icon>
          <div>
            <h2>限时秒杀</h2>
            <p class="subtitle">超值优惠 限时抢购</p>
          </div>
        </div>
        <el-button type="danger" size="large" @click="$router.push('/seckill')">
          查看更多 <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>

      <div class="products-grid" v-loading="loading">
        <div class="product-card" v-for="product in seckillProducts" :key="product.id" @click="goToDetail(product.id)">
          <div class="product-image-wrapper">
            <img :src="product.productImageUrl || product.imageUrl || getPlaceholder()" class="product-image" @error="handleImageError" />
            <div class="product-badge" v-if="product.status === 1">
              <span>抢购中</span>
            </div>
          </div>
          <div class="product-info">
            <h3 class="product-name">{{ product.productName || '商品名称' }}</h3>
            <div class="price-section">
              <div class="price-box">
                <span class="price-label">秒杀价</span>
                <span class="seckill-price">¥{{ product.seckillPrice }}</span>
              </div>
              <span class="original-price" v-if="product.originalPrice">¥{{ product.originalPrice }}</span>
            </div>
            <div class="stock-section">
              <div class="stock-bar">
                <div class="stock-progress" :style="{ width: getStockPercentage(product) + '%' }"></div>
              </div>
              <p class="stock-text">已抢 {{ getStockPercentage(product) }}%</p>
            </div>
            <el-button type="danger" size="large" class="buy-btn" :disabled="product.status !== 1">
              <el-icon><ShoppingCart /></el-icon>
              立即抢购
            </el-button>
          </div>
        </div>
      </div>

      <el-empty v-if="!loading && seckillProducts.length === 0" description="暂无秒杀商品" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getSeckillProductList } from '@/api/product'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const seckillProducts = ref([])

const banners = [
  { title: '限时秒杀', subtitle: '超值优惠，抢到就是赚到', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { title: '新品上市', subtitle: '最新款式，等你来抢', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { title: '品质保证', subtitle: '正品保障，售后无忧', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }
]

const fetchSeckillProducts = async () => {
  loading.value = true
  try {
    const res = await getSeckillProductList({
      page: 1,
      size: 20
    })
    // 过滤出进行中的商品，取前4个
    const allProducts = res.data.list || []
    seckillProducts.value = allProducts.filter(p => p.status === 1).slice(0, 4)
  } catch (error) {
    ElMessage.error('获取秒杀商品失败')
  } finally {
    loading.value = false
  }
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

const goToDetail = (id) => {
  router.push(`/seckill/${id}`)
}

const getPlaceholder = () => {
  // 使用 data URL 创建占位图
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjIwIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+5ZWG5ZOB5Zu+54mHPC90ZXh0Pjwvc3ZnPg=='
}

const handleImageError = (e) => {
  e.target.src = getPlaceholder()
}

onMounted(() => {
  fetchSeckillProducts()
})
</script>

<style scoped>
.home {
  margin: -24px -20px;
}

.banner {
  margin-bottom: 40px;
}

.banner-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #fff;
}

.banner-item h1 {
  font-size: 48px;
  margin: 0 0 16px 0;
}

.banner-item p {
  font-size: 20px;
  margin: 0;
}

.section {
  padding: 40px 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid #ff4d4f;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-icon {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.section-header h2 {
  font-size: 28px;
  margin: 0;
  color: #303133;
  font-weight: 600;
}

.subtitle {
  font-size: 14px;
  color: #909399;
  margin: 4px 0 0 0;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
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

.product-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: linear-gradient(135deg, #ff6b6b, #ff4d4f);
  color: #fff;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(255, 77, 79, 0.4);
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
  margin-bottom: 16px;
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
  color: #ff4d4f;
  margin: 0;
  font-weight: 500;
}

.buy-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
}
</style>
