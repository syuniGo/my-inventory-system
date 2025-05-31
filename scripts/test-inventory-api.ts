#!/usr/bin/env ts-node
// scripts/test-inventory-api.ts
// 库存管理API测试脚本

import { config } from 'dotenv';

// 加载环境变量
config();

async function testInventoryAPI() {
  console.log('🚀 开始库存管理API测试...\n');

  const baseUrl = 'http://localhost:3000';

  try {
    // 1. 测试获取供应商列表
    console.log('1️⃣ 测试获取供应商列表 (GET /api/suppliers)...');
    try {
      const response = await fetch(`${baseUrl}/api/suppliers?includeProductCount=true`);
      const data = await response.json();
      console.log(`   状态: ${response.status}`);
      if (response.ok) {
        console.log(`   找到供应商: ${data.suppliers.length} 个`);
        data.suppliers.forEach((supplier: any, index: number) => {
          console.log(`   ${index + 1}. ${supplier.name} (${supplier._count?.products || 0} 个商品)`);
        });
      } else {
        console.log(`   错误: ${data.message}`);
      }
    } catch (error) {
      console.log(`   ❌ 失败: ${error}`);
    }
    console.log();

    // 2. 测试创建供应商
    console.log('2️⃣ 测试创建供应商 (POST /api/suppliers)...');
    try {
      const supplierData = {
        name: 'Test Supplier Co.',
        contactPerson: 'John Doe',
        phone: '+86-138-0000-0000',
        email: 'john@testsupplier.com',
        address: '123 Test Street, Test City',
      };

      const response = await fetch(`${baseUrl}/api/suppliers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supplierData),
      });
      const data = await response.json();
      console.log(`   状态: ${response.status}`);
      if (response.ok) {
        console.log(`   创建成功: ${data.name}`);
        console.log(`   联系人: ${data.contactPerson}`);
        console.log(`   邮箱: ${data.email}`);
        console.log(`   供应商ID: ${data.id}`);
      } else {
        console.log(`   错误: ${data.message}`);
      }
    } catch (error) {
      console.log(`   ❌ 失败: ${error}`);
    }
    console.log();

    // 3. 测试获取库存列表
    console.log('3️⃣ 测试获取库存列表 (GET /api/inventory)...');
    try {
      const response = await fetch(`${baseUrl}/api/inventory?page=1&limit=5`);
      const data = await response.json();
      console.log(`   状态: ${response.status}`);
      if (response.ok) {
        console.log(`   找到库存项目: ${data.inventoryItems.length} 个`);
        console.log(`   总库存价值: ¥${data.stats.totalValue.toFixed(2)}`);
        console.log(`   低库存项目: ${data.stats.lowStockItems} 个`);
        data.inventoryItems.forEach((item: any, index: number) => {
          console.log(`   ${index + 1}. ${item.product.name} - 数量: ${item.quantity} (位置: ${item.location || 'N/A'})`);
        });
      } else {
        console.log(`   错误: ${data.message}`);
      }
    } catch (error) {
      console.log(`   ❌ 失败: ${error}`);
    }
    console.log();

    // 4. 测试创建库存项目
    console.log('4️⃣ 测试创建库存项目 (POST /api/inventory)...');
    try {
      const inventoryData = {
        productId: 1, // 假设商品ID为1存在
        quantity: 100,
        location: 'A-01-01',
        batchNumber: 'BATCH-2024-001',
        expiryDate: '2025-12-31',
      };

      const response = await fetch(`${baseUrl}/api/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inventoryData),
      });
      const data = await response.json();
      console.log(`   状态: ${response.status}`);
      if (response.ok) {
        console.log(`   创建成功: ${data.product.name}`);
        console.log(`   数量: ${data.quantity}`);
        console.log(`   位置: ${data.location}`);
        console.log(`   批次号: ${data.batchNumber}`);
        console.log(`   库存项目ID: ${data.id}`);
      } else {
        console.log(`   错误: ${data.message}`);
      }
    } catch (error) {
      console.log(`   ❌ 失败: ${error}`);
    }
    console.log();

    // 5. 测试获取库存移动记录
    console.log('5️⃣ 测试获取库存移动记录 (GET /api/stock-movements)...');
    try {
      const response = await fetch(`${baseUrl}/api/stock-movements?page=1&limit=5`);
      const data = await response.json();
      console.log(`   状态: ${response.status}`);
      if (response.ok) {
        console.log(`   找到移动记录: ${data.stockMovements.length} 个`);
        console.log(`   入库记录: ${data.stats.inboundMovements} 个`);
        console.log(`   出库记录: ${data.stats.outboundMovements} 个`);
        data.stockMovements.forEach((movement: any, index: number) => {
          console.log(`   ${index + 1}. ${movement.product.name} - ${movement.type}: ${movement.quantity > 0 ? '+' : ''}${movement.quantity}`);
        });
      } else {
        console.log(`   错误: ${data.message}`);
      }
    } catch (error) {
      console.log(`   ❌ 失败: ${error}`);
    }
    console.log();

    // 6. 测试创建库存移动记录
    console.log('6️⃣ 测试创建库存移动记录 (POST /api/stock-movements)...');
    try {
      const movementData = {
        productId: 1, // 假设商品ID为1存在
        userId: 1, // 假设用户ID为1存在
        type: 'PURCHASE',
        quantity: 50,
        reason: '采购入库',
        reference: 'PO-2024-001',
        notes: '测试采购入库记录',
      };

      const response = await fetch(`${baseUrl}/api/stock-movements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(movementData),
      });
      const data = await response.json();
      console.log(`   状态: ${response.status}`);
      if (response.ok) {
        console.log(`   创建成功: ${data.product.name}`);
        console.log(`   类型: ${data.type}`);
        console.log(`   数量: ${data.quantity}`);
        console.log(`   原因: ${data.reason}`);
        console.log(`   参考单号: ${data.reference}`);
      } else {
        console.log(`   错误: ${data.message}`);
      }
    } catch (error) {
      console.log(`   ❌ 失败: ${error}`);
    }
    console.log();

    // 7. 测试低库存过滤
    console.log('7️⃣ 测试低库存过滤 (GET /api/inventory?lowStock=true)...');
    try {
      const response = await fetch(`${baseUrl}/api/inventory?lowStock=true&limit=10`);
      const data = await response.json();
      console.log(`   状态: ${response.status}`);
      if (response.ok) {
        console.log(`   低库存项目: ${data.inventoryItems.length} 个`);
        data.inventoryItems.forEach((item: any, index: number) => {
          console.log(`   ${index + 1}. ${item.product.name} - 当前: ${item.quantity}, 阈值: ${item.product.lowStockThreshold}`);
        });
      } else {
        console.log(`   错误: ${data.message}`);
      }
    } catch (error) {
      console.log(`   ❌ 失败: ${error}`);
    }
    console.log();

    console.log('✅ 库存管理API测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
if (require.main === module) {
  testInventoryAPI().catch((error) => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  });
}

export default testInventoryAPI; 