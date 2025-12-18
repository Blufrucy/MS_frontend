import request from '@/utils/request'

// 添加地址
export function addAddress(data) {
  return request({
    url: '/api/auth/address/add',
    method: 'post',
    data
  })
}

// 获取地址列表
export function getAddressList() {
  return request({
    url: '/api/auth/address/list',
    method: 'get'
  })
}

// 更新地址
export function updateAddress(data) {
  return request({
    url: '/api/auth/address/update',
    method: 'put',
    data
  })
}

// 删除地址
export function deleteAddress(addressId) {
  return request({
    url: `/api/auth/address/delete/${addressId}`,
    method: 'delete'
  })
}

// 设置默认地址
export function setDefaultAddress(addressId) {
  return request({
    url: `/api/auth/address/setDefault/${addressId}`,
    method: 'post'
  })
}
