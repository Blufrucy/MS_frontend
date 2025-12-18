<template>
  <div class="products-page">
    <div class="page-header">
      <h1>
        <el-icon><Goods /></el-icon>
        全部商品
      </h1>
      <p>精选优质商品，品质保证</p>
    </div>

    <div class="filter-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索商品名称"
        clearable
        style="width: 300px"
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
    </div>

    <div class="products-grid" v-loading="loading">
      <div class="product-card" v-for="product in products" :key="product.id">
        <div class="product-image-wrapper">
          <img :src="product.imageUrl || getPlaceholder()" class="product-image" @error="handleImageError" />
          <div class="product-badge" v-if="product.status === 1">
            <span>在售</span>
          </div>
        </div>
        <div class="product-info">
          <h3 class="product-name">{{ product.name }}</h3>
          <p class="product-desc">{{ product.description }}</p>
          <div class="product-footer">
            <div class="price-box">
              <span class="price-label">商品价格</span>
              <span class="price">{{ product.originalPrice }}</span>
            </div>
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
import { getProductList } from '@/api/product'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const products = ref([])
const searchKeyword = ref('')
const page = ref(1)
const size = ref(12)
const total = ref(0)

const fetchProducts = async () => {
  loading.value = true
  try {
    const res = await getProductList({
      pageNum: page.value,
      pageSize: size.value,
      productName: searchKeyword.value || undefined
    })
    
    products.value = res.data.list || []
    total.value = res.data.total || 0
  } catch (error) {
    ElMessage.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  fetchProducts()
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

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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

.product-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #67c23a, #85ce61);
  color: #fff;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.4);
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
  line-clamp: 2;
  -webkit-box-orient: vertical;
  color: #303133;
  font-weight: 500;
}

.product-desc {
  font-size: 13px;
  color: #909399;
  margin: 0 0 16px 0;
  height: 40px;
  line-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
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

.price {
  font-size: 28px;
  color: #ff4d4f;
  font-weight: bold;
  line-height: 1;
}

.price::before {
  content: '¥';
  font-size: 18px;
}

.pagination {
  margin-top: 32px;
  display: flex;
  justify-content: center;
}
</style>
