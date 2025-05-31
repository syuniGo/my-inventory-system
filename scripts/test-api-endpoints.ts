#!/usr/bin/env ts-node
// scripts/test-api-endpoints.ts
// API端点测试脚本

import { config } from 'dotenv';

// 加载环境变量
config();

async function testApiEndpoints() {
  console.log('🚀 开始API端点测试...\n');

  const baseUrl = 'http://localhost:3000';

  try {
    // 1. 测试健康检查
    console.log('1️⃣ 测试健康检查端点...');
    try {
      const healthResponse = await fetch(`${baseUrl}/api/health`);
      const healthData = await healthResponse.json();
      console.log(`   状态: ${healthResponse.status}`);
      console.log(`   响应: ${JSON.stringify(healthData, null, 2)}`);
    } catch (error) {
      console.log(`   ❌ 健康检查失败: ${error}`);
    }
    console.log();

    // 2. 测试分类列表
    console.log('2️⃣ 测试分类列表端点...');
    try {
      const categoriesResponse = await fetch(`${baseUrl}/api/categories`);
      const categoriesData = await categoriesResponse.json();
      console.log(`   状态: ${categoriesResponse.status}`);
      console.log(`   响应: ${JSON.stringify(categoriesData, null, 2)}`);
    } catch (error) {
      console.log(`   ❌ 分类列表失败: ${error}`);
    }
    console.log();

    // 3. 测试商品列表
    console.log('3️⃣ 测试商品列表端点...');
    try {
      const productsResponse = await fetch(`${baseUrl}/api/products`);
      const productsData = await productsResponse.json();
      console.log(`   状态: ${productsResponse.status}`);
      console.log(`   响应: ${JSON.stringify(productsData, null, 2)}`);
    } catch (error) {
      console.log(`   ❌ 商品列表失败: ${error}`);
    }
    console.log();

    // 4. 测试创建分类
    console.log('4️⃣ 测试创建分类端点...');
    try {
      const createCategoryResponse = await fetch(`${baseUrl}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: '测试分类',
          description: '这是一个测试分类',
        }),
      });
      const createCategoryData = await createCategoryResponse.json();
      console.log(`   状态: ${createCategoryResponse.status}`);
      console.log(`   响应: ${JSON.stringify(createCategoryData, null, 2)}`);
    } catch (error) {
      console.log(`   ❌ 创建分类失败: ${error}`);
    }
    console.log();

    // 5. 测试创建商品
    console.log('5️⃣ 测试创建商品端点...');
    try {
      const createProductResponse = await fetch(`${baseUrl}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: '测试商品',
          sku: 'TEST-001',
          description: '这是一个测试商品',
          sellingPrice: 99.99,
          purchasePrice: 50.00,
          categoryId: 1,
        }),
      });
      const createProductData = await createProductResponse.json();
      console.log(`   状态: ${createProductResponse.status}`);
      console.log(`   响应: ${JSON.stringify(createProductData, null, 2)}`);
    } catch (error) {
      console.log(`   ❌ 创建商品失败: ${error}`);
    }
    console.log();

    console.log('✅ API端点测试完成！');

  } catch (error) {
    console.error('❌ API测试失败:', error);
  }
}

// 运行测试
if (require.main === module) {
  testApiEndpoints().catch((error) => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  });
}

export default testApiEndpoints; 