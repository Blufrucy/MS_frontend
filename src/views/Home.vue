<template>
  <div class="home">
    <!-- 主视觉区域 -->
    <div class="hero-section">
      <div class="hero-container">
        <!-- 左侧分类导航 -->
        <div class="category-nav">
          <div class="category-item" v-for="category in categories" :key="category.id">
            <el-icon><component :is="category.icon" /></el-icon>
            <span>{{ category.name }}</span>
            <el-icon class="arrow"><ArrowRight /></el-icon>
          </div>
        </div>

        <!-- 中间轮播图 -->
        <div class="main-carousel">
          <el-carousel height="480px" indicator-position="outside">
            <el-carousel-item v-for="(item, index) in banners" :key="index">
              <div class="banner-item" :style="{ background: item.color }">
                <div class="banner-content">
                  <h1 class="banner-title">{{ item.title }}</h1>
                  <p class="banner-subtitle">{{ item.subtitle }}</p>
                  <el-button type="danger" size="large" round class="banner-btn">
                    立即抢购
                  </el-button>
                </div>
              </div>
            </el-carousel-item>
          </el-carousel>
        </div>

        <!-- 右侧快捷入口 -->
        <div class="quick-links">
          <div class="user-card" v-if="userStore.isLoggedIn">
            <div class="user-info">
              <el-avatar :size="50">{{ userStore.userInfo?.username?.charAt(0) }}</el-avatar>
              <div class="user-text">
                <p class="username">{{ userStore.userInfo?.nickname || userStore.userInfo?.username }}</p>
                <p class="user-level">普通会员</p>
              </div>
            </div>
          </div>
          <div class="user-card login-card" v-else @click="$router.push('/login')">
            <p class="login-text">Hi，欢迎来到商城</p>
            <el-button type="primary" size="small" round>立即登录</el-button>
          </div>

          <div class="quick-menu">
            <div class="menu-item" @click="$router.push('/orders')">
              <el-icon :size="20" color="#ff6b35"><ShoppingBag /></el-icon>
              <span>我的订单</span>
            </div>
            <div class="menu-item" @click="$router.push('/address')">
              <el-icon :size="20" color="#409eff"><Location /></el-icon>
              <span>收货地址</span>
            </div>
            <div class="menu-item" @click="$router.push('/seckill')">
              <el-icon :size="20" color="#f56c6c"><Timer /></el-icon>
              <span>限时秒杀</span>
            </div>
            <div class="menu-item" @click="$router.push('/profile')">
              <el-icon :size="20" color="#67c23a"><User /></el-icon>
              <span>个人中心</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 特色服务 -->
    <div class="features-section">
      <div class="container">
        <div class="feature-item" v-for="feature in features" :key="feature.id">
          <el-icon :size="32" :color="feature.color"><component :is="feature.icon" /></el-icon>
          <div class="feature-text">
            <h4>{{ feature.title }}</h4>
            <p>{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 热卖商品 -->
    <div class="products-section">
      <div class="container">
        <div class="section-header">
          <div class="title-wrapper">
            <div class="title-line"></div>
            <h2 class="section-title">热卖商品</h2>
            <div class="title-line"></div>
          </div>
          <p class="section-subtitle">精选好物 · 品质保证 · 限时优惠</p>
        </div>

        <div class="products-grid" v-loading="loading">
          <div class="product-card" v-for="product in hotProducts" :key="product.id">
            <div class="product-image-wrapper" @click="viewProduct(product)">
              <img :src="product.imageUrl || getPlaceholder()" class="product-image" @error="handleImageError" />
              <div class="product-overlay">
                <el-button type="primary" circle size="large">
                  <el-icon :size="20"><View /></el-icon>
                </el-button>
              </div>
              <div class="product-badge" v-if="product.status === 1">
                <span>HOT</span>
              </div>
            </div>
            <div class="product-info">
              <h3 class="product-name" :title="product.name">{{ product.name || '商品名称' }}</h3>
              <p class="product-desc">{{ product.description || '优质商品，值得拥有' }}</p>
              <div class="product-footer">
                <div class="price-box">
                  <span class="price-symbol">¥</span>
                  <span class="price-value">{{ product.originalPrice || '0.00' }}</span>
                </div>
                <el-button 
                  type="danger" 
                  size="small" 
                  round 
                  :disabled="product.status !== 1"
                  @click.stop="handleBuyClick(product)"
                >
                  立即购买
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <div class="load-more" v-if="!loading && hotProducts.length > 0">
          <el-button type="primary" size="large" round @click="$router.push('/products')">
            查看更多商品
          </el-button>
        </div>

        <el-empty v-if="!loading && hotProducts.length === 0" description="暂无热卖商品" />
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getProductList } from '@/api/product'
import { getAddressList } from '@/api/address'
import { createProductOrder } from '@/api/productOrder'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture, Plus } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const hotProducts = ref([])
const buyDialogVisible = ref(false)
const selectedProduct = ref(null)
const buying = ref(false)
const addressList = ref([])
const orderForm = ref({
  quantity: 1,
  addressId: null
})

const categories = [
  { id: 1, name: '数码电器', icon: 'Monitor' },
  { id: 2, name: '服装鞋包', icon: 'Shirt' },
  { id: 3, name: '食品生鲜', icon: 'Food' },
  { id: 4, name: '家居家装', icon: 'House' },
  { id: 5, name: '美妆个护', icon: 'Brush' },
  { id: 6, name: '运动户外', icon: 'Basketball' },
  { id: 7, name: '图书文娱', icon: 'Reading' },
  { id: 8, name: '母婴玩具', icon: 'Present' }
]

const banners = [
  { 
    title: '年终大促', 
    subtitle: '全场5折起 · 满299减50', 
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
  },
  { 
    title: '新品首发', 
    subtitle: '最新款式 · 限时特惠', 
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' 
  },
  { 
    title: '品质保证', 
    subtitle: '正品保障 · 售后无忧', 
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' 
  }
]

const features = [
  { id: 1, icon: 'Van', title: '极速配送', desc: '闪电发货 次日达', color: '#409eff' },
  { id: 2, icon: 'CircleCheck', title: '品质保证', desc: '正品保障 假一赔十', color: '#67c23a' },
  { id: 3, icon: 'Headset', title: '贴心服务', desc: '7x24小时客服', color: '#e6a23c' },
  { id: 4, icon: 'RefreshRight', title: '无忧退换', desc: '7天无理由退换', color: '#f56c6c' }
]

const fetchHotProducts = async () => {
  loading.value = true
  try {
    const res = await getProductList({
      page: 1,
      size: 8
    })
    hotProducts.value = res.data?.list || []
  } catch (error) {
    ElMessage.error('获取热卖商品失败')
  } finally {
    loading.value = false
  }
}

// 获取收货地址列表
const fetchAddressList = async () => {
  try {
    const res = await getAddressList()
    if (res.code === 200 && res.data) {
      addressList.value = Array.isArray(res.data) ? res.data : []
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

// 查看商品详情
const viewProduct = (product) => {
  router.push('/products')
}

const goToProducts = () => {
  router.push('/products')
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

const getPlaceholder = () => {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjIwIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+5ZWG5ZOB5Zu+54mHPC90ZXh0Pjwvc3ZnPg=='
}

const handleImageError = (e) => {
  e.target.src = getPlaceholder()
}

onMounted(() => {
  fetchHotProducts()
  if (userStore.isLoggedIn) {
    fetchAddressList()
  }
})
</script>

<style scoped>
.home {
  margin: -24px -20px;
  background: #f5f5f5;
}

/* 主视觉区域 */
.hero-section {
  background: #fff;
  padding: 20px 0;
}

.hero-container {
  max-width: 1600px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 240px 1fr 300px;
  gap: 20px;
  padding: 0 40px;
}

/* 左侧分类导航 */
.category-nav {
  background: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  padding: 10px 0;
  height: 480px;
  overflow-y: auto;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 24px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 15px;
}

.category-item:hover {
  background: rgba(255, 255, 255, 0.15);
  padding-left: 28px;
}

.category-item .arrow {
  margin-left: auto;
  font-size: 12px;
}

/* 中间轮播图 */
.main-carousel {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.main-carousel :deep(.el-carousel) {
  height: 480px;
}

.banner-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 100px;
}

.banner-content {
  text-align: center;
  color: #fff;
}

.banner-title {
  font-size: 56px;
  font-weight: bold;
  margin: 0 0 20px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.banner-subtitle {
  font-size: 24px;
  margin: 0 0 40px 0;
  opacity: 0.95;
}

.banner-btn {
  padding: 16px 48px;
  font-size: 18px;
  font-weight: bold;
}

/* 右侧快捷入口 */
.quick-links {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.user-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  padding: 20px;
  color: #fff;
  cursor: pointer;
  transition: transform 0.3s;
}

.user-card:hover {
  transform: translateY(-2px);
}

.login-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 30px 20px;
}

.login-text {
  margin: 0;
  font-size: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-text {
  flex: 1;
}

.username {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: bold;
}

.user-level {
  margin: 0;
  font-size: 12px;
  opacity: 0.9;
}

.quick-menu {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  flex: 1;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background: #f5f7fa;
}

.menu-item:hover {
  background: #ecf5ff;
  transform: translateY(-2px);
}

.menu-item span {
  font-size: 13px;
  color: #606266;
}

/* 特色服务 */
.features-section {
  background: #fff;
  padding: 40px 0;
  margin-top: 20px;
}

.container {
  max-width: 90%;
  margin: 0 auto;
  padding: 0 40px;
}

.features-section .container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: #fafafa;
  border-radius: 8px;
  transition: all 0.3s;
}

.feature-item:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
}

.feature-text h4 {
  margin: 0 0 6px 0;
  font-size: 17px;
  color: #303133;
  font-weight: 600;
}

.feature-text p {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

/* 商品区域 */
.products-section {
  padding: 50px 0;
}

.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.title-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 12px;
}

.title-line {
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #409eff);
}

.title-line:last-child {
  background: linear-gradient(90deg, #409eff, transparent);
}

.section-title {
  font-size: 36px;
  font-weight: bold;
  color: #303133;
  margin: 0;
}

.section-subtitle {
  font-size: 15px;
  color: #909399;
  margin: 0;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

@media (max-width: 1600px) {
  .products-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (max-width: 1400px) {
  .container {
    max-width: 1400px;
    padding: 0 20px;
  }
  
  .hero-container {
    max-width: 1400px;
    padding: 0 20px;
  }
  
  .products-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1200px) {
  .hero-container {
    grid-template-columns: 200px 1fr 260px;
  }
  
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-container {
    grid-template-columns: 1fr;
  }
  
  .category-nav {
    display: none;
  }
  
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .features-section .container {
    grid-template-columns: repeat(2, 1fr);
  }
}

.product-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  border-color: #409eff;
}

.product-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;
  background: #fafafa;
}

.product-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-card:hover .product-image {
  transform: scale(1.1);
}

.product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.product-card:hover .product-overlay {
  opacity: 1;
}

.product-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  color: #fff;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(238, 90, 82, 0.4);
  letter-spacing: 1px;
}

.product-info {
  padding: 16px;
}

.product-name {
  font-size: 14px;
  margin: 0 0 8px 0;
  height: 40px;
  line-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  color: #303133;
  font-weight: 500;
}

.product-desc {
  font-size: 12px;
  color: #909399;
  margin: 0 0 12px 0;
  height: 32px;
  line-height: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.price-box {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 14px;
  color: #ff4d4f;
  font-weight: bold;
}

.price-value {
  font-size: 22px;
  color: #ff4d4f;
  font-weight: bold;
  line-height: 1;
}

.load-more {
  text-align: center;
  padding: 20px 0;
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
