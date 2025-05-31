# 认证和权限管理系统

## 概述

本系统实现了一个简单但功能完整的认证和权限管理系统，支持用户注册、登录、权限控制等功能。

## 功能特性

### ✅ 已实现功能

#### 1. 用户认证
- **用户注册** (`POST /api/auth/register`)
  - 用户名、邮箱、密码验证
  - 自动密码哈希
  - 默认角色为 USER
  - 返回用户信息和认证token

- **用户登录** (`POST /api/auth/login`)
  - 用户名/密码验证
  - 账户激活状态检查
  - 生成认证token（24小时有效期）
  - 返回用户信息和token

- **获取当前用户信息** (`GET /api/auth/me`)
  - 需要有效的认证token
  - 返回当前登录用户的详细信息

#### 2. 用户管理
- **获取用户列表** (`GET /api/users`) - 需要MANAGER权限
  - 支持搜索、分页、排序
  - 按角色和激活状态过滤
  - 显示用户的库存操作统计

- **创建用户** (`POST /api/users`) - 需要ADMIN权限
  - 管理员可以创建任意角色的用户
  - 完整的数据验证

- **获取单个用户** (`GET /api/users/[id]`)
  - 用户可以查看自己的信息
  - 管理员可以查看所有用户信息
  - 包含用户的库存操作历史

- **更新用户信息** (`PUT /api/users/[id]`)
  - 用户可以更新自己的基本信息
  - 只有管理员可以修改角色和激活状态

- **删除用户** (`DELETE /api/users/[id]`) - 需要ADMIN权限
  - 不能删除自己的账户
  - 检查关联数据保护

#### 3. 权限控制
- **角色层级**
  - `USER` (权限级别: 1) - 普通用户
  - `MANAGER` (权限级别: 2) - 管理员
  - `ADMIN` (权限级别: 3) - 超级管理员

- **权限中间件**
  - `withAuth` - 需要认证
  - `withRole` - 需要特定角色权限
  - `requireAuth` - 认证检查函数
  - `requireRole` - 权限检查函数

#### 4. API权限保护
- **库存管理API** - 需要认证
  - 普通用户可以查看库存
  - 管理员可以创建/修改库存项目

- **库存移动API** - 需要认证
  - 普通用户只能查看自己的操作记录
  - 普通用户可以创建库存移动记录
  - 管理员可以为其他用户创建记录

## 技术实现

### 1. 认证机制
```typescript
// 简单的Base64 Token（生产环境建议使用JWT）
const token = Buffer.from(JSON.stringify({
  userId,
  username,
  role,
  exp: Date.now() + (24 * 60 * 60 * 1000) // 24小时过期
})).toString('base64');
```

### 2. 密码安全
```typescript
// 简单的Base64哈希（生产环境建议使用bcrypt）
const hashedPassword = Buffer.from(password).toString('base64');
```

### 3. 权限检查
```typescript
// 角色层级检查
const roleHierarchy = {
  'USER': 1,
  'MANAGER': 2,
  'ADMIN': 3,
};

function hasPermission(userRole: string, requiredRole: string): boolean {
  const userLevel = roleHierarchy[userRole] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;
  return userLevel >= requiredLevel;
}
```

## API使用示例

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

### 3. 使用Token访问受保护的API
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/auth/me
```

### 4. 获取用户列表（需要管理员权限）
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  "http://localhost:3000/api/users?page=1&limit=10"
```

## 默认用户账户

系统提供以下默认用户账户（通过种子数据创建）：

| 用户名 | 密码 | 角色 | 说明 |
|--------|------|------|------|
| admin | admin | ADMIN | 超级管理员 |
| manager | manager | MANAGER | 管理员 |
| user1 | user1 | USER | 普通用户 |

## 安全特性

### 1. 数据验证
- 邮箱格式验证
- 密码长度验证（最少6位）
- 用户名唯一性检查
- 输入数据清理和转换

### 2. 权限控制
- 基于角色的访问控制（RBAC）
- API端点权限保护
- 用户只能访问自己的数据
- 管理员权限分级

### 3. 错误处理
- 统一的错误响应格式
- 敏感信息保护
- 详细的错误日志记录

### 4. Token安全
- Token过期时间控制
- 无效Token检测
- 用户激活状态检查

## 测试

### 运行认证测试
```bash
npm run test:auth
```

### 测试覆盖的场景
- 用户注册和登录
- Token验证
- 权限检查
- 错误处理
- 边界条件测试

## 生产环境建议

### 1. 安全增强
- 使用真正的JWT库（如jsonwebtoken）
- 使用bcrypt进行密码哈希
- 添加密码复杂度要求
- 实现密码重置功能
- 添加登录尝试限制

### 2. 功能扩展
- 刷新Token机制
- 多因素认证（2FA）
- 社交登录集成
- 审计日志记录
- 会话管理

### 3. 性能优化
- Token缓存机制
- 权限缓存
- 数据库查询优化
- API限流

## 下一步开发

1. **前端认证界面**
   - 登录/注册表单
   - 用户管理界面
   - 权限控制组件

2. **高级权限功能**
   - 细粒度权限控制
   - 资源级权限
   - 动态权限分配

3. **安全增强**
   - HTTPS强制
   - CSRF保护
   - XSS防护
   - 安全头设置

4. **监控和日志**
   - 登录日志
   - 操作审计
   - 安全事件监控
   - 性能监控 