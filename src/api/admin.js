import request from '@/utils/request'

// 添加秒杀商品
export function addSeckillProduct(data) {
  return request({
    url: '/api/admin/seckill/products',
    method: 'post',
    data
  })
}

// 更新秒杀商品
export function updateSeckillProduct(id, data) {
  return request({
    url: `/api/admin/seckill/products/${id}`,
    method: 'put',
    data
  })
}

// 更新秒杀商品状态
export function updateSeckillProductStatus(id, status) {
  return request({
    url: `/api/admin/seckill/products/${id}/status`,
    method: 'put',
    data: { status }
  })
}

// 获取系统监控统计
export function getMonitorStats() {
  return request({
    url: '/api/admin/monitor/stats',
    method: 'get'
  })
}

// 获取秒杀商品列表
export function getAdminSeckillList(status) {
  return request({
    url: '/api/admin/listSeckillProducts',
    method: 'get',
    params: status !== undefined ? { status } : {}
  })
}

// 添加普通商品
export function addProduct(formData) {
  return request({
    url: '/api/admin/addProduct',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取商品列表
export function getProductList(status) {
  return request({
    url: '/api/admin/listProducts',
    method: 'get',
    params: status !== undefined ? { status } : {}
  })
}
