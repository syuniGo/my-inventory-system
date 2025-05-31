# 库存管理系统 - Docker容器内测试启动脚本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "库存管理系统 - Docker容器内测试启动" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
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
Start-Sleep -Seconds 8

Write-Host ""
Write-Host "正在构建并启动Next.js应用容器..." -ForegroundColor Yellow
docker-compose up next-app -d

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ 应用容器启动失败！" -ForegroundColor Red
    Read-Host "按任意键退出"
    exit 1
}

Write-Host ""
Write-Host "⏳ 等待应用容器启动完成..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "正在容器内同步数据库结构..." -ForegroundColor Yellow
docker-compose exec next-app npx prisma db push

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ 数据库同步失败！" -ForegroundColor Red
    Read-Host "按任意键退出"
    exit 1
}

Write-Host ""
Write-Host "正在容器内添加测试数据..." -ForegroundColor Yellow
docker-compose exec next-app npm run db:seed-test

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ 添加测试数据失败！" -ForegroundColor Red
    Read-Host "按任意键退出"
    exit 1
}

Write-Host ""
Write-Host "正在容器内测试API..." -ForegroundColor Yellow
docker-compose exec next-app node docker-test-api.js

Write-Host ""
Write-Host "✅ Docker容器测试完成！" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Web界面测试步骤：" -ForegroundColor Cyan
Write-Host "1. 访问 http://localhost:3000" -ForegroundColor White
Write-Host "2. 点击'测试模式（无需登录）'按钮" -ForegroundColor White
Write-Host "3. 点击'进入管理'查看库存表格" -ForegroundColor White
Write-Host "4. 或者使用演示账户登录：" -ForegroundColor White
Write-Host "   - 管理员: admin / admin" -ForegroundColor White
Write-Host "   - 经理: manager / manager" -ForegroundColor White
Write-Host "   - 用户: user1 / user1" -ForegroundColor White
Write-Host ""
Write-Host "🐳 Docker管理命令：" -ForegroundColor Cyan
Write-Host "查看容器日志: docker-compose logs -f next-app" -ForegroundColor Yellow
Write-Host "进入容器shell: docker-compose exec next-app /bin/bash" -ForegroundColor Yellow
Write-Host "重启应用: docker-compose restart next-app" -ForegroundColor Yellow
Write-Host "停止所有容器: docker-compose down" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "" 