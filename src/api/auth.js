import request from '@/utils/request'

// 用户注册
export function register(data) {
  return request({
    url: '/api/auth/base/register',
    method: 'post',
    data
  })
}

// 用户登录
export function login(data) {
  return request({
    url: '/api/auth/base/login',
    method: 'post',
    data
  })
}

// 获取用户信息
export function getUserInfo() {
  return request({
    url: '/api/auth/me',
    method: 'get'
  })
}

// 发送验证码
export function sendVerificationCode(email) {
  return request({
    url: '/api/auth/base/sendVerificationCode',
    method: 'post',
    params: { email }
  })
}

// 更新用户信息
export function updateUser(data) {
  return request({
    url: '/api/auth/update',
    method: 'post',
    data
  })
}
