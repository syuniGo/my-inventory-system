Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   库存管理系统 Docker 管理工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

function Show-Menu {
    Write-Host "请选择操作:" -ForegroundColor Yellow
    Write-Host "1. 构建并启动服务" -ForegroundColor Green
    Write-Host "2. 停止服务" -ForegroundColor Red
    Write-Host "3. 重新构建服务" -ForegroundColor Blue
    Write-Host "4. 查看日志" -ForegroundColor Magenta
    Write-Host "5. 清理所有容器和镜像" -ForegroundColor DarkRed
    Write-Host "6. 退出" -ForegroundColor Gray
    Write-Host ""
}

function Start-Services {
    Write-Host "正在构建并启动服务..." -ForegroundColor Green
    docker-compose up --build -d
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 服务已启动！" -ForegroundColor Green
        Write-Host "🌐 访问地址: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "🗄️  数据库端口: localhost:15432" -ForegroundColor Cyan
    } else {
        Write-Host "❌ 服务启动失败！" -ForegroundColor Red
    }
}

function Stop-Services {
    Write-Host "正在停止服务..." -ForegroundColor Yellow
    docker-compose down
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 服务已停止！" -ForegroundColor Green
    } else {
        Write-Host "❌ 服务停止失败！" -ForegroundColor Red
    }
}

function Rebuild-Services {
    Write-Host "正在重新构建服务..." -ForegroundColor Blue
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 服务已重新构建并启动！" -ForegroundColor Green
    } else {
        Write-Host "❌ 服务重建失败！" -ForegroundColor Red
    }
}

function Show-Logs {
    Write-Host "显示服务日志..." -ForegroundColor Magenta
    docker-compose logs -f
}

function Clean-All {
    Write-Host "⚠️  警告：这将删除所有相关的容器、镜像和卷！" -ForegroundColor Red
    $confirm = Read-Host "确认删除? (y/N)"
    if ($confirm -eq "y" -or $confirm -eq "Y") {
        docker-compose down -v
        docker system prune -a -f
        Write-Host "✅ 清理完成！" -ForegroundColor Green
    } else {
        Write-Host "❌ 操作已取消" -ForegroundColor Yellow
    }
}

# 主循环
do {
    Show-Menu
    $choice = Read-Host "请输入选择 (1-6)"
    
    switch ($choice) {
        "1" { Start-Services }
        "2" { Stop-Services }
        "3" { Rebuild-Services }
        "4" { Show-Logs }
        "5" { Clean-All }
        "6" { 
            Write-Host "再见！" -ForegroundColor Green
            exit 
        }
        default { 
            Write-Host "无效选择，请重新输入" -ForegroundColor Red 
        }
    }
    
    if ($choice -ne "4" -and $choice -ne "6") {
        Write-Host ""
        Read-Host "按回车键继续..."
        Clear-Host
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "   库存管理系统 Docker 管理工具" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
    }
} while ($choice -ne "6") 