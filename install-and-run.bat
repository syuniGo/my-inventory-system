@echo off
echo 正在安装 Material UI 依赖...
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material --legacy-peer-deps

echo.
echo 安装完成！正在启动开发服务器...
echo.
npm run dev 