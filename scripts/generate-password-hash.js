const bcrypt = require('bcrypt');

// 生成密码哈希
async function generateHashes() {
    const saltRounds = 10;
    
    const passwords = ['admin', 'manager', 'user1'];
    
    console.log('生成密码哈希:');
    console.log('=================');
    
    for (const password of passwords) {
        const hash = await bcrypt.hash(password, saltRounds);
        console.log(`${password}: ${hash}`);
    }
}

generateHashes().catch(console.error); 