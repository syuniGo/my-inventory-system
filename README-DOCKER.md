# Docker 部署指南

## 概述

使用Docker来运行库存管理系统，自动安装Material UI依赖并配置完整的开发环境。

## 🚀 快速开始

### 方法1：使用修复脚本（推荐）

**如果遇到依赖冲突问题，使用修复脚本：**
```cmd
# 在 my-inventory-system 目录中运行
.\fix-and-run.bat
```

### 方法2：使用管理脚本

**Windows 批处理脚本：**
```cmd
# 在 my-inventory-system 目录中运行
.\docker-manage.bat
```

**PowerShell 脚本：**
```powershell
# 在 my-inventory-system 目录中运行
.\docker-manage.ps1
```

### 方法3：手动Docker命令

```bash
# 清理并重新构建
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 查看日志
docker-compose logs -f
```

## 📋 服务配置

### Next.js 应用
- **端口**: 3000
- **访问地址**: http://localhost:3000
- **容器名**: inventory_next_app

### PostgreSQL 数据库
- **端口**: 15432 (避免与本地PostgreSQL冲突)
- **用户名**: user
- **密码**: password
- **数据库名**: inventory_db
- **容器名**: inventory_postgres_db

## 🔧 Docker配置详情

### Dockerfile.dev 特性
- ✅ 自动安装Material UI依赖
- ✅ 生成Prisma客户端
- ✅ 热重载支持
- ✅ 依赖缓存优化
- ✅ 启动脚本检查

### docker-compose.yml 特性
- ✅ 服务编排
- ✅ 网络隔离
- ✅ 数据持久化
- ✅ 环境变量配置
- ✅ 自动重启

## 🔧 依赖冲突修复

### 问题说明
Material UI Lab与React 19存在版本冲突，已通过以下方式修复：
- 移除了 `@mui/lab` 包
- 使用 `--legacy-peer-deps` 标志
- 更新到兼容的Material UI版本

### 自动安装的依赖
Docker容器会自动安装以下Material UI依赖：
- @mui/material@^6.4.11
- @emotion/react@^11.13.5
- @emotion/styled@^11.13.5
- @mui/icons-material@^6.4.11

## 🛠️ 常用命令

### 启动服务
```bash
docker-compose up --build -d
```

### 查看实时日志
```bash
docker-compose logs -f next-app
```

### 重新构建服务
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 进入容器
```bash
# 进入Next.js容器
docker exec -it inventory_next_app sh

# 进入数据库容器
docker exec -it inventory_postgres_db psql -U user -d inventory_db
```

### 清理资源
```bash
# 停止并删除容器
docker-compose down

# 删除所有相关资源
docker-compose down -v
docker system prune -a -f
```

## 🛠️ 故障排除

### 问题1：依赖冲突错误
```
npm error ERESOLVE unable to resolve dependency tree
```

**解决方案：**
```bash
# 使用修复脚本
.\fix-and-run.bat

# 或手动执行
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 问题2：Material UI依赖未安装
```bash
# 查看容器日志
docker-compose logs next-app

# 重新构建容器
docker-compose build --no-cache next-app
```

### 问题3：端口被占用
```bash
# 检查端口占用
netstat -ano | findstr :3000
netstat -ano | findstr :15432

# 修改docker-compose.yml中的端口映射
```

### 问题4：Prisma客户端错误
```bash
# 进入容器重新生成
docker exec -it inventory_next_app npx prisma generate
```

## 📊 监控和调试

### 查看容器状态
```bash
docker-compose ps
```

### 查看资源使用
```bash
docker stats
```

### 查看网络配置
```bash
docker network ls
docker network inspect my-inventory-system_inventory_network
```

## 🔄 开发工作流

1. **启动开发环境**
   ```bash
   .\fix-and-run.bat
   ```

2. **查看日志确认启动**
   ```bash
   docker-compose logs -f
   ```

3. **访问应用**
   - 前端: http://localhost:3000
   - 数据库: localhost:15432

4. **代码修改**
   - 文件修改会自动热重载
   - 无需重启容器

5. **停止开发环境**
   ```bash
   docker-compose down
   ```

## 🚀 生产部署

对于生产环境，建议：
1. 使用多阶段构建
2. 配置环境变量
3. 使用外部数据库
4. 配置反向代理
5. 启用HTTPS

## 📞 支持

如果遇到问题：
1. 使用修复脚本：`.\fix-and-run.bat`
2. 查看容器日志：`docker-compose logs`
3. 重新构建：`docker-compose build --no-cache`
4. 检查Docker版本：`docker --version`
5. 检查Docker Compose版本：`docker-compose --version` 