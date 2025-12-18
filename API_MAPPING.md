# 前后端接口对接说明

## 已对接接口

### 用户认证模块
- ✅ 注册：`POST /api/auth/base/register`
- ✅ 登录：`POST /api/auth/base/login`
- ✅ 获取用户信息：`GET /api/auth/me`
- ✅ 发送验证码：`POST /api/auth/base/sendVerificationCode`
- ✅ 更新用户信息：`POST /api/auth/update`

### 商品模块
- ✅ 分页查询商品：`POST /api/auth/base/product/page`
  - 参数：`{ pageNum, pageSize, productName }`
- ✅ 分页查询秒杀商品：`POST /api/auth/base/seckillProduct/page`
  - 参数：`{ pageNum, pageSize, seckillProductName }`
  - 注意：后端不支持 status 参数，前端需要自行过滤

### 秒杀模块
- ✅ 秒杀下单：`POST /seckill/doSeckill`
  - 参数：`seckillProductId`, `quantity`
- ✅ 库存预热：`POST /seckill/base/warmUp`
  - 参数：`seckillProductId`

### 地址模块
- ✅ 添加地址：`POST /api/auth/address/add`
- ✅ 获取地址列表：`GET /api/auth/address/list`
- ✅ 更新地址：`PUT /api/auth/address/update`
- ✅ 删除地址：`DELETE /api/auth/address/delete/{addressId}`
- ✅ 设置默认地址：`POST /api/auth/address/setDefault/{addressId}`

### 支付模块
- ✅ 支付回调：`POST /api/pay/callback/{paymentType}`
- ✅ 查询支付状态：`GET /api/pay/status/{orderNo}`

### 管理后台模块
- ✅ 添加秒杀商品：`POST /admin/seckill/products`
- ✅ 更新秒杀商品：`PUT /admin/seckill/products/{id}`
- ✅ 更新商品状态：`PUT /admin/seckill/products/{id}/status`
- ✅ 获取监控统计：`GET /admin/monitor/stats`
- ✅ 获取秒杀商品列表：`GET /admin/listSeckillProducts`

## 参数映射说明

### 分页参数
前端使用 `page` 和 `size`，需要转换为后端的 `pageNum` 和 `pageSize`：

```javascript
// 前端调用
getSeckillProductList({
  page: 1,
  size: 10
})

// 实际发送给后端
{
  pageNum: 1,
  pageSize: 10
}
```

### 状态过滤
后端的秒杀商品查询接口不支持 status 参数，需要前端自行过滤：

```javascript
const res = await getSeckillProductList({ page: 1, size: 100 })
const filtered = res.data.list.filter(p => p.status === 1) // 进行中
```

## 待实现接口

### 订单模块（后端未实现）
- ❌ 获取订单详情：`GET /api/orders/{orderId}`
- ❌ 获取用户订单列表：`GET /api/orders`
- ❌ 取消订单：`POST /api/orders/{orderId}/cancel`
- ❌ 订单支付：`POST /api/orders/{orderId}/pay`

## 注意事项

1. **Token 认证**：除了 `/api/auth/base/*` 和 `/seckill/base/*` 路径外，其他接口都需要在请求头中携带 `Authorization: {token}`

2. **响应格式**：
   ```json
   {
     "code": 200,  // 200成功，201失败
     "msg": "消息",
     "data": {}
   }
   ```

3. **跨域配置**：开发环境使用 Vite 代理，生产环境需要后端配置 CORS

4. **图片上传**：使用 `multipart/form-data` 格式

5. **时间格式**：使用 ISO 8601 格式，如 `2025-12-18T10:00:00`

## 调试技巧

1. 打开浏览器开发者工具的 Network 标签查看请求
2. 检查请求 URL、Method、Headers、Payload
3. 查看响应状态码和返回数据
4. 后端日志查看具体错误信息
