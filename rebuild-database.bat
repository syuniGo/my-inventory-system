@echo off
echo 🔄 重建数据库和应用
echo ================================

echo.
echo 1️⃣ 停止所有服务...
docker-compose down -v

echo.
echo 2️⃣ 清理Docker资源...
docker system prune -f
docker volume prune -f

echo.
echo 3️⃣ 重新构建应用镜像...
docker-compose build --no-cache

echo.
echo 4️⃣ 启动数据库服务...
docker-compose up -d db

echo.
echo 5️⃣ 等待数据库启动...
timeout /t 10

echo.
echo 6️⃣ 启动应用服务...
docker-compose up -d next-app

echo.
echo 7️⃣ 查看服务状态...
docker-compose ps

echo.
echo 8️⃣ 查看应用日志...
docker-compose logs --tail=20 next-app

echo.
echo 🎉 重建完成!
echo 🌐 访问地址: http://localhost:3000
echo 🗄️ 数据库端口: localhost:15432
echo.
echo 📋 测试账户:
echo   admin / admin (管理员)
echo   manager / manager (经理)
echo   user1 / user1 (普通用户)
echo.
echo 📋 有用的命令:
echo   查看日志: docker-compose logs -f
echo   停止服务: docker-compose down
echo   查看状态: docker-compose ps

pause 