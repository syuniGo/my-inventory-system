@echo off
echo ========================================
echo 库存管理系统 - Docker容器内测试启动
echo ========================================
echo.

echo 正在启动数据库...
docker-compose up db -d

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 数据库启动失败！
    echo 请检查Docker是否已安装并运行。
    pause
    exit /b 1
)

echo.
echo ⏳ 等待数据库启动完成...
timeout /t 8 /nobreak > nul

echo.
echo 正在构建并启动Next.js应用容器...
docker-compose up next-app -d

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 应用容器启动失败！
    pause
    exit /b 1
)

echo.
echo ⏳ 等待应用容器启动完成...
timeout /t 15 /nobreak > nul

echo.
echo 正在容器内同步数据库结构...
docker-compose exec next-app npx prisma db push

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 数据库同步失败！
    pause
    exit /b 1
)

echo.
echo 正在容器内添加测试数据...
docker-compose exec next-app npm run db:seed-test

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 添加测试数据失败！
    pause
    exit /b 1
)

echo.
echo 正在容器内测试API...
docker-compose exec next-app node docker-test-api.js

echo.
echo ✅ Docker容器测试完成！
echo.
echo 🌐 Web界面测试步骤：
echo 1. 访问 http://localhost:3000
echo 2. 点击"测试模式（无需登录）"按钮
echo 3. 点击"进入管理"查看库存表格
echo 4. 或者使用演示账户登录：
echo    - 管理员: admin / admin
echo    - 经理: manager / manager  
echo    - 用户: user1 / user1
echo.
echo 🐳 Docker管理命令：
echo 查看容器日志: docker-compose logs -f next-app
echo 进入容器shell: docker-compose exec next-app /bin/bash
echo 重启应用: docker-compose restart next-app
echo 停止所有容器: docker-compose down
echo.
echo ========================================
echo.
pause 