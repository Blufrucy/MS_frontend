<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-box">
        <h2>用户注册</h2>
        <p class="subtitle">加入我们，开启秒杀之旅</p>
        <el-alert
          title="注册成功后将自动登录"
          type="success"
          :closable="false"
          style="margin-bottom: 20px;"
        />

        <el-form :model="form" :rules="rules" ref="formRef" class="register-form">
          <el-form-item prop="nickname">
            <el-input
              v-model="form.nickname"
              placeholder="昵称（登录后可修改）"
              size="large"
              prefix-icon="Avatar"
            />
          </el-form-item>

          <el-form-item prop="email">
            <el-input
              v-model="form.email"
              placeholder="邮箱"
              size="large"
              prefix-icon="Message"
            />
          </el-form-item>

          <el-form-item prop="code">
            <div class="code-input">
              <el-input
                v-model="form.code"
                placeholder="验证码"
                size="large"
                prefix-icon="Key"
              />
              <el-button
                :disabled="countdown > 0"
                @click="sendCode"
                size="large"
              >
                {{ countdown > 0 ? `${countdown}秒后重试` : '获取验证码' }}
              </el-button>
            </div>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="密码"
              size="large"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item prop="phone">
            <el-input
              v-model="form.phone"
              placeholder="手机号（可选）"
              size="large"
              prefix-icon="Phone"
            />
          </el-form-item>

          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleRegister"
            class="register-btn"
          >
            注册
          </el-button>

          <div class="footer-links">
            <span>已有账号？</span>
            <el-button type="primary" link @click="$router.push('/login')">
              立即登录
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
import { register, sendVerificationCode, login } from '@/api/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const formRef = ref()
const loading = ref(false)
const countdown = ref(0)

const form = reactive({
  nickname: '',
  email: '',
  code: '',
  password: '',
  phone: ''
})

const rules = {
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
}

const sendCode = async () => {
  if (!form.email) {
    ElMessage.warning('请先输入邮箱')
    return
  }

  // 验证邮箱格式
  const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailReg.test(form.email)) {
    ElMessage.warning('请输入正确的邮箱格式')
    return
  }

  try {
    await sendVerificationCode(form.email)
    ElMessage.success('验证码已发送到您的邮箱，请查收')
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    console.error('发送验证码失败:', error)
    ElMessage.error('验证码发送失败，请检查邮箱地址或稍后重试')
  }
}

const handleRegister = async () => {
  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      // 后端会自动生成 username，所以不发送 username 字段
      const registerData = {
        nickname: form.nickname,
        email: form.email,
        code: form.code,
        password: form.password,
        phone: form.phone
      }
      const registerRes = await register(registerData)
      
      // 显示注册成功信息，包含系统生成的用户名
      const username = registerRes.data.username
      const message = registerRes.data.message || `注册成功！您的用户名是：${username}`
      
      ElMessage({
        message: message,
        type: 'success',
        duration: 3000
      })
      
      // 注册成功后自动登录（使用邮箱登录）
      setTimeout(async () => {
        try {
          const loginRes = await login({
            username: form.email,  // 使用邮箱作为用户名登录
            password: form.password
          })
          
          // 保存登录信息
          const userStore = useUserStore()
          userStore.setToken(loginRes.data.token)
          userStore.setUserInfo(loginRes.data)
          
          ElMessage.success('自动登录成功！')
          router.push('/')
        } catch (loginError) {
          console.error('自动登录失败:', loginError)
          ElMessage.warning(`注册成功！您的用户名是：${username}，请手动登录`)
          router.push('/login')
        }
      }, 1000)
      
    } catch (error) {
      console.error('注册失败:', error)
      ElMessage.error('注册失败，该邮箱可能已被注册')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.register-page::before {
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

.register-container {
  width: 100%;
  max-width: 500px;
  position: relative;
  z-index: 1;
}

.register-box {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 48px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.register-box h2 {
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

.register-form :deep(.el-input__inner) {
  height: 48px;
  line-height: 48px;
  border-radius: 12px;
  font-size: 15px;
}

.register-form :deep(.el-input__prefix) {
  font-size: 18px;
}

.code-input {
  display: flex;
  gap: 12px;
}

.code-input .el-input {
  flex: 1;
}

.code-input .el-button {
  height: 48px;
  border-radius: 12px;
  white-space: nowrap;
  padding: 0 20px;
}

.register-btn {
  width: 100%;
  margin-top: 16px;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
}

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(245, 87, 108, 0.5);
}

.footer-links {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #606266;
}
</style>
