import request from '@/utils/request'

/**
 * 创建普通商品订单
 * @param {Object} data - 订单数据
 */
export function createProductOrder(data) {
  return request({
    url: '/api/product/order/create',
    method: 'post',
    data
  })
}
