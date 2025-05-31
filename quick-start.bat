@echo off
echo 🐳 快速启动库存管理系统
echo ================================

echo.
echo 1️⃣ 停止现有服务...
docker-compose down

echo.
echo 2️⃣ 重新构建服务...
docker-compose build --no-cache

echo.
echo 3️⃣ 启动服务...
docker-compose up -d

echo.
echo 🎉 启动完成!
echo 🌐 访问地址: http://localhost:3000
echo 🗄️ 数据库端口: localhost:15432
echo.
echo 📋 有用的命令:
echo   查看日志: docker-compose logs -f
echo   停止服务: docker-compose down
echo   查看状态: docker-compose ps

pause 