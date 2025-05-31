import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
// Attempt to import the error type directly from the runtime library
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

// GET /api/products - 获取商品列表（支持分页、搜索、排序）
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 分页参数
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;
    
    // 搜索参数
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId');
    const supplierId = searchParams.get('supplierId');
    
    // 排序参数
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // 价格范围过滤
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    
    // 库存状态过滤
    const lowStock = searchParams.get('lowStock'); // 'true' 表示只显示低库存商品

    // 构建查询条件
    const where: any = {};
    
    // 搜索条件（商品名称、SKU、描述）
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // 分类过滤
    if (categoryId) {
      where.categoryId = parseInt(categoryId, 10);
    }
    
    // 供应商过滤
    if (supplierId) {
      where.supplierId = parseInt(supplierId, 10);
    }
    
    // 价格范围过滤
    if (minPrice || maxPrice) {
      where.sellingPrice = {};
      if (minPrice) {
        where.sellingPrice.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        where.sellingPrice.lte = parseFloat(maxPrice);
      }
    }

    // 构建排序条件
    const orderBy: any = {};
    if (sortBy === 'name' || sortBy === 'sku' || sortBy === 'sellingPrice' || sortBy === 'createdAt' || sortBy === 'updatedAt') {
      orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.createdAt = 'desc'; // 默认排序
    }

    // 获取商品列表
    const products = await prisma.product.findMany({
      where,
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
      orderBy,
      skip,
      take: limit,
    });

    // 获取总数量（用于分页）
    const totalCount = await prisma.product.count({ where });
    
    // 计算分页信息
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // 如果需要低库存过滤，这里需要额外的逻辑
    // 因为低库存需要查询库存表，这里先预留接口
    let filteredProducts = products;
    if (lowStock === 'true') {
      // TODO: 实现低库存过滤逻辑
      // 这需要查询 inventory_items 表来确定实际库存
      // 暂时返回所有商品
    }

    return NextResponse.json({
      products: filteredProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        search,
        categoryId: categoryId ? parseInt(categoryId, 10) : null,
        supplierId: supplierId ? parseInt(supplierId, 10) : null,
        minPrice: minPrice ? parseFloat(minPrice) : null,
        maxPrice: maxPrice ? parseFloat(maxPrice) : null,
        lowStock: lowStock === 'true',
      },
      sorting: {
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { message: 'Failed to fetch products', error: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      sku,
      sellingPrice,
      description,
      categoryId,
      supplierId,
      purchasePrice,
      imageUrl,
      lowStockThreshold,
    } = body;

    if (!name || !sku || sellingPrice === undefined || sellingPrice === null) {
      return NextResponse.json(
        { message: 'Missing required fields: name, sku, sellingPrice' },
        { status: 400 }
      );
    }

    // Let TypeScript infer the type, ensure all fields are correctly assigned
    const productData = {
      name: String(name),
      sku: String(sku),
      sellingPrice: parseFloat(String(sellingPrice)), // Ensure it is a number for Prisma
      description: description ? String(description) : null,
      purchasePrice: purchasePrice !== undefined && purchasePrice !== null ? parseFloat(String(purchasePrice)) : null,
      categoryId: categoryId !== undefined && categoryId !== null ? parseInt(String(categoryId), 10) : null,
      supplierId: supplierId !== undefined && supplierId !== null ? parseInt(String(supplierId), 10) : null,
      imageUrl: imageUrl ? String(imageUrl) : null,
      lowStockThreshold: lowStockThreshold !== undefined && lowStockThreshold !== null ? parseInt(String(lowStockThreshold), 10) : 0,
    };

    const newProduct = await prisma.product.create({
      data: productData,
    });
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Failed to create product:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        let targetDetail = 'fields';
        // Prisma specific error meta structure for P2002
        const meta = error.meta as { target?: string[] | string }; 
        if (meta && meta.target) {
          targetDetail = Array.isArray(meta.target) ? meta.target.join(', ') : String(meta.target);
        }
        return NextResponse.json(
          { message: `Failed to create product: Unique constraint violation on ${targetDetail}.` },
          { status: 409 } // Conflict
        );
      }
    }
    return NextResponse.json(
      { message: 'Failed to create product', error: errorMessage },
      { status: 500 }
    );
  }
} 