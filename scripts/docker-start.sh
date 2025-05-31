#!/bin/bash

echo "🚀 启动库存管理系统..."

# 检查Material UI依赖
echo "📦 检查Material UI依赖..."
if ! npm list @mui/material > /dev/null 2>&1; then
    echo "⚠️  Material UI未安装，正在安装..."
    npm install @mui/material @emotion/react @emotion/styled @mui/icons-material --legacy-peer-deps
else
    echo "✅ Material UI已安装"
fi

# 生成Prisma客户端
echo "🔧 生成Prisma客户端..."
npx prisma generate

# 启动开发服务器
echo "🌟 启动Next.js开发服务器..."
npm run dev 