<template>
  <div class="detail-page page-container" v-loading="loading">
    <el-card v-if="product">
      <el-row :gutter="40">
        <el-col :span="10">
          <img :src="product.productImageUrl || getPlaceholder()" class="product-image" @error="handleImageError" />
        </el-col>
        <el-col :span="14">
          <div class="product-detail">
            <h1>{{ product.productName }}</h1>
            <p class="description" v-if="product.seckillDescription">{{ product.seckillDescription }}</p>
            
            <div class="price-section">
              <div class="price-item">
                <span class="label">秒杀价</span>
                <span class="seckill-price">¥{{ product.seckillPrice }}</span>
              </div>
              <div class="price-item">
                <span class="label">原价</span>
                <span class="original-price">¥{{ product.originalPrice }}</span>
              </div>
            </div>

            <div class="stock-section">
              <p>库存情况</p>
              <el-progress
                :percentage="getStockPercentage()"
                :color="getProgressColor()"
                :stroke-width="20"
              />
              <p class="stock-text">
                剩余 <span class="highlight">{{ product.availableStock }}</span> 件 / 
                总共 {{ product.stock }} 件
              </p>
            </div>

            <div class="time-section">
              <el-descriptions :column="1" border>
                <el-descriptions-item label="开始时间">
                  {{ formatTime(product.startTime) }}
                </el-descriptions-item>
                <el-descriptions-item label="结束时间">
                  {{ formatTime(product.endTime) }}
                </el-descriptions-item>
                <el-descriptions-item label="状态">
                  <el-tag :type="getStatusType(product.status)">
                    {{ getStatusText(product.status) }}
                  </el-tag>
                </el-descriptions-item>
              </el-descriptions>
            </div>

            <div class="address-section" v-if="product.status === 1">
              <div class="section-title">
                <el-icon><Location /></el-icon>
                <span>收货地址</span>
              </div>
              <el-select
                v-model="selectedAddressId"
                placeholder="请选择收货地址"
                style="width: 100%"
                size="large"
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
            </div>

            <div class="action-section">
              <el-input-number
                v-model="quantity"
                :min="1"
                :max="Math.min(10, product.availableStock)"
                :disabled="product.status !== 1"
              />
              <el-button
                type="danger"
                size="large"
                :disabled="product.status !== 1 || product.availableStock === 0"
                :loading="buying"
                @click="handleBuy"
                class="buy-btn"
              >
                <el-icon><ShoppingCart /></el-icon>
                {{ getBuyButtonText() }}
              </el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { doSeckill, warmUpStock } from '@/api/seckill'
import { getSeckillProductList } from '@/api/product'
import { getAddressList } from '@/api/address'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Location, Plus } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const buying = ref(false)
const product = ref(null)
const quantity = ref(1)
const addressList = ref([])
const selectedAddressId = ref(null)

// 获取商品详情
const fetchProductDetail = async () => {
  loading.value = true
  try {
    // 先获取所有秒杀商品，然后找到对应ID的商品
    const res = await getSeckillProductList({
      page: 1,
      size: 100
    })
    
    if (res.data && res.data.list) {
      const foundProduct = res.data.list.find(p => p.id == route.params.id)
      if (foundProduct) {
        product.value = foundProduct
        // 如果是进行中的秒杀，自动预热库存
        if (foundProduct.status === 1) {
          try {
            await warmUpStock(foundProduct.id)
          } catch (error) {
            // 预热失败不影响页面显示，只记录日志
            console.warn('库存预热失败:', error)
          }
        }
      } else {
        ElMessage.error('商品不存在')
        router.push('/seckill')
      }
    } else {
      ElMessage.error('商品不存在')
      router.push('/seckill')
    }
  } catch (error) {
    ElMessage.error('获取商品详情失败')
  } finally {
    loading.value = false
  }
}

const getStockPercentage = () => {
  if (!product.value) return 0
  return Number(((product.value.stock - product.value.availableStock) / product.value.stock * 100).toFixed(0))
}

const getProgressColor = () => {
  const percentage = getStockPercentage()
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

const getBuyButtonText = () => {
  if (!product.value) return '立即抢购'
  if (product.value.status === 0) return '未开始'
  if (product.value.status === 2) return '已结束'
  if (product.value.availableStock === 0) return '已抢光'
  return '立即抢购'
}

// 获取收货地址列表
const fetchAddressList = async () => {
  try {
    const res = await getAddressList()
    console.log('地址列表响应:', res) // 调试日志
    if (res.code === 200 && res.data) {
      // 后端直接返回数组，不是 { list: [] } 格式
      addressList.value = Array.isArray(res.data) ? res.data : []
      console.log('地址列表:', addressList.value) // 调试日志
      // 自动选择默认地址
      const defaultAddr = addressList.value.find(addr => addr.isDefault)
      if (defaultAddr) {
        selectedAddressId.value = defaultAddr.id
      } else if (addressList.value.length > 0) {
        selectedAddressId.value = addressList.value[0].id
      }
    }
  } catch (error) {
    console.error('获取地址列表失败:', error)
  }
}

const goToAddressManage = () => {
  router.push('/address')
}

const handleBuy = async () => {
  if (!userStore.isLoggedIn) {
    ElMessageBox.confirm('请先登录', '提示', {
      confirmButtonText: '去登录',
      cancelButtonText: '取消'
    }).then(() => {
      router.push('/login')
    }).catch(() => {})
    return
  }

  if (!selectedAddressId.value) {
    ElMessage.warning('请选择收货地址')
    return
  }

  buying.value = true
  try {
    await doSeckill({
      seckillProductId: product.value.id,
      quantity: quantity.value,
      addressId: selectedAddressId.value
    })
    ElMessage.success('抢购成功！请前往订单页面查看')
    // 刷新商品信息
    await fetchProductDetail()
    // 3秒后跳转到订单页面
    setTimeout(() => {
      router.push('/orders')
    }, 2000)
  } catch (error) {
    // 错误消息已由 request 拦截器处理，这里只需刷新商品信息
    await fetchProductDetail()
  } finally {
    buying.value = false
  }
}

const getPlaceholder = () => {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjMwIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+5ZWG5ZOB5Zu+54mHPC90ZXh0Pjwvc3ZnPg=='
}

const handleImageError = (e) => {
  e.target.src = getPlaceholder()
}

onMounted(() => {
  fetchProductDetail()
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

.detail-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.product-image {
  width: 100%;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.product-detail {
  padding-left: 20px;
}

.product-detail h1 {
  font-size: 32px;
  margin: 0 0 16px 0;
  color: #303133;
  font-weight: 600;
  line-height: 1.4;
}

.description {
  color: #606266;
  margin-bottom: 32px;
  font-size: 15px;
  line-height: 1.6;
}

.price-section {
  display: flex;
  gap: 48px;
  padding: 32px;
  background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
  border-radius: 16px;
  margin-bottom: 32px;
  border: 2px solid #ffebeb;
}

.price-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.label {
  font-size: 14px;
  color: #909399;
  font-weight: 500;
}

.seckill-price {
  font-size: 48px;
  color: #ff4d4f;
  font-weight: bold;
  line-height: 1;
}

.seckill-price::before {
  content: '¥';
  font-size: 32px;
}

.original-price {
  font-size: 28px;
  color: #909399;
  text-decoration: line-through;
  align-self: flex-end;
  margin-bottom: 8px;
}

.stock-section {
  margin-bottom: 32px;
  padding: 24px;
  background: #f5f7fa;
  border-radius: 12px;
}

.stock-section > p:first-child {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

.stock-bar {
  height: 24px;
  background: #e4e7ed;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
  position: relative;
}

.stock-progress {
  height: 100%;
  background: linear-gradient(90deg, #ff6b6b, #ff4d4f);
  border-radius: 12px;
  transition: width 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stock-progress::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.stock-text {
  margin-top: 8px !important;
  font-size: 14px;
  color: #606266;
}

.highlight {
  color: #ff4d4f;
  font-weight: bold;
  font-size: 20px;
}

.time-section {
  margin-bottom: 32px;
}

.address-section {
  margin-bottom: 24px;
  padding: 24px;
  background: #f5f7fa;
  border-radius: 12px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
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

.action-section {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.action-section :deep(.el-input-number) {
  width: 150px;
}

.action-section :deep(.el-input-number .el-input__inner) {
  height: 48px;
  line-height: 48px;
  font-size: 18px;
}

.buy-btn {
  flex: 1;
  height: 56px;
  font-size: 20px;
  font-weight: 600;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.3);
}

.buy-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 77, 79, 0.4);
}

.buy-btn:active:not(:disabled) {
  transform: translateY(0);
}
</style>
