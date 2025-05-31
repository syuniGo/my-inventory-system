@echo off
echo ========================================
echo    修复依赖冲突并启动Docker服务
echo ========================================
echo.

echo 1. 停止现有服务...
docker-compose down

echo.
echo 2. 清理Docker缓存...
docker system prune -f

echo.
echo 3. 重新构建服务（使用修复后的依赖）...
docker-compose build --no-cache

echo.
echo 4. 启动服务...
docker-compose up -d

echo.
echo ========================================
echo 修复完成！
echo ========================================
echo.
echo 访问地址: http://localhost:3000
echo 数据库端口: localhost:15432
echo.
echo 查看日志: docker-compose logs -f
echo 停止服务: docker-compose down
echo.

pause 