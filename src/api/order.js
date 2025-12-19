import request from '@/utils/request'

/**
 * 获取用户订单列表
 * @param {number} userId - 用户ID
 */
export function getUserOrders(userId) {
  return request({
    url: '/api/Order/base/selectOrderByUserId',
    method: 'get',
    params: { UserId: userId }
  })
}

/**
 * 获取所有订单（管理员）
 */
export function getAllOrders() {
  return request({
    url: '/api/Order/base/listOrder',
    method: 'post'
  })
}

/**
 * 根据订单号查询订单
 * @param {string} orderNo - 订单号
 */
export function getOrderByNo(orderNo) {
  return request({
    url: '/api/Order/base/selectByOrderNo',
    method: 'get',
    params: { orderNo }
  })
}

/**
 * 更新订单信息
 * @param {Object} order - 订单对象
 */
export function updateOrder(order) {
  return request({
    url: '/api/Order/base/updateOrder',
    method: 'post',
    data: order
  })
}

/**
 * 取消订单
 * @param {string} orderNo - 订单号
 */
export function cancelOrder(orderNo) {
  return updateOrder({
    orderNo,
    status: 2 // 2-已取消
  })
}

/**
 * 支付订单（模拟支付，直接更新订单状态）
 * @param {string} orderNo - 订单号
 */
export function payOrder(orderNo) {
  return updateOrder({
    orderNo,
    status: 1, // 1-已支付
    paymentTime: new Date().toISOString()
  })
}

/**
 * 查询支付状态
 * @param {string} orderNo - 订单号
 */
export function getPaymentStatus(orderNo) {
  return request({
    url: `/api/pay/status/${orderNo}`,
    method: 'get'
  })
}
