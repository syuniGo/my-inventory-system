#!/usr/bin/env ts-node
// scripts/seed-database.ts
// 数据库种子数据脚本

import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { hashPassword } from '../src/lib/auth';

// 加载环境变量
config();

const prisma = new PrismaClient();

async function seedDatabase() {
  console.log('🌱 开始播种数据库...\n');

  try {
    // 1. 创建用户
    console.log('1️⃣ 创建用户...');
    const users = await Promise.all([
      prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
          username: 'admin',
          email: 'admin@inventory.com',
          passwordHash: hashPassword('admin'), // 密码: admin
          role: 'ADMIN',
          firstName: 'Admin',
          lastName: 'User',
        },
      }),
      prisma.user.upsert({
        where: { username: 'manager' },
        update: {},
        create: {
          username: 'manager',
          email: 'manager@inventory.com',
          passwordHash: hashPassword('manager'), // 密码: manager
          role: 'MANAGER',
          firstName: 'Manager',
          lastName: 'User',
        },
      }),
      prisma.user.upsert({
        where: { username: 'user1' },
        update: {},
        create: {
          username: 'user1',
          email: 'user1@inventory.com',
          passwordHash: hashPassword('user1'), // 密码: user1
          role: 'USER',
          firstName: 'Regular',
          lastName: 'User',
        },
      }),
    ]);
    console.log(`   ✅ 创建了 ${users.length} 个用户`);
    console.log(`   📝 用户登录信息:`);
    console.log(`      admin / admin (管理员)`);
    console.log(`      manager / manager (经理)`);
    console.log(`      user1 / user1 (普通用户)`);

    // 2. 创建供应商
    console.log('2️⃣ 创建供应商...');
    const suppliers = await Promise.all([
      prisma.supplier.upsert({
        where: { name: '苹果公司' },
        update: {},
        create: {
          name: '苹果公司',
          contactPerson: '张三',
          phone: '+86-138-0001-0001',
          email: 'contact@apple-supplier.com',
          address: '北京市朝阳区科技园区1号',
        },
      }),
      prisma.supplier.upsert({
        where: { name: '联想集团' },
        update: {},
        create: {
          name: '联想集团',
          contactPerson: '李四',
          phone: '+86-138-0002-0002',
          email: 'contact@lenovo-supplier.com',
          address: '上海市浦东新区科技大道2号',
        },
      }),
      prisma.supplier.upsert({
        where: { name: '华为技术' },
        update: {},
        create: {
          name: '华为技术',
          contactPerson: '王五',
          phone: '+86-138-0003-0003',
          email: 'contact@huawei-supplier.com',
          address: '深圳市南山区科技园3号',
        },
      }),
    ]);
    console.log(`   ✅ 创建了 ${suppliers.length} 个供应商`);

    // 3. 更新现有商品的供应商信息
    console.log('3️⃣ 更新商品供应商信息...');
    const products = await prisma.product.findMany();
    if (products.length > 0) {
      // 为现有商品分配供应商
      await prisma.product.update({
        where: { id: products[0].id },
        data: { supplierId: suppliers[0].id },
      });
      
      if (products.length > 1) {
        await prisma.product.update({
          where: { id: products[1].id },
          data: { supplierId: suppliers[1].id },
        });
      }
      
      if (products.length > 2) {
        await prisma.product.update({
          where: { id: products[2].id },
          data: { supplierId: suppliers[2].id },
        });
      }
      console.log(`   ✅ 更新了 ${Math.min(products.length, 3)} 个商品的供应商信息`);
    }

    // 4. 创建库存项目
    console.log('4️⃣ 创建库存项目...');
    const inventoryItems = [];
    for (let i = 0; i < Math.min(products.length, 3); i++) {
      const item = await prisma.inventoryItem.upsert({
        where: { 
          productId_batchNumber: {
            productId: products[i].id,
            batchNumber: `BATCH-2024-00${i + 1}`,
          }
        },
        update: {},
        create: {
          productId: products[i].id,
          quantity: 50 + (i * 25), // 50, 75, 100
          location: `A-0${i + 1}-01`,
          batchNumber: `BATCH-2024-00${i + 1}`,
          expiryDate: new Date('2025-12-31'),
        },
      });
      inventoryItems.push(item);
    }
    console.log(`   ✅ 创建了 ${inventoryItems.length} 个库存项目`);

    // 5. 创建库存移动记录
    console.log('5️⃣ 创建库存移动记录...');
    const stockMovements = [];
    for (let i = 0; i < inventoryItems.length; i++) {
      // 入库记录
      const inboundMovement = await prisma.stockMovement.create({
        data: {
          productId: inventoryItems[i].productId,
          inventoryItemId: inventoryItems[i].id,
          userId: users[0].id, // admin用户
          type: 'PURCHASE',
          quantity: inventoryItems[i].quantity,
          reason: '采购入库',
          reference: `PO-2024-00${i + 1}`,
          notes: `初始库存入库 - 批次 ${inventoryItems[i].batchNumber}`,
        },
      });
      stockMovements.push(inboundMovement);

      // 如果是第一个商品，再创建一个出库记录
      if (i === 0) {
        const outboundMovement = await prisma.stockMovement.create({
          data: {
            productId: inventoryItems[i].productId,
            inventoryItemId: inventoryItems[i].id,
            userId: users[1].id, // manager用户
            type: 'SALE',
            quantity: -10,
            reason: '销售出库',
            reference: `SO-2024-001`,
            notes: '测试销售出库记录',
          },
        });
        stockMovements.push(outboundMovement);

        // 更新库存数量
        await prisma.inventoryItem.update({
          where: { id: inventoryItems[i].id },
          data: { quantity: { decrement: 10 } },
        });
      }
    }
    console.log(`   ✅ 创建了 ${stockMovements.length} 个库存移动记录`);

    // 6. 显示统计信息
    console.log('\n📊 数据库统计信息:');
    const stats = {
      users: await prisma.user.count(),
      suppliers: await prisma.supplier.count(),
      categories: await prisma.category.count(),
      products: await prisma.product.count(),
      inventoryItems: await prisma.inventoryItem.count(),
      stockMovements: await prisma.stockMovement.count(),
    };

    Object.entries(stats).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });

    console.log('\n✅ 数据库播种完成！');

  } catch (error) {
    console.error('❌ 数据库播种失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 运行播种脚本
if (require.main === module) {
  seedDatabase().catch((error) => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  });
}

export default seedDatabase; 