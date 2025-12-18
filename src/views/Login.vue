<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-box">
        <h2>欢迎登录</h2>
        <p class="subtitle">秒杀商城 - 限时抢购</p>
        <el-alert
          title="提示：支持使用邮箱或手机号登录"
          type="info"
          :closable="false"
          style="margin-bottom: 20px;"
        />

        <el-form :model="form" :rules="rules" ref="formRef" class="login-form">
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="用户名 / 邮箱 / 手机号"
              size="large"
              prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleLogin"
            class="login-btn"
          >
            登录
          </el-button>

          <div class="footer-links">
            <span>还没有账号？</span>
            <el-button type="primary" link @click="$router.push('/register')">
              立即注册
            </el-button>
          </div>

          <div class="admin-link">
            <el-button type="info" link @click="$router.push('/admin/login')">
              <el-icon><Lock /></el-icon>
              管理员登录
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { login, getUserInfo } from '@/api/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref()
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const res = await login(form)
      userStore.setToken(res.data.token)
      userStore.setUserInfo(res.data)
      
      ElMessage.success('登录成功')
      router.push('/')
    } catch (error) {
      console.error('登录失败:', error)
      // 错误已经在 request.js 的拦截器中处理并显示了
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.login-page::before {
  content: '';
  position: absolute;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: moveBackground 20s linear infinite;
}

@keyframes moveBackground {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

.login-container {
  width: 100%;
  max-width: 440px;
  padding: 20px;
  position: relative;
  z-index: 1;
}

.login-box {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 48px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.login-box h2 {
  text-align: center;
  margin: 0 0 8px 0;
  font-size: 32px;
  color: #303133;
  font-weight: 600;
}

.subtitle {
  text-align: center;
  color: #909399;
  margin: 0 0 40px 0;
  font-size: 15px;
}

.login-form {
  margin-top: 24px;
}

.login-form :deep(.el-input__inner) {
  height: 48px;
  line-height: 48px;
  border-radius: 12px;
  font-size: 15px;
}

.login-form :deep(.el-input__prefix) {
  font-size: 18px;
}

.login-btn {
  width: 100%;
  margin-top: 16px;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
}

.footer-links {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #606266;
}

.admin-link {
  text-align: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}
</style>
