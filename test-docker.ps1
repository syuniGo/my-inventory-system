Write-Host "=== Docker 环境测试 ===" -ForegroundColor Cyan

# 1. 检查当前目录
Write-Host "当前目录: $(Get-Location)" -ForegroundColor Green

# 2. 检查Docker是否安装
Write-Host "检查Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker已安装: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker未安装或未启动" -ForegroundColor Red
    Write-Host "请先安装Docker Desktop并启动" -ForegroundColor Red
    exit 1
}

# 3. 检查Docker Compose
Write-Host "检查Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker-compose --version
    Write-Host "✅ Docker Compose已安装: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose未安装" -ForegroundColor Red
    exit 1
}

# 4. 检查必要文件
Write-Host "检查必要文件..." -ForegroundColor Yellow
$requiredFiles = @("package.json", "docker-compose.yml", "Dockerfile.dev")
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file 存在" -ForegroundColor Green
    } else {
        Write-Host "❌ $file 不存在" -ForegroundColor Red
    }
}

# 5. 检查Docker服务状态
Write-Host "检查Docker服务状态..." -ForegroundColor Yellow
try {
    docker ps > $null
    Write-Host "✅ Docker服务正常运行" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker服务未运行，请启动Docker Desktop" -ForegroundColor Red
    exit 1
}

Write-Host "=== 环境检查完成 ===" -ForegroundColor Cyan
Write-Host "如果所有检查都通过，可以尝试启动Docker服务" -ForegroundColor Green

# 询问是否启动服务
$start = Read-Host "是否现在启动Docker服务? (y/N)"
if ($start -eq "y" -or $start -eq "Y") {
    Write-Host "正在启动Docker服务..." -ForegroundColor Green
    docker-compose up --build -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 服务启动成功!" -ForegroundColor Green
        Write-Host "🌐 访问地址: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "🗄️ 数据库端口: localhost:15432" -ForegroundColor Cyan
    } else {
        Write-Host "❌ 服务启动失败" -ForegroundColor Red
        Write-Host "查看详细日志: docker-compose logs" -ForegroundColor Yellow
    }
} 