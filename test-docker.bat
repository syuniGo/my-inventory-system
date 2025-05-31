@echo off
echo ========================================
echo       Docker 环境测试
echo ========================================
echo.

echo 当前目录: %CD%
echo.

echo 检查Docker是否安装...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker未安装或未启动
    echo 请先安装Docker Desktop并启动
    pause
    exit /b 1
) else (
    echo ✅ Docker已安装
    docker --version
)
echo.

echo 检查Docker Compose是否安装...
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose未安装
    pause
    exit /b 1
) else (
    echo ✅ Docker Compose已安装
    docker-compose --version
)
echo.

echo 检查必要文件...
if exist package.json (
    echo ✅ package.json 存在
) else (
    echo ❌ package.json 不存在
)

if exist docker-compose.yml (
    echo ✅ docker-compose.yml 存在
) else (
    echo ❌ docker-compose.yml 不存在
)

if exist Dockerfile.dev (
    echo ✅ Dockerfile.dev 存在
) else (
    echo ❌ Dockerfile.dev 不存在
)
echo.

echo 检查Docker服务状态...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker服务未运行，请启动Docker Desktop
    pause
    exit /b 1
) else (
    echo ✅ Docker服务正常运行
)
echo.

echo ========================================
echo       环境检查完成
echo ========================================
echo.

set /p start=是否现在启动Docker服务? (y/N): 
if /i "%start%"=="y" (
    echo.
    echo 正在启动Docker服务...
    docker-compose up --build -d
    
    if %errorlevel% equ 0 (
        echo.
        echo ✅ 服务启动成功!
        echo 🌐 访问地址: http://localhost:3000
        echo 🗄️ 数据库端口: localhost:15432
        echo.
        echo 查看日志: docker-compose logs -f
    ) else (
        echo.
        echo ❌ 服务启动失败
        echo 查看详细日志: docker-compose logs
    )
) else (
    echo 操作已取消
)

pause 