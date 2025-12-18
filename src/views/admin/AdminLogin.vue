<template>
  <div class="admin-login-container">
    <div class="login-box">
      <div class="login-header">
        <el-icon :size="48" color="#409EFF"><Lock /></el-icon>
        <h1>管理员登录</h1>
        <p>秒杀系统后台管理</p>
      </div>

      <el-form :model="form" :rules="rules" ref="formRef" class="login-form">
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="管理员账号"
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
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

        <div class="login-footer">
          <el-link type="primary" @click="$router.push('/login')">
            返回用户登录
          </el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { adminLogin } from '@/api/adminAuth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const formRef = ref()

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入管理员账号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const res = await adminLogin({
        username: form.username,
        password: form.password
      })

      // 保存管理员登录信息
      userStore.setToken(res.data.token)
      userStore.setUserInfo({
        ...res.data,
        role: 'admin'  // 标记为管理员
      })

      console.log('管理员登录成功，userInfo:', userStore.userInfo)
      console.log('isAdmin:', userStore.isAdmin)

      ElMessage.success('登录成功')
      
      // 使用 setTimeout 确保状态已更新
      setTimeout(() => {
        router.push('/admin')
      }, 100)
    } catch (error) {
      console.error('登录失败:', error)
      console.error('错误详情:', error.response?.data)
      // 错误已由拦截器处理，但如果拦截器没处理，这里兜底
      if (!error.response) {
        ElMessage.error('网络错误，请检查后端服务是否启动')
      }
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.admin-login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-box {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 16px;
  padding: 48px 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h1 {
  font-size: 28px;
  margin: 16px 0 8px 0;
  color: #303133;
  font-weight: 600;
}

.login-header p {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.login-form {
  margin-top: 32px;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 8px;
}

.login-footer {
  text-align: center;
  margin-top: 24px;
}
</style>
