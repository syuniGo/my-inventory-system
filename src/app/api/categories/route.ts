// src/app/api/categories/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/utils/db'; // Assuming your db.ts is in src/lib/

export async function GET(request: Request) {
  try {
    const result = await query('SELECT id, name, description FROM categories ORDER BY name ASC');
    // The `result.rows` will contain an array of category objects
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    // In a real app, you might want a more user-friendly error structure
    return NextResponse.json(
      { message: 'Failed to fetch categories', error: (error as Error).message },
      { status: 500 }
    );
  }
}