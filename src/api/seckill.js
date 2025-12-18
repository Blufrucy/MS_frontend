import request from '@/utils/request'

// 秒杀下单
export function doSeckill(data) {
  return request({
    url: '/api/seckill/doSeckill',
    method: 'post',
    params: data,
    timeout: 30000 // 秒杀接口可能需要更长时间，设置30秒超时
  })
}

// 库存预热
export function warmUpStock(seckillProductId) {
  return request({
    url: '/api/seckill/base/warmUp',
    method: 'post',
    params: { seckillProductId }
  })
}
