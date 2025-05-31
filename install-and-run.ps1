Write-Host "正在安装 Material UI 依赖..." -ForegroundColor Green
npm install "@mui/material" "@emotion/react" "@emotion/styled" "@mui/icons-material" --legacy-peer-deps

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "安装完成！正在启动开发服务器..." -ForegroundColor Green
    Write-Host ""
    npm run dev
} else {
    Write-Host "依赖安装失败，请检查网络连接或npm配置" -ForegroundColor Red
} 