// src/app/api/example/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Handle GET request
  return NextResponse.json({ message: 'Hello from GET' });
}

export async function POST(request: Request) {
  // Handle POST request
  const body = await request.json();
  return NextResponse.json({ message: 'Hello from POST', received: body });
}

// You can also define PUT, DELETE, PATCH, etc.
// export async function PUT(request: Request) { ... }
// export async function DELETE(request: Request) { ... }