@echo off
echo ========================================
echo 库存管理系统 - 测试数据启动脚本
echo ========================================
echo.

REM 设置环境变量
set DATABASE_URL=postgresql://user:password@localhost:15432/inventory_db

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
echo 正在同步数据库结构...
npx prisma db push

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 数据库同步失败！
    pause
    exit /b 1
)

echo.
echo 正在添加测试数据到数据库...
npm run db:seed-test

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 添加测试数据失败！
    echo 请检查数据库连接和配置。
    pause
    exit /b 1
)

echo.
echo ✅ 测试数据添加成功！
echo.
echo 正在启动Next.js开发服务器...
echo.
echo 测试步骤：
echo 1. 等待服务器启动完成（约10-30秒）
echo 2. 访问 http://localhost:3000 或 http://localhost:3001
echo 3. 点击"测试模式（无需登录）"按钮
echo 4. 点击"进入管理"查看库存表格
echo 5. 或者使用演示账户登录：
echo    - 管理员: admin / admin
echo    - 经理: manager / manager  
echo    - 用户: user1 / user1
echo.
echo ========================================
echo.
echo 🚀 启动开发服务器中...
echo 如果端口3000被占用，会自动使用3001端口
echo.

npm run dev

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 开发服务器启动失败！
    echo 请检查Node.js和npm是否正确安装。
    pause
    exit /b 1
) 