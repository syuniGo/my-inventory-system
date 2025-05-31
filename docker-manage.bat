@echo off
echo ========================================
echo    库存管理系统 Docker 管理工具
echo ========================================
echo.

:menu
echo 请选择操作:
echo 1. 构建并启动服务
echo 2. 停止服务
echo 3. 重新构建服务
echo 4. 查看日志
echo 5. 清理所有容器和镜像
echo 6. 退出
echo.
set /p choice=请输入选择 (1-6): 

if "%choice%"=="1" goto start
if "%choice%"=="2" goto stop
if "%choice%"=="3" goto rebuild
if "%choice%"=="4" goto logs
if "%choice%"=="5" goto clean
if "%choice%"=="6" goto exit
echo 无效选择，请重新输入
goto menu

:start
echo 正在构建并启动服务...
docker-compose up --build -d
echo 服务已启动！
echo 访问地址: http://localhost:3000
echo 数据库端口: localhost:15432
pause
goto menu

:stop
echo 正在停止服务...
docker-compose down
echo 服务已停止！
pause
goto menu

:rebuild
echo 正在重新构建服务...
docker-compose down
docker-compose build --no-cache
docker-compose up -d
echo 服务已重新构建并启动！
pause
goto menu

:logs
echo 显示服务日志...
docker-compose logs -f
goto menu

:clean
echo 警告：这将删除所有相关的容器、镜像和卷！
set /p confirm=确认删除? (y/N): 
if /i "%confirm%"=="y" (
    docker-compose down -v
    docker system prune -a -f
    echo 清理完成！
) else (
    echo 操作已取消
)
pause
goto menu

:exit
echo 再见！
exit 