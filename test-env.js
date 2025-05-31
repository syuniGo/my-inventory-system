const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 环境检测开始...');
console.log('📁 当前目录:', process.cwd());

// 检查必要文件
const requiredFiles = ['package.json', 'docker-compose.yml', 'Dockerfile.dev'];
console.log('\n📋 检查必要文件:');
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} 存在`);
    } else {
        console.log(`❌ ${file} 不存在`);
    }
});

// 检查Docker
console.log('\n🐳 检查Docker:');
try {
    const dockerVersion = execSync('docker --version', { encoding: 'utf8' });
    console.log('✅ Docker已安装:', dockerVersion.trim());
} catch (error) {
    console.log('❌ Docker未安装或未启动');
    console.log('错误:', error.message);
}

// 检查Docker Compose
console.log('\n🔧 检查Docker Compose:');
try {
    const composeVersion = execSync('docker-compose --version', { encoding: 'utf8' });
    console.log('✅ Docker Compose已安装:', composeVersion.trim());
} catch (error) {
    console.log('❌ Docker Compose未安装');
    console.log('错误:', error.message);
}

// 检查Docker服务状态
console.log('\n🚀 检查Docker服务状态:');
try {
    execSync('docker ps', { encoding: 'utf8' });
    console.log('✅ Docker服务正常运行');
} catch (error) {
    console.log('❌ Docker服务未运行');
    console.log('错误:', error.message);
}

console.log('\n🎯 环境检测完成!'); 