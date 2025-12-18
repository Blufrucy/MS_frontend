import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const request = axios.create({
  baseURL: '/',
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const userStore = useUserStore()
    // 只有当 token 存在且不为空时才添加 Authorization 头
    if (userStore.token && userStore.token.trim()) {
      config.headers.Authorization = userStore.token
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data
    
    if (res.code === 200 || res.code === 1) {
      return res
    } else {
      ElMessage.error(res.msg || '请求失败')
      return Promise.reject(new Error(res.msg || '请求失败'))
    }
  },
  error => {
    // 处理 HTTP 错误状态码
    if (error.response) {
      const status = error.response.status
      const data = error.response.data
      
      if (status === 401) {
        ElMessage.error(data.msg || '未登录或登录已过期，请重新登录')
        // 清除本地 token
        const userStore = useUserStore()
        userStore.logout()
        // 跳转到登录页（如果不在登录页）
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login'
        }
      } else {
        ElMessage.error(data.msg || error.message || '网络错误')
      }
    } else {
      ElMessage.error(error.message || '网络错误')
    }
    return Promise.reject(error)
  }
)

export default request
