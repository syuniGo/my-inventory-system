import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTestData() {
  try {
    console.log('开始添加测试数据...');

    // 创建分类
    const categories = await Promise.all([
      prisma.category.upsert({
        where: { name: '电子产品' },
        update: {},
        create: {
          name: '电子产品',
          description: '各种电子设备和配件',
        },
      }),
      prisma.category.upsert({
        where: { name: '办公用品' },
        update: {},
        create: {
          name: '办公用品',
          description: '办公室日常用品',
        },
      }),
      prisma.category.upsert({
        where: { name: '服装' },
        update: {},
        create: {
          name: '服装',
          description: '各类服装产品',
        },
      }),
    ]);

    console.log('分类创建完成:', categories.map(c => c.name));

    // 创建供应商
    const suppliers = await Promise.all([
      prisma.supplier.upsert({
        where: { id: 1 },
        update: {},
        create: {
          name: '科技有限公司',
          contactPerson: '张经理',
          phone: '13800138001',
          email: 'zhang@tech.com',
          address: '北京市朝阳区科技园',
        },
      }),
      prisma.supplier.upsert({
        where: { id: 2 },
        update: {},
        create: {
          name: '办公设备供应商',
          contactPerson: '李总',
          phone: '13800138002',
          email: 'li@office.com',
          address: '上海市浦东新区商务区',
        },
      }),
    ]);

    console.log('供应商创建完成:', suppliers.map((s: any) => s.name));

    // 创建产品
    const products = await Promise.all([
      prisma.product.upsert({
        where: { sku: 'LAPTOP001' },
        update: {},
        create: {
          name: '联想ThinkPad笔记本电脑',
          description: '14英寸商务笔记本，8GB内存，256GB SSD',
          sku: 'LAPTOP001',
          categoryId: categories[0].id,
          supplierId: suppliers[0].id,
          purchasePrice: 4500.00,
          sellingPrice: 5999.00,
          lowStockThreshold: 5,
        },
      }),
      prisma.product.upsert({
        where: { sku: 'MOUSE001' },
        update: {},
        create: {
          name: '无线鼠标',
          description: '2.4G无线鼠标，人体工学设计',
          sku: 'MOUSE001',
          categoryId: categories[0].id,
          supplierId: suppliers[0].id,
          purchasePrice: 45.00,
          sellingPrice: 89.00,
          lowStockThreshold: 20,
        },
      }),
      prisma.product.upsert({
        where: { sku: 'KEYBOARD001' },
        update: {},
        create: {
          name: '机械键盘',
          description: '87键机械键盘，青轴',
          sku: 'KEYBOARD001',
          categoryId: categories[0].id,
          supplierId: suppliers[0].id,
          purchasePrice: 180.00,
          sellingPrice: 299.00,
          lowStockThreshold: 10,
        },
      }),
      prisma.product.upsert({
        where: { sku: 'PAPER001' },
        update: {},
        create: {
          name: 'A4复印纸',
          description: '80g A4复印纸，500张/包',
          sku: 'PAPER001',
          categoryId: categories[1].id,
          supplierId: suppliers[1].id,
          purchasePrice: 15.00,
          sellingPrice: 25.00,
          lowStockThreshold: 50,
        },
      }),
      prisma.product.upsert({
        where: { sku: 'PEN001' },
        update: {},
        create: {
          name: '圆珠笔',
          description: '蓝色圆珠笔，0.7mm',
          sku: 'PEN001',
          categoryId: categories[1].id,
          supplierId: suppliers[1].id,
          purchasePrice: 1.50,
          sellingPrice: 3.00,
          lowStockThreshold: 100,
        },
      }),
      prisma.product.upsert({
        where: { sku: 'SHIRT001' },
        update: {},
        create: {
          name: '商务衬衫',
          description: '男士长袖商务衬衫，纯棉',
          sku: 'SHIRT001',
          categoryId: categories[2].id,
          supplierId: suppliers[0].id,
          purchasePrice: 80.00,
          sellingPrice: 159.00,
          lowStockThreshold: 15,
        },
      }),
    ]);

    console.log('产品创建完成:', products.map(p => p.name));

    // 创建库存项目
    const inventoryItems = await Promise.all([
      prisma.inventoryItem.upsert({
        where: { 
          productId_batchNumber: { 
            productId: products[0].id, 
            batchNumber: 'BATCH001' 
          } 
        },
        update: {},
        create: {
          productId: products[0].id,
          quantity: 12,
          reservedQuantity: 2,
          location: 'A区-1层-001',
          batchNumber: 'BATCH001',
          expiryDate: null,
        },
      }),
      prisma.inventoryItem.upsert({
        where: { 
          productId_batchNumber: { 
            productId: products[1].id, 
            batchNumber: 'BATCH002' 
          } 
        },
        update: {},
        create: {
          productId: products[1].id,
          quantity: 15, // 低于阈值20，会显示为低库存
          reservedQuantity: 0,
          location: 'A区-1层-002',
          batchNumber: 'BATCH002',
          expiryDate: null,
        },
      }),
      prisma.inventoryItem.upsert({
        where: { 
          productId_batchNumber: { 
            productId: products[2].id, 
            batchNumber: 'BATCH003' 
          } 
        },
        update: {},
        create: {
          productId: products[2].id,
          quantity: 25,
          reservedQuantity: 3,
          location: 'A区-1层-003',
          batchNumber: 'BATCH003',
          expiryDate: null,
        },
      }),
      prisma.inventoryItem.upsert({
        where: { 
          productId_batchNumber: { 
            productId: products[3].id, 
            batchNumber: 'BATCH004' 
          } 
        },
        update: {},
        create: {
          productId: products[3].id,
          quantity: 30, // 低于阈值50，会显示为低库存
          reservedQuantity: 5,
          location: 'B区-1层-001',
          batchNumber: 'BATCH004',
          expiryDate: null,
        },
      }),
      prisma.inventoryItem.upsert({
        where: { 
          productId_batchNumber: { 
            productId: products[4].id, 
            batchNumber: 'BATCH005' 
          } 
        },
        update: {},
        create: {
          productId: products[4].id,
          quantity: 80, // 低于阈值100，会显示为低库存
          reservedQuantity: 10,
          location: 'B区-1层-002',
          batchNumber: 'BATCH005',
          expiryDate: null,
        },
      }),
      prisma.inventoryItem.upsert({
        where: { 
          productId_batchNumber: { 
            productId: products[5].id, 
            batchNumber: 'BATCH006' 
          } 
        },
        update: {},
        create: {
          productId: products[5].id,
          quantity: 45,
          reservedQuantity: 5,
          location: 'C区-1层-001',
          batchNumber: 'BATCH006',
          expiryDate: new Date('2025-12-31'),
        },
      }),
    ]);

    console.log('库存项目创建完成:', inventoryItems.length, '个');

    console.log('✅ 测试数据添加完成！');
    console.log('📊 数据统计:');
    console.log(`- 分类: ${categories.length} 个`);
    console.log(`- 供应商: ${suppliers.length} 个`);
    console.log(`- 产品: ${products.length} 个`);
    console.log(`- 库存项目: ${inventoryItems.length} 个`);

  } catch (error) {
    console.error('❌ 添加测试数据失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  seedTestData()
    .then(() => {
      console.log('脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('脚本执行失败:', error);
      process.exit(1);
    });
}

export default seedTestData; 