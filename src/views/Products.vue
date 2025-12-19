<template>
  <div class="products-page page-container">
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
      <div class="product-card" v-for="product in products" :key="product.id" @click="handleProductClick(product)">
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
            <el-button 
              type="primary" 
              size="small"
              @click.stop="handleBuyClick(product)"
              :disabled="product.status !== 1"
            >
              立即购买
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 购买对话框 -->
    <el-dialog 
      v-model="buyDialogVisible" 
      title="购买商品" 
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="selectedProduct" class="buy-dialog-content">
        <div class="product-summary">
          <el-image 
            :src="selectedProduct.imageUrl" 
            class="summary-image"
            fit="cover"
          >
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
          <div class="summary-info">
            <h3>{{ selectedProduct.name }}</h3>
            <p class="summary-price">¥{{ selectedProduct.originalPrice }}</p>
          </div>
        </div>

        <el-form :model="orderForm" label-width="100px">
          <el-form-item label="购买数量">
            <el-input-number 
              v-model="orderForm.quantity" 
              :min="1" 
              :max="99"
            />
          </el-form-item>

          <el-form-item label="收货地址">
            <el-select
              v-model="orderForm.addressId"
              placeholder="请选择收货地址"
              style="width: 100%"
            >
              <el-option
                v-for="addr in addressList"
                :key="addr.id"
                :label="`${addr.receiverName} ${addr.phone} ${addr.province}${addr.city}${addr.district}${addr.detailAddress}`"
                :value="addr.id"
              >
                <div class="address-option">
                  <div class="address-main">
                    <span class="receiver">{{ addr.receiverName }}</span>
                    <span class="phone">{{ addr.phone }}</span>
                    <el-tag v-if="addr.isDefault" type="success" size="small">默认</el-tag>
                  </div>
                  <div class="address-detail">
                    {{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detailAddress }}
                  </div>
                </div>
              </el-option>
            </el-select>
            <el-button 
              text 
              type="primary" 
              @click="goToAddressManage"
              style="margin-top: 8px"
            >
              <el-icon><Plus /></el-icon>
              管理收货地址
            </el-button>
          </el-form-item>

          <el-form-item label="订单金额">
            <span class="total-amount">¥{{ calculateTotal() }}</span>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="buyDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleConfirmBuy"
          :loading="buying"
        >
          确认购买
        </el-button>
      </template>
    </el-dialog>

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
import { getProductList } from '@/api/product'
import { getAddressList } from '@/api/address'
import { createProductOrder } from '@/api/productOrder'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture, Plus } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const products = ref([])
const searchKeyword = ref('')
const page = ref(1)
const size = ref(12)
const total = ref(0)
const buyDialogVisible = ref(false)
const selectedProduct = ref(null)
const buying = ref(false)
const addressList = ref([])
const orderForm = ref({
  quantity: 1,
  addressId: null
})

const fetchProducts = async () => {
  loading.value = true
  try {
    const res = await getProductList({
      page: page.value,
      size: size.value,
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

// 获取收货地址列表
const fetchAddressList = async () => {
  try {
    const res = await getAddressList()
    if (res.code === 200 && res.data) {
      addressList.value = Array.isArray(res.data) ? res.data : []
      // 自动选择默认地址
      const defaultAddr = addressList.value.find(addr => addr.isDefault)
      if (defaultAddr) {
        orderForm.value.addressId = defaultAddr.id
      } else if (addressList.value.length > 0) {
        orderForm.value.addressId = addressList.value[0].id
      }
    }
  } catch (error) {
    console.error('获取地址列表失败:', error)
  }
}

// 点击商品卡片
const handleProductClick = (product) => {
  // 可以跳转到商品详情页
  console.log('查看商品详情:', product)
}

// 点击购买按钮
const handleBuyClick = (product) => {
  if (!userStore.isLoggedIn) {
    ElMessageBox.confirm('请先登录', '提示', {
      confirmButtonText: '去登录',
      cancelButtonText: '取消'
    }).then(() => {
      router.push('/login')
    }).catch(() => {})
    return
  }

  selectedProduct.value = product
  orderForm.value.quantity = 1
  buyDialogVisible.value = true
  
  // 加载地址列表
  if (addressList.value.length === 0) {
    fetchAddressList()
  }
}

// 计算总金额
const calculateTotal = () => {
  if (!selectedProduct.value) return '0.00'
  const total = selectedProduct.value.originalPrice * orderForm.value.quantity
  return total.toFixed(2)
}

// 确认购买
const handleConfirmBuy = async () => {
  if (!orderForm.value.addressId) {
    ElMessage.warning('请选择收货地址')
    return
  }

  buying.value = true
  try {
    const res = await createProductOrder({
      productId: selectedProduct.value.id,
      quantity: orderForm.value.quantity,
      addressId: orderForm.value.addressId
    })

    if (res.code === 200) {
      ElMessage.success('订单创建成功！')
      buyDialogVisible.value = false
      // 跳转到订单页面
      setTimeout(() => {
        router.push('/orders')
      }, 1500)
    } else {
      ElMessage.error(res.message || '订单创建失败')
    }
  } catch (error) {
    console.error('创建订单失败:', error)
    ElMessage.error('订单创建失败')
  } finally {
    buying.value = false
  }
}

// 跳转到地址管理
const goToAddressManage = () => {
  router.push('/address')
}

onMounted(() => {
  fetchProducts()
  if (userStore.isLoggedIn) {
    fetchAddressList()
  }
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

.buy-dialog-content {
  padding: 10px 0;
}

.product-summary {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 24px;
}

.summary-image {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  flex-shrink: 0;
}

.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  color: #999;
  font-size: 32px;
}

.summary-info {
  flex: 1;
}

.summary-info h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #303133;
}

.summary-price {
  font-size: 24px;
  color: #ff4d4f;
  font-weight: bold;
  margin: 0;
}

.summary-price::before {
  content: '¥';
  font-size: 16px;
}

.total-amount {
  font-size: 28px;
  color: #ff4d4f;
  font-weight: bold;
}

.address-option {
  padding: 4px 0;
}

.address-main {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.receiver {
  font-weight: 500;
  color: #303133;
}

.phone {
  color: #606266;
  font-size: 14px;
}

.address-detail {
  font-size: 13px;
  color: #909399;
  line-height: 1.5;
}
</style>
