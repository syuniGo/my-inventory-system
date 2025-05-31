#!/usr/bin/env ts-node
// scripts/test-dynamic-routes.ts
// 动态路由测试脚本

import { config } from 'dotenv';

// 加载环境变量
config();

async function testDynamicRoutes() {
  console.log('🚀 开始动态路由测试...\n');

  const baseUrl = 'http://localhost:3000';

  try {
    // 1. 测试获取单个商品
    console.log('1️⃣ 测试获取单个商品 (GET /api/products/1)...');
    try {
      const response = await fetch(`${baseUrl}/api/products/1`);
      const data = await response.json();
      console.log(`   状态: ${response.status}`);
      console.log(`   商品名称: ${data.name}`);
      console.log(`   SKU: ${data.sku}`);
      console.log(`   价格: ${data.sellingPrice}`);
      console.log(`   分类: ${data.category?.name}`);
    } catch (error) {
      console.log(`   ❌ 失败: ${error}`);
    }
    console.log();

    // 2. 测试更新商品
    console.log('2️⃣ 测试更新商品 (PUT /api/products/4)...');
    try {
      const updateData = {
        name: 'Updated Test Product',
        sku: 'UPDATED-TEST-001',
        sellingPrice: 199.99,
        description: 'This is an updated test product',
        categoryId: 1,
      };

      const response = await fetch(`${baseUrl}/api/products/4`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      const data = await response.json();
      console.log(`   状态: ${response.status}`);
      if (response.ok) {
        console.log(`   更新后商品名称: ${data.name}`);
        console.log(`   更新后SKU: ${data.sku}`);
        console.log(`   更新后价格: ${data.sellingPrice}`);
      } else {
        console.log(`   错误: ${data.message}`);
      }
    } catch (error) {
      console.log(`   ❌ 失败: ${error}`);
    }
    console.log();

    // 3. 测试获取单个分类
    console.log('3️⃣ 测试获取单个分类 (GET /api/categories/1)...');
    try {
      const response = await fetch(`${baseUrl}/api/categories/1`);
      const data = await response.json();
      console.log(`   状态: ${response.status}`);
      if (response.ok) {
        console.log(`   分类名称: ${data.name}`);
        console.log(`   描述: ${data.description}`);
        console.log(`   商品数量: ${data._count?.products || 0}`);
        console.log(`   关联商品: ${data.products?.length || 0} 个`);
      } else {
        console.log(`   错误: ${data.message}`);
      }
    } catch (error) {
      console.log(`   ❌ 失败: ${error}`);
    }
    console.log();

    // 4. 测试更新分类
    console.log('4️⃣ 测试更新分类 (PUT /api/categories/7)...');
    try {
      const updateData = {
        name: 'Updated Test Category',
        description: 'This is an updated test category',
      };

      const response = await fetch(`${baseUrl}/api/categories/7`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      const data = await response.json();
      console.log(`   状态: ${response.status}`);
      if (response.ok) {
        console.log(`   更新后分类名称: ${data.name}`);
        console.log(`   更新后描述: ${data.description}`);
      } else {
        console.log(`   错误: ${data.message}`);
      }
    } catch (error) {
      console.log(`   ❌ 失败: ${error}`);
    }
    console.log();

    // 5. 测试商品搜索和分页
    console.log('5️⃣ 测试商品搜索和分页...');
    try {
      const response = await fetch(`${baseUrl}/api/products?search=笔记本&page=1&limit=2&sortBy=name&sortOrder=asc`);
      const data = await response.json();
      console.log(`   状态: ${response.status}`);
      if (response.ok) {
        console.log(`   找到商品: ${data.products.length} 个`);
        console.log(`   总数: ${data.pagination.totalCount}`);
        console.log(`   当前页: ${data.pagination.currentPage}`);
        console.log(`   搜索关键词: ${data.filters.search}`);
        data.products.forEach((product: any, index: number) => {
          console.log(`   ${index + 1}. ${product.name} (${product.sku})`);
        });
      } else {
        console.log(`   错误: ${data.message}`);
      }
    } catch (error) {
      console.log(`   ❌ 失败: ${error}`);
    }
    console.log();

    // 6. 测试分类搜索
    console.log('6️⃣ 测试分类搜索...');
    try {
      const response = await fetch(`${baseUrl}/api/categories?search=电脑&includeProductCount=true`);
      const data = await response.json();
      console.log(`   状态: ${response.status}`);
      if (response.ok) {
        console.log(`   找到分类: ${data.categories.length} 个`);
        data.categories.forEach((category: any, index: number) => {
          console.log(`   ${index + 1}. ${category.name} (${category._count?.products || 0} 个商品)`);
        });
      } else {
        console.log(`   错误: ${data.message}`);
      }
    } catch (error) {
      console.log(`   ❌ 失败: ${error}`);
    }
    console.log();

    console.log('✅ 动态路由测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
if (require.main === module) {
  testDynamicRoutes().catch((error) => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  });
}

export default testDynamicRoutes; 