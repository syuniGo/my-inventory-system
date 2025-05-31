# Docker 故障排除指南

## 🚨 当前问题：找不到 docker-start.sh

### 问题描述
Docker容器启动时报错：`Error: Cannot find module '/app/docker-start.sh'`

### ✅ 解决方案

我已经修复了Dockerfile.dev，移除了对docker-start.sh的依赖。现在请按以下步骤操作：

## 🔧 快速修复步骤

### 方法1：使用批处理文件（推荐）
```bash
# 在项目根目录运行
./quick-start.bat
```

### 方法2：手动命令
在PowerShell中依次运行：

```powershell
# 1. 停止现有服务
docker-compose down

# 2. 重新构建（不使用缓存）
docker-compose build --no-cache

# 3. 启动服务
docker-compose up -d

# 4. 查看日志（可选）
docker-compose logs -f
```

### 方法3：使用简化Dockerfile
如果还有问题，可以临时使用简化版：

```powershell
# 修改docker-compose.yml中的dockerfile行
# 将 dockerfile: Dockerfile.dev 改为 dockerfile: Dockerfile.simple
```

## 📋 验证步骤

启动成功后，检查以下内容：

1. **容器状态**
```bash
docker-compose ps
```

2. **应用访问**
- 前端：http://localhost:3000
- 数据库：localhost:15432

3. **查看日志**
```bash
docker-compose logs next-app
docker-compose logs db
```

## 🔍 常见问题

### 问题1：端口被占用
```bash
# 检查端口占用
netstat -ano | findstr :3000
netstat -ano | findstr :15432

# 停止占用进程或修改端口
```

### 问题2：Docker Desktop未启动
- 确保Docker Desktop正在运行
- 检查系统托盘中的Docker图标

### 问题3：权限问题
```bash
# 以管理员身份运行PowerShell
# 或者重启Docker Desktop
```

### 问题4：依赖安装失败
```bash
# 清理并重新安装
docker-compose down
docker system prune -f
docker-compose build --no-cache
```

## 🆘 如果仍有问题

1. 检查Docker版本：`docker --version`
2. 检查Docker Compose版本：`docker-compose --version`
3. 重启Docker Desktop
4. 重启计算机

## 📞 调试命令

```bash
# 环境检测
node test-env.js

# Docker调试
node docker-debug.js

# 查看详细日志
docker-compose logs --tail=50 next-app
``` 