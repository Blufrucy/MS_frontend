# 秒杀功能使用指南

## 问题说明

如果在秒杀时遇到 `{"code":201,"msg":"手慢了，库存不足","data":null}` 错误，但数据库中明明有库存，这是因为：

**秒杀系统使用 Redis 缓存库存，需要先进行库存预热！**

## 秒杀流程

### 1. 库存预热（必须步骤）

秒杀系统为了高性能，将库存数据从数据库加载到 Redis 中。在秒杀开始前，必须先预热库存。

#### 方式一：自动预热（推荐）
- 用户访问秒杀详情页时，系统会自动检测并预热进行中的秒杀商品
- 无需手动操作

#### 方式二：管理后台手动预热
1. 登录管理后台（`/admin`）
2. 进入"秒杀管理"页面
3. 找到状态为"进行中"的商品
4. 点击"预热库存"按钮

### 2. 秒杀下单

预热完成后，用户就可以正常进行秒杀购买了。

## 技术原理

### 为什么需要预热？

1. **高并发性能**：秒杀场景下，数据库无法承受高并发读写，使用 Redis 可以提升性能
2. **原子性操作**：Redis + Lua 脚本保证库存扣减的原子性，避免超卖
3. **防止重复购买**：Redis Set 记录用户购买记录，防止同一用户重复抢购

### 预热做了什么？

```java
// 1. 从数据库读取秒杀商品的可用库存
SeckillProduct seckillProduct = seckillProductMapper.selectById(seckillProductId);

// 2. 将库存写入 Redis
String stockKey = "seckill:stock:{seckillProductId}";
redis.set(stockKey, seckillProduct.getAvailableStock(), expireTime);

// 3. 初始化用户购买记录集合
String userKey = "seckill:user:{seckillProductId}";
redis.createSet(userKey, expireTime);
```

### 秒杀流程

```
用户点击抢购
    ↓
执行 Lua 脚本（原子操作）
    ├─ 检查 Redis 库存是否充足
    ├─ 检查用户是否已购买
    ├─ 扣减 Redis 库存
    └─ 记录用户购买
    ↓
将订单信息放入 Redis 队列
    ↓
后台线程异步消费队列
    ├─ 创建订单记录
    ├─ 扣减数据库库存（乐观锁）
    └─ 记录用户秒杀记录
```

## 常见问题

### Q1: 为什么不直接操作数据库？
A: 数据库无法承受秒杀场景的高并发，会导致性能瓶颈甚至宕机。

### Q2: Redis 库存和数据库库存会不一致吗？
A: 不会。预热时从数据库读取，秒杀成功后异步更新数据库，如果数据库更新失败会回滚 Redis 库存。

### Q3: Redis 宕机了怎么办？
A: Redis 中的库存数据设置了过期时间（活动结束后1小时），过期后会自动清除。下次预热时重新从数据库加载。

### Q4: 如何确认预热成功？
A: 
- 前端：访问秒杀详情页，如果能正常抢购说明预热成功
- 后端：查看 Redis 中是否存在 `seckill:stock:{id}` 键
- 管理后台：点击"预热库存"按钮后提示"库存预热成功"

## 开发建议

1. **测试环境**：建议在秒杀活动开始前提前预热，避免用户访问时才预热
2. **生产环境**：可以通过定时任务在活动开始前自动预热所有进行中的秒杀商品
3. **监控告警**：监控 Redis 连接状态，确保秒杀期间 Redis 服务正常

## 相关文件

- 后端服务：`src/main/java/com/example/msBackend/service/impl/SeckillActivityServiceImpl.java`
- Lua 脚本：`src/main/resources/lua/seckill.lua`
- 前端 API：`frontend/src/api/seckill.js`
- 秒杀详情页：`frontend/src/views/SeckillDetail.vue`
- 管理后台：`frontend/src/views/admin/Seckill.vue`
