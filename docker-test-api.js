// Docker容器内API测试脚本
const http = require('http');

function testAPI() {
  console.log('🐳 在Docker容器内测试API...');
  
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
          
          // 显示前3个库存项目的详细信息
          if (jsonData.inventoryItems && jsonData.inventoryItems.length > 0) {
            console.log('\n📦 库存项目示例:');
            jsonData.inventoryItems.slice(0, 3).forEach((item, index) => {
              console.log(`${index + 1}. ${item.product.name} (${item.product.sku})`);
              console.log(`   库存: ${item.quantity}, 可用: ${item.quantity - item.reservedQuantity}`);
              console.log(`   位置: ${item.location || '未指定'}`);
              console.log(`   价格: ¥${item.product.sellingPrice}`);
              console.log('');
            });
          }
          
          console.log('🎉 Docker容器内API测试成功！');
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
    console.log('请确保Next.js应用正在容器内运行');
  });

  req.end();
}

// 立即测试
testAPI(); 