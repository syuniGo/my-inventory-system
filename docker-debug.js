const { spawn, execSync } = require('child_process');
const fs = require('fs');

console.log('🐳 Docker 调试和启动脚本');
console.log('================================');

async function runCommand(command, args = []) {
    return new Promise((resolve, reject) => {
        console.log(`\n🔧 执行: ${command} ${args.join(' ')}`);
        
        const process = spawn(command, args, {
            stdio: 'inherit',
            shell: true
        });

        process.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ 命令执行成功`);
                resolve();
            } else {
                console.log(`❌ 命令执行失败，退出码: ${code}`);
                reject(new Error(`Command failed with code ${code}`));
            }
        });

        process.on('error', (error) => {
            console.log(`❌ 命令执行错误: ${error.message}`);
            reject(error);
        });
    });
}

async function main() {
    try {
        console.log('\n1️⃣ 检查Docker状态...');
        await runCommand('docker', ['--version']);
        
        console.log('\n2️⃣ 检查Docker Compose...');
        await runCommand('docker-compose', ['--version']);
        
        console.log('\n3️⃣ 停止现有服务...');
        await runCommand('docker-compose', ['down']);
        
        console.log('\n4️⃣ 清理Docker缓存...');
        await runCommand('docker', ['system', 'prune', '-f']);
        
        console.log('\n5️⃣ 重新构建服务...');
        await runCommand('docker-compose', ['build', '--no-cache']);
        
        console.log('\n6️⃣ 启动服务...');
        await runCommand('docker-compose', ['up', '-d']);
        
        console.log('\n🎉 Docker服务启动完成!');
        console.log('🌐 访问地址: http://localhost:3000');
        console.log('🗄️ 数据库端口: localhost:15432');
        console.log('\n📋 有用的命令:');
        console.log('  查看日志: docker-compose logs -f');
        console.log('  停止服务: docker-compose down');
        console.log('  查看状态: docker-compose ps');
        
    } catch (error) {
        console.error('\n❌ 启动失败:', error.message);
        console.log('\n🔧 手动操作步骤:');
        console.log('1. 确保Docker Desktop已启动');
        console.log('2. 在PowerShell中运行: docker-compose down');
        console.log('3. 运行: docker-compose build --no-cache');
        console.log('4. 运行: docker-compose up -d');
    }
}

main(); 