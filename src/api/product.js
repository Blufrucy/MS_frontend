import request from '@/utils/request'

// 分页查询商品
export function getProductList(data) {
  // 转换参数名：page -> pageNum, size -> pageSize
  const params = {
    pageNum: data.page || 1,
    pageSize: data.size || 10,
    productName: data.productName
  }
  return request({
    url: '/api/auth/base/product/page',
    method: 'post',
    data: params
  })
}

// 分页查询秒杀商品
export function getSeckillProductList(data) {
  // 转换参数名：page -> pageNum, size -> pageSize
  const params = {
    pageNum: data.page || 1,
    pageSize: data.size || 10,
    seckillProductName: data.seckillProductName,
    status: data.status
  }
  return request({
    url: '/api/auth/base/seckillProduct/page',
    method: 'post',
    data: params
  })
}
