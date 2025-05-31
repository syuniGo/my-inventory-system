const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始安装 Material UI 依赖...');

try {
  // 检查package.json是否存在
  const packageJsonPath = path.join(__dirname, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('package.json 文件不存在');
  }

  console.log('✅ package.json 文件存在');

  // 安装Material UI依赖
  const packages = [
    '@mui/material@^6.4.11',
    '@emotion/react@^11.13.5',
    '@emotion/styled@^11.13.5',
    '@mui/icons-material@^6.4.11'
  ];

  console.log('📦 正在安装以下包:');
  packages.forEach(pkg => console.log(`  - ${pkg}`));

  // 执行安装命令
  const installCommand = `npm install ${packages.join(' ')} --legacy-peer-deps`;
  console.log(`\n🔧 执行命令: ${installCommand}`);
  
  execSync(installCommand, { 
    stdio: 'inherit',
    cwd: __dirname
  });

  console.log('\n✅ Material UI 依赖安装完成!');
  
  // 验证安装
  const nodeModulesPath = path.join(__dirname, 'node_modules', '@mui');
  if (fs.existsSync(nodeModulesPath)) {
    console.log('✅ @mui 目录已创建');
    const muiDirs = fs.readdirSync(nodeModulesPath);
    console.log('📁 已安装的 MUI 包:', muiDirs.join(', '));
  } else {
    console.log('❌ @mui 目录未找到，安装可能失败');
  }

} catch (error) {
  console.error('❌ 安装失败:', error.message);
  console.error('\n🔧 请尝试手动运行以下命令:');
  console.error('npm install @mui/material @emotion/react @emotion/styled @mui/icons-material --legacy-peer-deps');
  process.exit(1);
} 