# 🔧 数据库修复指南

## 🚨 问题：用户表缺少username列

### 问题描述
```
The column `users.username` does not exist in the current database.
```

### ✅ 解决方案

我已经创建了完整的数据库重建脚本，包含正确的表结构和测试数据。

## 🚀 快速修复（推荐）

### 方法1：使用重建脚本
```bash
# 双击运行或在PowerShell中执行
./rebuild-database.bat
```

### 方法2：手动步骤
```powershell
# 1. 停止并清理
docker-compose down -v
docker system prune -f

# 2. 重新构建
docker-compose build --no-cache

# 3. 启动服务
docker-compose up -d
```

## 📋 修复内容

### 1. 更新了数据库初始化脚本
- `db_init_scripts/init_db.sql` - 包含完整的表结构
- 正确的用户表结构，包含username字段
- 预置的测试用户数据

### 2. 测试用户账户
| 用户名 | 密码 | 角色 | 说明 |
|--------|------|------|------|
| admin | admin | ADMIN | 管理员 |
| manager | manager | MANAGER | 经理 |
| user1 | user1 | USER | 普通用户 |

### 3. 数据库表结构
- ✅ users (包含username, email, password_hash等)
- ✅ categories (商品分类)
- ✅ suppliers (供应商)
- ✅ products (商品)
- ✅ inventory_items (库存项目)
- ✅ stock_movements (库存移动记录)

## 🔍 验证修复

### 1. 检查容器状态
```bash
docker-compose ps
```

### 2. 检查数据库连接
```bash
# 连接到数据库容器
docker exec -it inventory_postgres_db psql -U user -d inventory_db

# 检查用户表结构
\d users

# 查看用户数据
SELECT username, email, role FROM users;

# 退出
\q
```

### 3. 测试登录
- 访问：http://localhost:3000/login
- 使用任一测试账户登录

## 🆘 如果仍有问题

### 检查日志
```bash
# 应用日志
docker-compose logs next-app

# 数据库日志
docker-compose logs db
```

### 重置所有数据
```bash
# 完全清理
docker-compose down -v
docker system prune -a -f
docker volume prune -f

# 重新开始
docker-compose up -d
```

## 📞 技术细节

### 密码哈希
- 使用bcrypt算法
- Salt rounds: 10
- 所有测试用户密码都是用户名本身

### 数据库配置
- PostgreSQL 15
- 端口：15432 (避免冲突)
- 数据库名：inventory_db
- 用户名：user
- 密码：password 