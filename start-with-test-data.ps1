# 库存管理系统 - 测试数据启动脚本 (PowerShell版本)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "库存管理系统 - 测试数据启动脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 设置环境变量
$env:DATABASE_URL = "postgresql://user:password@localhost:15432/inventory_db"

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
Start-Sleep -Seconds 8

Write-Host ""
Write-Host "正在同步数据库结构..." -ForegroundColor Yellow
npx prisma db push

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ 数据库同步失败！" -ForegroundColor Red
    Read-Host "按任意键退出"
    exit 1
}

Write-Host ""
Write-Host "正在添加测试数据到数据库..." -ForegroundColor Yellow
npm run db:seed-test

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ 添加测试数据失败！" -ForegroundColor Red
    Write-Host "请检查数据库连接和配置。" -ForegroundColor Red
    Read-Host "按任意键退出"
    exit 1
}

Write-Host ""
Write-Host "✅ 测试数据添加成功！" -ForegroundColor Green
Write-Host ""
Write-Host "正在启动Next.js开发服务器..." -ForegroundColor Yellow
Write-Host ""
Write-Host "测试步骤：" -ForegroundColor Cyan
Write-Host "1. 等待服务器启动完成（约10-30秒）" -ForegroundColor White
Write-Host "2. 访问 http://localhost:3000 或 http://localhost:3001" -ForegroundColor White
Write-Host "3. 点击'测试模式（无需登录）'按钮" -ForegroundColor White
Write-Host "4. 点击'进入管理'查看库存表格" -ForegroundColor White
Write-Host "5. 或者使用演示账户登录：" -ForegroundColor White
Write-Host "   - 管理员: admin / admin" -ForegroundColor White
Write-Host "   - 经理: manager / manager" -ForegroundColor White
Write-Host "   - 用户: user1 / user1" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 启动开发服务器中..." -ForegroundColor Green
Write-Host "如果端口3000被占用，会自动使用3001端口" -ForegroundColor Yellow
Write-Host ""

# 启动开发服务器
try {
    npm run dev
} catch {
    Write-Host ""
    Write-Host "❌ 开发服务器启动失败！" -ForegroundColor Red
    Write-Host "请检查Node.js和npm是否正确安装。" -ForegroundColor Red
    Read-Host "按任意键退出"
    exit 1
} 