// 测试API脚本
const http = require('http');

function testAPI() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/inventory',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer test_token',
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`📡 API响应状态码: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        
        if (res.statusCode === 200) {
          console.log(`📊 获取到 ${jsonData.inventoryItems?.length || 0} 个库存项目`);
          console.log(`📈 统计信息:`, jsonData.stats);
          console.log('🎉 API测试成功！');
        } else {
          console.log(`❌ API错误 (${res.statusCode}):`, jsonData.message || jsonData);
        }
      } catch (error) {
        console.log('❌ 解析JSON失败:', error.message);
        console.log('原始响应:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.log(`❌ API测试失败: ${error.message}`);
    console.log('请确保开发服务器正在运行 (npm run dev)');
  });

  req.end();
}

// 等待5秒后测试，给服务器启动时间
setTimeout(() => {
  console.log('🧪 开始测试库存API...');
  testAPI();
}, 5000); 