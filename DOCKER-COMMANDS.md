# Docker容器内测试命令参考

## 🚀 快速启动

### 使用PowerShell（推荐）
```powershell
.\start-with-docker.ps1
```

### 使用批处理
```cmd
start-with-docker.bat
```

## 🐳 Docker管理命令

### 基本容器操作
```bash
# 启动所有服务
docker-compose up -d

# 启动特定服务
docker-compose up db -d
docker-compose up next-app -d

# 查看运行状态
docker-compose ps

# 停止所有服务
docker-compose down

# 重启服务
docker-compose restart next-app
```

### 容器内执行命令
```bash
# 进入容器shell
docker-compose exec next-app /bin/bash

# 在容器内执行单个命令
docker-compose exec next-app npm run dev
docker-compose exec next-app npx prisma db push
docker-compose exec next-app npm run db:seed-test

# 测试API
docker-compose exec next-app node docker-test-api.js
```

### 查看日志
```bash
# 查看应用日志
docker-compose logs next-app

# 实时查看日志
docker-compose logs -f next-app

# 查看数据库日志
docker-compose logs db
```

### 数据库操作
```bash
# 在容器内同步数据库
docker-compose exec next-app npx prisma db push

# 在容器内生成Prisma客户端
docker-compose exec next-app npx prisma generate

# 在容器内添加测试数据
docker-compose exec next-app npm run db:seed-test

# 直接连接数据库
docker-compose exec db psql -U user -d inventory_db
```

### 开发调试
```bash
# 重新构建应用容器
docker-compose build next-app

# 强制重新构建
docker-compose build --no-cache next-app

# 查看容器资源使用
docker stats

# 清理未使用的容器和镜像
docker system prune
```

## 🧪 测试流程

### 1. 完整测试流程
```bash
# 1. 启动数据库
docker-compose up db -d

# 2. 启动应用
docker-compose up next-app -d

# 3. 等待启动完成（约15-30秒）

# 4. 同步数据库结构
docker-compose exec next-app npx prisma db push

# 5. 添加测试数据
docker-compose exec next-app npm run db:seed-test

# 6. 测试API
docker-compose exec next-app node docker-test-api.js
```

### 2. 快速重新测试
```bash
# 如果容器已运行，只需重新添加数据和测试
docker-compose exec next-app npm run db:seed-test
docker-compose exec next-app node docker-test-api.js
```

## 🌐 访问应用

- **Web界面**: http://localhost:3000
- **数据库**: localhost:15432 (用户: user, 密码: password)

## 🔧 故障排除

### 常见问题

#### 1. 端口被占用
```bash
# 查看端口使用情况
netstat -an | findstr :3000
netstat -an | findstr :15432

# 停止占用端口的进程
docker-compose down
```

#### 2. 容器启动失败
```bash
# 查看详细错误信息
docker-compose logs next-app

# 重新构建容器
docker-compose build --no-cache next-app
docker-compose up next-app -d
```

#### 3. 数据库连接失败
```bash
# 检查数据库容器状态
docker-compose ps db

# 重启数据库
docker-compose restart db

# 等待数据库完全启动后再连接
```

#### 4. API测试失败
```bash
# 检查应用是否正在运行
docker-compose exec next-app curl http://localhost:3000

# 查看应用日志
docker-compose logs -f next-app

# 重新测试
docker-compose exec next-app node docker-test-api.js
```

## 📝 环境变量

容器内使用的环境变量：
- `DATABASE_URL=postgresql://user:password@db:5432/inventory_db`
- `NODE_ENV=development`
- `FORCE_INSTALL_MUI=true`

## 🎯 测试目标

通过Docker容器测试验证：
1. ✅ 数据库连接正常
2. ✅ Prisma ORM工作正常
3. ✅ 测试数据添加成功
4. ✅ API认证和授权正常
5. ✅ 库存数据查询正常
6. ✅ 前端界面可访问 