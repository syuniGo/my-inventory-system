# 库存管理系统 API 文档

## 概述

这是一个基于 Next.js 和 PostgreSQL 的库存管理系统，提供完整的商品、分类、供应商、库存管理和用户认证功能。

## 已完成的功能

### ✅ 阶段一：项目基础设施
- [x] Next.js 项目结构（App Router）
- [x] PostgreSQL 数据库配置
- [x] Docker 容器化部署
- [x] Prisma ORM 集成
- [x] TypeScript 配置
- [x] 测试框架搭建（Jest）

### ✅ 阶段二：核心功能开发

#### 2.1 商品管理模块
- [x] 商品 CRUD API
- [x] 商品搜索、分页、排序
- [x] 价格范围过滤
- [x] 分类关联管理

#### 2.2 库存管理模块
- [x] 库存项目 CRUD API
- [x] 库存移动记录管理
- [x] 低库存预警
- [x] 批次号和过期日期管理
- [x] 存储位置管理

#### 2.3 供应商管理模块
- [x] 供应商 CRUD API
- [x] 供应商搜索功能
- [x] 商品关联统计

### ✅ 阶段三：用户认证和权限管理

#### 3.1 用户认证系统
- [x] 用户注册和登录
- [x] 密码哈希和验证
- [x] Token生成和验证
- [x] 用户会话管理

#### 3.2 权限控制系统
- [x] 基于角色的访问控制（RBAC）
- [x] 三级权限：USER、MANAGER、ADMIN
- [x] API端点权限保护
- [x] 用户数据访问控制

#### 3.3 用户管理功能
- [x] 用户CRUD操作
- [x] 用户搜索和过滤
- [x] 角色管理
- [x] 账户激活/停用

## API 端点

### 🔓 公开端点（无需认证）
- `GET /api/health` - 系统健康检查

### 🔐 认证端点
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息 🔒

### 👥 用户管理（需要权限）
- `GET /api/users` - 获取用户列表 🔒 MANAGER+
- `POST /api/users` - 创建新用户 🔒 ADMIN
- `GET /api/users/[id]` - 获取单个用户 🔒 自己或MANAGER+
- `PUT /api/users/[id]` - 更新用户信息 🔒 自己或MANAGER+
- `DELETE /api/users/[id]` - 删除用户 🔒 ADMIN

### 📦 分类管理
- `GET /api/categories` - 获取分类列表
- `POST /api/categories` - 创建新分类
- `GET /api/categories/[id]` - 获取单个分类
- `PUT /api/categories/[id]` - 更新分类
- `DELETE /api/categories/[id]` - 删除分类

### 🛍️ 商品管理
- `GET /api/products` - 获取商品列表
- `POST /api/products` - 创建新商品
- `GET /api/products/[id]` - 获取单个商品
- `PUT /api/products/[id]` - 更新商品
- `DELETE /api/products/[id]` - 删除商品

### 🏢 供应商管理
- `GET /api/suppliers` - 获取供应商列表
- `POST /api/suppliers` - 创建新供应商
- `GET /api/suppliers/[id]` - 获取单个供应商
- `PUT /api/suppliers/[id]` - 更新供应商
- `DELETE /api/suppliers/[id]` - 删除供应商

### 📊 库存管理（需要认证）
- `GET /api/inventory` - 获取库存列表 🔒 认证用户
- `POST /api/inventory` - 创建库存项目 🔒 MANAGER+
- `GET /api/inventory/[id]` - 获取单个库存项目 🔒 认证用户
- `PUT /api/inventory/[id]` - 更新库存项目 🔒 MANAGER+
- `DELETE /api/inventory/[id]` - 删除库存项目 🔒 MANAGER+

### 📈 库存移动（需要认证）
- `GET /api/stock-movements` - 获取库存移动记录 🔒 认证用户
- `POST /api/stock-movements` - 创建库存移动记录 🔒 认证用户

## 权限说明

### 🔒 权限图标说明
- 🔓 公开访问
- 🔒 需要认证
- 🔒 USER - 需要USER权限
- 🔒 MANAGER+ - 需要MANAGER或ADMIN权限
- 🔒 ADMIN - 需要ADMIN权限

### 角色权限层级
1. **USER** (普通用户)
   - 查看库存信息
   - 创建库存移动记录
   - 查看自己的操作记录
   - 更新自己的基本信息

2. **MANAGER** (管理员)
   - 包含USER的所有权限
   - 管理库存项目（增删改）
   - 查看所有用户的操作记录
   - 查看用户列表
   - 为其他用户创建库存移动记录

3. **ADMIN** (超级管理员)
   - 包含MANAGER的所有权限
   - 创建和删除用户
   - 修改用户角色和状态
   - 完整的系统管理权限

## 认证使用方法

### 1. 用户注册
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "password123",
    "firstName": "New",
    "lastName": "User"
  }'
```

### 2. 用户登录
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin"
  }'
```

### 3. 使用Token访问API
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/auth/me
```

## 默认用户账户

| 用户名 | 密码 | 角色 | 说明 |
|--------|------|------|------|
| admin | admin | ADMIN | 超级管理员 |
| manager | manager | MANAGER | 管理员 |
| user1 | user1 | USER | 普通用户 |

## 数据模型

### 用户 (User)
```typescript
{
  id: number
  username: string
  email: string
  passwordHash: string
  role: 'ADMIN' | 'MANAGER' | 'USER'
  firstName?: string
  lastName?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### 分类 (Category)
```typescript
{
  id: number
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
}
```

### 供应商 (Supplier)
```typescript
{
  id: number
  name: string
  contactPerson?: string
  phone?: string
  email?: string
  address?: string
  createdAt: Date
  updatedAt: Date
}
```

### 商品 (Product)
```typescript
{
  id: number
  name: string
  description?: string
  sku: string
  categoryId?: number
  supplierId?: number
  purchasePrice?: Decimal
  sellingPrice: Decimal
  imageUrl?: string
  lowStockThreshold?: number
  createdAt: Date
  updatedAt: Date
}
```

### 库存项目 (InventoryItem)
```typescript
{
  id: number
  productId: number
  quantity: number
  reservedQuantity: number
  location?: string
  batchNumber?: string
  expiryDate?: Date
  createdAt: Date
  updatedAt: Date
}
```

### 库存移动 (StockMovement)
```typescript
{
  id: number
  productId: number
  inventoryItemId?: number
  userId: number
  type: 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'TRANSFER' | 'RETURN' | 'DAMAGE' | 'EXPIRED' | 'OTHER'
  quantity: number
  reason?: string
  reference?: string
  notes?: string
  createdAt: Date
}
```

## API 功能特性

### 分页和排序
所有列表 API 都支持：
- `page` - 页码（默认：1）
- `limit` - 每页数量（默认：20）
- `sortBy` - 排序字段
- `sortOrder` - 排序方向（asc/desc）

### 搜索功能
- 商品：按名称、SKU、描述搜索
- 分类：按名称、描述搜索
- 供应商：按名称、联系人、邮箱、电话搜索
- 库存：按商品信息搜索
- 用户：按用户名、邮箱、姓名搜索

### 过滤功能
- 商品：按分类、价格范围过滤
- 库存：按低库存、存储位置、分类过滤
- 库存移动：按商品、类型、用户、日期范围过滤
- 用户：按角色、激活状态过滤

### 统计信息
- 库存：总价值、低库存项目数量
- 库存移动：入库/出库记录统计
- 分类：关联商品数量
- 供应商：关联商品数量
- 用户：库存操作记录数量

## 开发和测试

### 环境设置
```bash
# 安装依赖
npm install

# 启动数据库
docker-compose up -d

# 生成 Prisma Client
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev

# 播种测试数据
npm run db:seed

# 启动开发服务器
npm run dev
```

### 测试脚本
```bash
# 数据库连接测试
npm run db:test

# 基础 API 测试
npm run test:api

# 动态路由测试
npm run test:dynamic

# 库存管理 API 测试
npm run test:inventory

# 认证 API 测试
npm run test:auth

# 运行单元测试
npm test
```

## 技术栈

- **框架**: Next.js 15 (App Router)
- **数据库**: PostgreSQL
- **ORM**: Prisma
- **语言**: TypeScript
- **认证**: 简单Token认证（可扩展为JWT）
- **权限**: 基于角色的访问控制（RBAC）
- **容器化**: Docker & Docker Compose
- **测试**: Jest, Supertest
- **代码质量**: ESLint, Prettier

## 安全特性

- 用户认证和授权
- 密码哈希存储
- Token过期控制
- 基于角色的权限控制
- 数据验证和清理
- SQL 注入防护（Prisma ORM）
- 错误处理和日志记录
- 外键约束检查
- 事务支持

## 性能优化

- 数据库索引优化
- 分页查询减少内存使用
- 关联查询优化
- 连接池管理
- 权限检查缓存

## 下一步开发计划

1. **前端界面开发**
   - 用户登录/注册界面
   - 库存管理仪表板
   - 用户管理界面
   - 权限控制组件

2. **高级认证功能**
   - JWT Token实现
   - 刷新Token机制
   - 密码重置功能
   - 多因素认证

3. **报表和分析功能**
   - 库存报表
   - 销售分析
   - 用户活动统计
   - 数据可视化

4. **系统增强**
   - 文件上传和图片管理
   - 通知和预警系统
   - 审计日志
   - 系统配置管理

5. **部署优化**
   - 生产环境配置
   - 性能监控
   - 错误追踪
   - 部署到 Cloudflare Pages

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License 