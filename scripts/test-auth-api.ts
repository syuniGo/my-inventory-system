#!/usr/bin/env ts-node
// scripts/test-auth-api.ts
// 认证API测试脚本

import { config } from 'dotenv';

// 加载环境变量
config();

async function testAuthAPI() {
  console.log('🚀 开始认证API测试...\n');

  const baseUrl = 'http://localhost:3000';
  let authToken = '';
  let userId = 0;

  try {
    // 1. 测试用户注册
    console.log('1️⃣ 测试用户注册 (POST /api/auth/register)...');
    try {
      const registerData = {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });
      const data = await response.json();
      console.log(`   状态: ${response.status}`);
      if (response.ok) {
        console.log(`   注册成功: ${data.user.username}`);
        console.log(`   用户角色: ${data.user.role}`);
        console.log(`   用户ID: ${data.user.id}`);
        authToken = data.token;
        userId = data.user.id;
      } else {
        console.log(`   错误: ${data.message}`);
      }
    } catch (error) {
      console.log(`   ❌ 失败: ${error}`);
    }
    console.log();

    // 2. 测试用户登录
    console.log('2️⃣ 测试用户登录 (POST /api/auth/login)...');
    try {
      const loginData = {
        username: 'admin',
        password: 'admin', // 使用种子数据中的管理员账户
      };

      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });
      const data = await response.json();
      console.log(`   状态: ${response.status}`);
      if (response.ok) {
        console.log(`   登录成功: ${data.user.username}`);
        console.log(`   用户角色: ${data.user.role}`);
        console.log(`   Token: ${data.token.substring(0, 20)}...`);
        authToken = data.token; // 使用管理员token进行后续测试
      } else {
        console.log(`   错误: ${data.message}`);
      }
    } catch (error) {
      console.log(`   ❌ 失败: ${error}`);
    }
    console.log();

    // 3. 测试获取当前用户信息
    console.log('3️⃣ 测试获取当前用户信息 (GET /api/auth/me)...');
    try {
      const response = await fetch(`${baseUrl}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      const data = await response.json();
      console.log(`   状态: ${response.status}`);
      if (response.ok) {
        console.log(`   用户名: ${data.user.username}`);
        console.log(`   邮箱: ${data.user.email}`);
        console.log(`   角色: ${data.user.role}`);
        console.log(`   激活状态: ${data.user.isActive}`);
      } else {
        console.log(`   错误: ${data.message}`);
      }
    } catch (error) {
      console.log(`   ❌ 失败: ${error}`);
    }
    console.log();

    // 4. 测试获取用户列表（需要管理员权限）
    console.log('4️⃣ 测试获取用户列表 (GET /api/users)...');
    try {
      const response = await fetch(`${baseUrl}/api/users?page=1&limit=5`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      const data = await response.json();
      console.log(`   状态: ${response.status}`);
      if (response.ok) {
        console.log(`   找到用户: ${data.users.length} 个`);
        data.users.forEach((user: any, index: number) => {
          console.log(`   ${index + 1}. ${user.username} (${user.role}) - ${user.isActive ? '激活' : '未激活'}`);
        });
      } else {
        console.log(`   错误: ${data.message}`);
      }
    } catch (error) {
      console.log(`   ❌ 失败: ${error}`);
    }
    console.log();

    // 5. 测试创建新用户（需要管理员权限）
    console.log('5️⃣ 测试创建新用户 (POST /api/users)...');
    try {
      const newUserData = {
        username: 'newmanager',
        email: 'newmanager@example.com',
        password: 'password123',
        role: 'MANAGER',
        firstName: 'New',
        lastName: 'Manager',
      };

      const response = await fetch(`${baseUrl}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(newUserData),
      });
      const data = await response.json();
      console.log(`   状态: ${response.status}`);
      if (response.ok) {
        console.log(`   创建成功: ${data.user.username}`);
        console.log(`   用户角色: ${data.user.role}`);
        console.log(`   用户ID: ${data.user.id}`);
      } else {
        console.log(`   错误: ${data.message}`);
      }
    } catch (error) {
      console.log(`   ❌ 失败: ${error}`);
    }
    console.log();

    // 6. 测试获取单个用户信息
    console.log('6️⃣ 测试获取单个用户信息 (GET /api/users/1)...');
    try {
      const response = await fetch(`${baseUrl}/api/users/1`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      const data = await response.json();
      console.log(`   状态: ${response.status}`);
      if (response.ok) {
        console.log(`   用户名: ${data.username}`);
        console.log(`   邮箱: ${data.email}`);
        console.log(`   角色: ${data.role}`);
        console.log(`   库存移动记录: ${data._count.stockMovements} 条`);
      } else {
        console.log(`   错误: ${data.message}`);
      }
    } catch (error) {
      console.log(`   ❌ 失败: ${error}`);
    }
    console.log();

    // 7. 测试无权限访问
    console.log('7️⃣ 测试无权限访问 (GET /api/users without token)...');
    try {
      const response = await fetch(`${baseUrl}/api/users`);
      const data = await response.json();
      console.log(`   状态: ${response.status}`);
      console.log(`   错误信息: ${data.message}`);
    } catch (error) {
      console.log(`   ❌ 失败: ${error}`);
    }
    console.log();

    // 8. 测试无效token
    console.log('8️⃣ 测试无效token (GET /api/auth/me with invalid token)...');
    try {
      const response = await fetch(`${baseUrl}/api/auth/me`, {
        headers: {
          'Authorization': 'Bearer invalid_token',
        },
      });
      const data = await response.json();
      console.log(`   状态: ${response.status}`);
      console.log(`   错误信息: ${data.message}`);
    } catch (error) {
      console.log(`   ❌ 失败: ${error}`);
    }
    console.log();

    console.log('✅ 认证API测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
if (require.main === module) {
  testAuthAPI().catch((error) => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  });
}

export default testAuthAPI; 