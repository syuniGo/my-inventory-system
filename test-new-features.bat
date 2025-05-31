@echo off
echo ========================================
echo 库存管理系统 - 新功能测试
echo ========================================
echo.

echo 🆕 新增功能：
echo 1. 商品管理页面添加编辑按钮
echo 2. 新增商品功能
echo 3. 删除商品功能
echo 4. 外部客户查看商品页面
echo 5. 增强的CRUD操作界面
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
timeout /t 5 /nobreak > nul

echo.
echo 设置环境变量...
set DATABASE_URL=postgresql://user:password@localhost:15432/inventory_db

echo.
echo 同步数据库结构...
npx prisma db push

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 数据库同步失败！
    pause
    exit /b 1
)

echo.
echo 添加测试数据...
npm run db:seed-test

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 添加测试数据失败！
    pause
    exit /b 1
)

echo.
echo 启动开发服务器...
echo.
echo ✅ 准备完成！
echo.
echo 🌐 测试步骤：
echo 1. 访问 http://localhost:3000
echo 2. 点击"测试模式（无需登录）"按钮
echo 3. 点击"库存管理"进入管理界面
echo 4. 测试新增、编辑、删除功能
echo 5. 点击"商品目录"查看外部客户页面
echo.
echo 🔧 CRUD功能测试要点：
echo • 新增商品：
echo   - 右上角"新增商品"按钮
echo   - 搜索栏右侧绿色"新增商品"按钮
echo • 编辑商品：点击表格中的蓝色编辑图标
echo • 删除商品：点击表格中的红色删除图标
echo • 批量操作：搜索栏右侧的批量编辑/删除按钮
echo • 操作提示：蓝色提示框显示操作说明
echo.
echo 🎯 权限测试：
echo • 测试模式：经理权限（可编辑删除）
echo • 管理员登录：admin / admin（完整权限）
echo • 经理登录：manager / manager（管理权限）
echo • 普通用户：user1 / user1（只能查看）
echo.
echo 📋 界面功能：
echo • 搜索过滤：商品名称、SKU、描述搜索
echo • 分类过滤：按商品分类筛选
echo • 位置过滤：按存储位置筛选
echo • 低库存：显示库存不足的商品
echo • 分页显示：支持5/10/25/50条每页
echo.

npm run dev 