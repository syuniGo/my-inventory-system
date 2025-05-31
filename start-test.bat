@echo off
echo ========================================
echo 库存管理系统 - 测试启动脚本
echo ========================================
echo.
echo 正在启动开发服务器...
echo.
echo 修复内容：
echo 1. 添加了测试按钮（无需登录）
echo 2. 登录后显示商品管理界面（不跳转dashboard）
echo.
echo 测试步骤：
echo 1. 等待服务器启动完成
echo 2. 访问 http://localhost:3000
echo 3. 点击"测试模式（无需登录）"按钮测试
echo 4. 或者点击"登录系统"使用演示账户：
echo    - 管理员: admin / admin
echo    - 经理: manager / manager  
echo    - 用户: user1 / user1
echo.
echo ========================================
echo.

npm run dev 