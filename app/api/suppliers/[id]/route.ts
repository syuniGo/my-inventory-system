import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

// GET /api/suppliers/[id] - 获取单个供应商
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: 'Invalid supplier ID' },
        { status: 400 }
      );
    }

    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            sku: true,
            sellingPrice: true,
            lowStockThreshold: true,
            createdAt: true,
          },
          orderBy: {
            name: 'asc',
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!supplier) {
      return NextResponse.json(
        { message: 'Supplier not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(supplier);
  } catch (error) {
    console.error('Failed to fetch supplier:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { message: 'Failed to fetch supplier', error: errorMessage },
      { status: 500 }
    );
  }
}

// PUT /api/suppliers/[id] - 更新供应商
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: 'Invalid supplier ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      name,
      contactPerson,
      phone,
      email,
      address,
    } = body;

    // 验证供应商是否存在
    const existingSupplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!existingSupplier) {
      return NextResponse.json(
        { message: 'Supplier not found' },
        { status: 404 }
      );
    }

    // 验证邮箱格式（如果提供）
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // 准备更新数据
    const updateData: any = {};
    
    if (name !== undefined) {
      if (!name || !name.trim()) {
        return NextResponse.json(
          { message: 'Name cannot be empty' },
          { status: 400 }
        );
      }
      updateData.name = String(name).trim();
    }
    
    if (contactPerson !== undefined) {
      updateData.contactPerson = contactPerson ? String(contactPerson).trim() : null;
    }
    
    if (phone !== undefined) {
      updateData.phone = phone ? String(phone).trim() : null;
    }
    
    if (email !== undefined) {
      updateData.email = email ? String(email).trim() : null;
    }
    
    if (address !== undefined) {
      updateData.address = address ? String(address).trim() : null;
    }

    const updatedSupplier = await prisma.supplier.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return NextResponse.json(updatedSupplier);
  } catch (error) {
    console.error('Failed to update supplier:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // 唯一约束违反
        return NextResponse.json(
          { message: 'Supplier with this name already exists' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { message: 'Failed to update supplier', error: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE /api/suppliers/[id] - 删除供应商
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: 'Invalid supplier ID' },
        { status: 400 }
      );
    }

    // 验证供应商是否存在
    const existingSupplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });

    if (!existingSupplier) {
      return NextResponse.json(
        { message: 'Supplier not found' },
        { status: 404 }
      );
    }

    // 检查是否有关联的商品
    if (existingSupplier.products.length > 0) {
      return NextResponse.json(
        { 
          message: 'Cannot delete supplier with existing products',
          details: `This supplier has ${existingSupplier.products.length} associated products`
        },
        { status: 409 }
      );
    }

    await prisma.supplier.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Supplier deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to delete supplier:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        // 外键约束违反
        return NextResponse.json(
          { message: 'Cannot delete supplier due to existing references' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { message: 'Failed to delete supplier', error: errorMessage },
      { status: 500 }
    );
  }
} 