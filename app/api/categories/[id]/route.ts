import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

// GET /api/categories/[id] - 获取单个分类详情
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = parseInt(params.id, 10);
    
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { message: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { products: true }
        },
        products: {
          select: {
            id: true,
            name: true,
            sku: true,
            sellingPrice: true,
            imageUrl: true,
          },
          take: 10, // 只返回前10个商品作为预览
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Failed to fetch category:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { message: 'Failed to fetch category', error: errorMessage },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id] - 更新分类信息
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = parseInt(params.id, 10);
    
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { message: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description } = body;

    // 验证必填字段
    if (!name) {
      return NextResponse.json(
        { message: 'Missing required field: name' },
        { status: 400 }
      );
    }

    // 检查分类是否存在
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }

    // 准备更新数据
    const updateData = {
      name: String(name).trim(),
      description: description ? String(description).trim() : null,
    };

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: updateData,
      include: {
        _count: {
          select: { products: true }
        },
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Failed to update category:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // 唯一约束违反（如分类名称重复）
        return NextResponse.json(
          { message: 'Category name already exists' },
          { status: 409 }
        );
      }
      if (error.code === 'P2025') {
        // 记录不存在
        return NextResponse.json(
          { message: 'Category not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { message: 'Failed to update category', error: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - 删除分类
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = parseInt(params.id, 10);
    
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { message: 'Invalid category ID' },
        { status: 400 }
      );
    }

    // 检查分类是否存在
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { products: true }
        },
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }

    // 检查是否有关联的商品
    if (existingCategory._count.products > 0) {
      return NextResponse.json(
        { 
          message: `Cannot delete category: it has ${existingCategory._count.products} associated products. Please reassign or delete these products first.`,
          productCount: existingCategory._count.products,
        },
        { status: 409 }
      );
    }

    // 删除分类
    const deletedCategory = await prisma.category.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({
      message: 'Category deleted successfully',
      deletedCategory: {
        id: deletedCategory.id,
        name: deletedCategory.name,
      },
    });
  } catch (error) {
    console.error('Failed to delete category:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        // 记录不存在
        return NextResponse.json(
          { message: 'Category not found' },
          { status: 404 }
        );
      }
      if (error.code === 'P2003') {
        // 外键约束违反
        return NextResponse.json(
          { message: 'Cannot delete category: it has associated products' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { message: 'Failed to delete category', error: errorMessage },
      { status: 500 }
    );
  }
} 