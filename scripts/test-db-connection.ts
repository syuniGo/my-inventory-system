#!/usr/bin/env ts-node
// scripts/test-db-connection.ts
// 数据库连接测试脚本

import { config } from 'dotenv';
import {
  initializePool,
  initializePrisma,
  query,
  testConnection,
  testPrismaConnection,
  healthCheck,
  closeConnections,
} from '../src/lib/database';

// 加载环境变量
config();

async function main() {
  console.log('🚀 开始数据库连接测试...\n');

  try {
    // 设置数据库连接URL（使用Docker配置）
    process.env.DATABASE_URL = 'postgresql://user:password@localhost:15432/inventory_db';

    console.log('📊 数据库配置:');
    console.log(`   URL: ${process.env.DATABASE_URL}`);
    console.log(`   环境: ${process.env.NODE_ENV || 'development'}\n`);

    // 1. 测试PostgreSQL连接
    console.log('1️⃣ 测试PostgreSQL连接池...');
    const pool = initializePool();
    console.log('   ✅ 连接池初始化成功');

    const pgConnected = await testConnection();
    if (pgConnected) {
      console.log('   ✅ PostgreSQL连接测试成功\n');
    } else {
      console.log('   ❌ PostgreSQL连接测试失败\n');
      return;
    }

    // 2. 测试Prisma连接
    console.log('2️⃣ 测试Prisma连接...');
    const prisma = initializePrisma();
    console.log('   ✅ Prisma客户端初始化成功');

    const prismaConnected = await testPrismaConnection();
    if (prismaConnected) {
      console.log('   ✅ Prisma连接测试成功\n');
    } else {
      console.log('   ❌ Prisma连接测试失败\n');
      return;
    }

    // 3. 执行基本查询
    console.log('3️⃣ 执行基本查询测试...');
    const basicQuery = await query('SELECT NOW() as current_time, version() as db_version');
    console.log('   ✅ 基本查询成功');
    console.log(`   📅 当前时间: ${basicQuery.rows[0].current_time}`);
    console.log(`   🗄️  数据库版本: ${basicQuery.rows[0].db_version.split(',')[0]}\n`);

    // 4. 检查数据库表
    console.log('4️⃣ 检查数据库表结构...');
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`   📋 找到 ${tables.rows.length} 个表:`);
    tables.rows.forEach((row, index) => {
      console.log(`      ${index + 1}. ${row.table_name}`);
    });
    console.log();

    // 5. 检查初始数据
    console.log('5️⃣ 检查初始数据...');
    
    const categoryCount = await query('SELECT COUNT(*) as count FROM categories');
    console.log(`   📂 分类数量: ${categoryCount.rows[0].count}`);
    
    const productCount = await query('SELECT COUNT(*) as count FROM products');
    console.log(`   📦 商品数量: ${productCount.rows[0].count}`);
    
    const userCount = await query('SELECT COUNT(*) as count FROM users');
    console.log(`   👥 用户数量: ${userCount.rows[0].count}\n`);

    // 6. 显示一些示例数据
    console.log('6️⃣ 示例数据预览...');
    
    const sampleCategories = await query('SELECT id, name, description FROM categories LIMIT 3');
    console.log('   📂 分类示例:');
    sampleCategories.rows.forEach((cat, index) => {
      console.log(`      ${index + 1}. [${cat.id}] ${cat.name} - ${cat.description || '无描述'}`);
    });
    
    const sampleProducts = await query('SELECT id, name, sku, selling_price FROM products LIMIT 3');
    console.log('   📦 商品示例:');
    sampleProducts.rows.forEach((prod, index) => {
      console.log(`      ${index + 1}. [${prod.id}] ${prod.name} (${prod.sku}) - ¥${prod.selling_price}`);
    });
    console.log();

    // 7. 健康检查
    console.log('7️⃣ 执行健康检查...');
    const health = await healthCheck();
    console.log('   🏥 健康状态:');
    console.log(`      PostgreSQL: ${health.postgresql ? '✅ 健康' : '❌ 异常'}`);
    console.log(`      Prisma: ${health.prisma ? '✅ 健康' : '❌ 异常'}`);
    console.log(`      检查时间: ${health.timestamp}\n`);

    // 8. 测试CRUD操作
    console.log('8️⃣ 测试CRUD操作...');
    
    // 创建测试分类
    const insertResult = await query(`
      INSERT INTO categories (name, description) 
      VALUES ($1, $2) 
      RETURNING id, name, description
    `, ['测试分类', '这是一个测试分类']);
    
    const testCategoryId = insertResult.rows[0].id;
    console.log(`   ➕ 创建测试分类: [${testCategoryId}] ${insertResult.rows[0].name}`);
    
    // 读取测试分类
    const readResult = await query('SELECT * FROM categories WHERE id = $1', [testCategoryId]);
    console.log(`   📖 读取测试分类: ${readResult.rows[0].name}`);
    
    // 更新测试分类
    const updateResult = await query(`
      UPDATE categories 
      SET description = $1 
      WHERE id = $2 
      RETURNING name, description
    `, ['更新后的测试分类描述', testCategoryId]);
    console.log(`   ✏️  更新测试分类: ${updateResult.rows[0].description}`);
    
    // 删除测试分类
    await query('DELETE FROM categories WHERE id = $1', [testCategoryId]);
    console.log(`   🗑️  删除测试分类: [${testCategoryId}]`);
    console.log();

    console.log('🎉 所有数据库连接测试完成！');
    console.log('✅ 数据库连接正常，可以开始开发了！\n');

  } catch (error) {
    console.error('❌ 数据库连接测试失败:', error);
    process.exit(1);
  } finally {
    // 清理连接
    console.log('🧹 清理数据库连接...');
    await closeConnections();
    console.log('✅ 连接已关闭');
  }
}

// 运行测试
if (require.main === module) {
  main().catch((error) => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  });
}

export default main; 