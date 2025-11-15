import { NextRequest, NextResponse } from 'next/server';

// Mock data para desarrollo
const mockInspectors = [
  {
    id: '1',
    name: 'Inspector 1',
    email: 'inspector1@example.com',
    phone: '123456789',
    role: 'inspector',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search');
  const status = searchParams.get('status');

  let filtered = mockInspectors;

  if (search) {
    filtered = filtered.filter((i) =>
      i.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (status) {
    filtered = filtered.filter((i) => i.status === status);
  }

  return NextResponse.json({
    data: filtered,
    total: filtered.length,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newInspector = {
      id: Date.now().toString(),
      ...body,
      status: body.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ data: newInspector }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear inspector' },
      { status: 500 }
    );
  }
}

