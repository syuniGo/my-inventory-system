import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

// GET /api/products/[id] - 获取单个商品详情
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id, 10);
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { message: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        // 如果需要包含供应商信息，取消注释下面的代码
        // supplier: {
        //   select: {
        //     id: true,
        //     name: true,
        //     contactPerson: true,
        //     phone: true,
        //     email: true,
        //   },
        // },
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Failed to fetch product:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { message: 'Failed to fetch product', error: errorMessage },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - 更新商品信息
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id, 10);
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { message: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      sku,
      categoryId,
      supplierId,
      purchasePrice,
      sellingPrice,
      imageUrl,
      lowStockThreshold,
    } = body;

    // 验证必填字段
    if (!name || !sku || sellingPrice === undefined || sellingPrice === null) {
      return NextResponse.json(
        { message: 'Missing required fields: name, sku, sellingPrice' },
        { status: 400 }
      );
    }

    // 检查商品是否存在
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    // 准备更新数据
    const updateData = {
      name: String(name),
      sku: String(sku),
      sellingPrice: parseFloat(String(sellingPrice)),
      description: description ? String(description) : null,
      purchasePrice: purchasePrice !== undefined && purchasePrice !== null ? parseFloat(String(purchasePrice)) : null,
      categoryId: categoryId !== undefined && categoryId !== null ? parseInt(String(categoryId), 10) : null,
      supplierId: supplierId !== undefined && supplierId !== null ? parseInt(String(supplierId), 10) : null,
      imageUrl: imageUrl ? String(imageUrl) : null,
      lowStockThreshold: lowStockThreshold !== undefined && lowStockThreshold !== null ? parseInt(String(lowStockThreshold), 10) : existingProduct.lowStockThreshold,
    };

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Failed to update product:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // 唯一约束违反（如SKU重复）
        const target = (error.meta && Array.isArray(error.meta.target)) ? error.meta.target.join(', ') : 'fields';
        return NextResponse.json(
          { message: `Failed to update product: Unique constraint violation on ${target}.` },
          { status: 409 }
        );
      }
      if (error.code === 'P2025') {
        // 记录不存在
        return NextResponse.json(
          { message: 'Product not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { message: 'Failed to update product', error: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - 删除商品
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id, 10);
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { message: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // 检查商品是否存在
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    // 检查是否有相关的库存记录
    // 注意：这里需要根据实际的库存表结构来调整
    // 如果有库存记录，可能需要先处理这些记录或者阻止删除
    
    // 删除商品
    const deletedProduct = await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({
      message: 'Product deleted successfully',
      deletedProduct: {
        id: deletedProduct.id,
        name: deletedProduct.name,
        sku: deletedProduct.sku,
      },
    });
  } catch (error) {
    console.error('Failed to delete product:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        // 记录不存在
        return NextResponse.json(
          { message: 'Product not found' },
          { status: 404 }
        );
      }
      if (error.code === 'P2003') {
        // 外键约束违反
        return NextResponse.json(
          { message: 'Cannot delete product: it has related records (inventory, orders, etc.)' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { message: 'Failed to delete product', error: errorMessage },
      { status: 500 }
    );
  }
} 