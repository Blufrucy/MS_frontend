# 在线秒杀系统 - 前端项目

基于 Vue 3 + Vite + Element Plus 构建的现代化秒杀商城前端应用。

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **Element Plus** - Vue 3 组件库
- **Vue Router** - 官方路由管理器
- **Pinia** - Vue 状态管理
- **Axios** - HTTP 客户端

## 功能特性

### 用户端
- ✅ 用户注册/登录（邮箱验证码）
- ✅ 秒杀商品浏览
- ✅ 商品详情查看
- ✅ 秒杀抢购
- ✅ 个人中心
- ✅ 收货地址管理
- 🚧 订单管理（开发中）

### 管理端
- ✅ 数据统计看板
- ✅ 秒杀商品管理
- ✅ 商品状态控制
- 🚧 普通商品管理（开发中）

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 生产构建

```bash
npm run build
```

### 预览构建

```bash
npm run preview
```

## 项目结构

```
frontend/
├── src/
│   ├── api/              # API 接口
│   │   ├── auth.js       # 认证相关
│   │   ├── product.js    # 商品相关
│   │   ├── seckill.js    # 秒杀相关
│   │   ├── address.js    # 地址相关
│   │   └── admin.js      # 管理相关
│   ├── layouts/          # 布局组件
│   │   ├── MainLayout.vue    # 主布局
│   │   └── AdminLayout.vue   # 管理后台布局
│   ├── views/            # 页面组件
│   │   ├── Home.vue          # 首页
│   │   ├── Login.vue         # 登录
│   │   ├── Register.vue      # 注册
│   │   ├── Seckill.vue       # 秒杀列表
│   │   ├── SeckillDetail.vue # 秒杀详情
│   │   ├── Products.vue      # 商品列表
│   │   ├── Orders.vue        # 订单列表
│   │   ├── Profile.vue       # 个人中心
│   │   ├── Address.vue       # 地址管理
│   │   └── admin/            # 管理后台页面
│   │       ├── Dashboard.vue # 数据统计
│   │       ├── Products.vue  # 商品管理
│   │       └── Seckill.vue   # 秒杀管理
│   ├── stores/           # 状态管理
│   │   └── user.js       # 用户状态
│   ├── utils/            # 工具函数
│   │   └── request.js    # Axios 封装
│   ├── router/           # 路由配置
│   │   └── index.js
│   ├── App.vue           # 根组件
│   └── main.js           # 入口文件
├── index.html
├── vite.config.js        # Vite 配置
└── package.json
```

## API 代理配置

开发环境下，所有 API 请求会自动代理到后端服务器（http://localhost:8080）

```javascript
// vite.config.js
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true
  },
  '/admin': {
    target: 'http://localhost:8080',
    changeOrigin: true
  },
  '/seckill': {
    target: 'http://localhost:8080',
    changeOrigin: true
  }
}
```

## 环境要求

- Node.js >= 16
- npm >= 8

## 注意事项

1. 确保后端服务已启动（默认端口 8080）
2. 首次运行需要先安装依赖
3. 开发时浏览器会自动打开并热重载

## 待开发功能

- [ ] 订单列表和详情页面
- [ ] 支付流程页面
- [ ] 商品搜索功能
- [ ] 购物车功能
- [ ] 用户评价系统
- [ ] 实时库存更新（WebSocket）

## 界面预览

### 用户端
- 首页：展示热门秒杀商品
- 秒杀专区：按状态筛选秒杀商品
- 商品详情：查看商品信息并抢购
- 个人中心：管理个人信息和地址

### 管理端
- 数据看板：展示系统统计数据
- 秒杀管理：添加、编辑、上下架秒杀商品

## License

MIT
