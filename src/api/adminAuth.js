import request from '@/utils/request'

// 管理员登录
export function adminLogin(data) {
  return request({
    url: '/api/admin/auth/login',
    method: 'post',
    params: data
  })
}

// 获取管理员信息
export function getAdminInfo() {
  return request({
    url: '/api/admin/auth/info',
    method: 'get'
  })
}
