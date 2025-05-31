# 库存管理系统 - 新功能测试脚本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "库存管理系统 - 新功能测试" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🆕 新增功能：" -ForegroundColor Green
Write-Host "1. 商品管理页面添加编辑按钮" -ForegroundColor White
Write-Host "2. 新增商品功能" -ForegroundColor White
Write-Host "3. 删除商品功能" -ForegroundColor White
Write-Host "4. 外部客户查看商品页面" -ForegroundColor White
Write-Host "5. 增强的CRUD操作界面" -ForegroundColor White
Write-Host ""

Write-Host "正在启动数据库..." -ForegroundColor Yellow
docker-compose up db -d

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ 数据库启动失败！" -ForegroundColor Red
    Write-Host "请检查Docker是否已安装并运行。" -ForegroundColor Red
    Read-Host "按任意键退出"
    exit 1
}

Write-Host ""
Write-Host "⏳ 等待数据库启动完成..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "设置环境变量..." -ForegroundColor Yellow
$env:DATABASE_URL="postgresql://user:password@localhost:15432/inventory_db"

Write-Host ""
Write-Host "同步数据库结构..." -ForegroundColor Yellow
npx prisma db push

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ 数据库同步失败！" -ForegroundColor Red
    Read-Host "按任意键退出"
    exit 1
}

Write-Host ""
Write-Host "添加测试数据..." -ForegroundColor Yellow
npm run db:seed-test

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ 添加测试数据失败！" -ForegroundColor Red
    Read-Host "按任意键退出"
    exit 1
}

Write-Host ""
Write-Host "启动开发服务器..." -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ 准备完成！" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 测试步骤：" -ForegroundColor Cyan
Write-Host "1. 访问 http://localhost:3000" -ForegroundColor White
Write-Host "2. 点击'测试模式（无需登录）'按钮" -ForegroundColor White
Write-Host "3. 点击'库存管理'进入管理界面" -ForegroundColor White
Write-Host "4. 测试新增、编辑、删除功能" -ForegroundColor White
Write-Host "5. 点击'商品目录'查看外部客户页面" -ForegroundColor White
Write-Host ""
Write-Host "🔧 CRUD功能测试要点：" -ForegroundColor Cyan
Write-Host "• 新增商品：" -ForegroundColor Yellow
Write-Host "  - 右上角'新增商品'按钮" -ForegroundColor White
Write-Host "  - 搜索栏右侧绿色'新增商品'按钮" -ForegroundColor White
Write-Host "• 编辑商品：点击表格中的蓝色编辑图标" -ForegroundColor Yellow
Write-Host "• 删除商品：点击表格中的红色删除图标" -ForegroundColor Yellow
Write-Host "• 批量操作：搜索栏右侧的批量编辑/删除按钮" -ForegroundColor Yellow
Write-Host "• 操作提示：蓝色提示框显示操作说明" -ForegroundColor Yellow
Write-Host ""
Write-Host "🎯 权限测试：" -ForegroundColor Cyan
Write-Host "• 测试模式：经理权限（可编辑删除）" -ForegroundColor Yellow
Write-Host "• 管理员登录：admin / admin（完整权限）" -ForegroundColor Yellow
Write-Host "• 经理登录：manager / manager（管理权限）" -ForegroundColor Yellow
Write-Host "• 普通用户：user1 / user1（只能查看）" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 界面功能：" -ForegroundColor Cyan
Write-Host "• 搜索过滤：商品名称、SKU、描述搜索" -ForegroundColor White
Write-Host "• 分类过滤：按商品分类筛选" -ForegroundColor White
Write-Host "• 位置过滤：按存储位置筛选" -ForegroundColor White
Write-Host "• 低库存：显示库存不足的商品" -ForegroundColor White
Write-Host "• 分页显示：支持5/10/25/50条每页" -ForegroundColor White
Write-Host ""

npm run dev 