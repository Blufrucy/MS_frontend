<template>
  <div class="main-layout">
    <el-container>
      <el-header class="header">
        <div class="header-content">
          <div class="logo" @click="$router.push('/')">
            <el-icon :size="28"><ShoppingCart /></el-icon>
            <span>秒杀商城</span>
          </div>
          
          <el-menu
            :default-active="activeMenu"
            mode="horizontal"
            :ellipsis="false"
            class="nav-menu"
            router
          >
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/seckill">秒杀专区</el-menu-item>
            <el-menu-item index="/products">全部商品</el-menu-item>
          </el-menu>

          <div class="user-actions">
            <template v-if="userStore.isLoggedIn">
              <el-dropdown @command="handleCommand">
                <span class="user-info">
                  <el-avatar :size="32" :src="userStore.userInfo?.avatar">
                    {{ userStore.userInfo?.nickname?.[0] }}
                  </el-avatar>
                  <span class="username">{{ userStore.userInfo?.nickname }}</span>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                    <el-dropdown-item command="orders">我的订单</el-dropdown-item>
                    <el-dropdown-item command="address">收货地址</el-dropdown-item>
                    <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
            <template v-else>
              <el-button type="primary" @click="$router.push('/login')">登录</el-button>
              <el-button @click="$router.push('/register')">注册</el-button>
            </template>
          </div>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view />
      </el-main>

      <el-footer class="footer">
        <p>© 2025 在线秒杀系统 - 所有权利保留</p>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)

// 检查是否是管理员登录状态
onMounted(() => {
  if (userStore.isAdmin) {
    ElMessageBox.alert('检测到管理员账号，请使用管理后台', '提示', {
      confirmButtonText: '前往管理后台',
      showClose: false,
      callback: () => {
        router.push('/admin')
      }
    })
  }
})

const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'orders':
      router.push('/orders')
      break
    case 'address':
      router.push('/address')
      break
    case 'logout':
      userStore.logout()
      ElMessage.success('退出成功')
      router.push('/')
      break
  }
}
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  background: #f5f7fa;
}

.header {
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 0;
  height: 70px;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  max-width: 95%;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  cursor: pointer;
  user-select: none;
  transition: transform 0.3s;
}

.logo:hover {
  transform: scale(1.05);
}

.nav-menu {
  flex: 1;
  border: none;
  margin: 0 48px;
}

.nav-menu :deep(.el-menu-item) {
  font-size: 15px;
  font-weight: 500;
  height: 70px;
  line-height: 70px;
  padding: 0 24px;
  transition: all 0.3s;
}

.nav-menu :deep(.el-menu-item:hover) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.nav-menu :deep(.el-menu-item.is-active) {
  color: #667eea;
  border-bottom: 3px solid #667eea;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-actions :deep(.el-button) {
  height: 40px;
  padding: 0 24px;
  border-radius: 20px;
  font-weight: 500;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 6px 16px;
  border-radius: 24px;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.user-info:hover {
  background: #f5f7fa;
  border-color: #e4e7ed;
}

.username {
  font-size: 15px;
  color: #303133;
  font-weight: 500;
}

.main-content {
  width: 100%;
  margin: 0;
  padding: 0;
  min-height: calc(100vh - 130px);
}

.footer {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: #fff;
  text-align: center;
  padding: 24px;
  height: 60px;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);
}

.footer p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}
</style>
