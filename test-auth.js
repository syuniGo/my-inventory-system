// 测试认证函数
const { verifyToken, getCurrentUser } = require('./src/lib/auth.ts');

async function testAuth() {
  console.log('🧪 测试认证函数...');
  
  // 测试verifyToken
  console.log('\n1. 测试 verifyToken:');
  const payload = verifyToken('test_token');
  console.log('verifyToken结果:', payload);
  
  if (payload) {
    console.log('✅ verifyToken 成功');
    
    // 测试getCurrentUser
    console.log('\n2. 测试 getCurrentUser:');
    try {
      const user = await getCurrentUser('test_token');
      console.log('getCurrentUser结果:', user);
      
      if (user) {
        console.log('✅ getCurrentUser 成功');
        console.log('🎉 认证测试通过！');
      } else {
        console.log('❌ getCurrentUser 返回null');
      }
    } catch (error) {
      console.log('❌ getCurrentUser 错误:', error.message);
    }
  } else {
    console.log('❌ verifyToken 失败');
  }
}

testAuth().catch(console.error); 