import { NextRequest, NextResponse } from 'next/server';

// Mock data para desarrollo
const mockProducers = [
  {
    id: '1',
    name: 'Productor 1',
    email: 'productor1@example.com',
    phone: '123456789',
    address: 'Dirección 1',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search');
  const status = searchParams.get('status');

  let filtered = mockProducers;

  if (search) {
    filtered = filtered.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (status) {
    filtered = filtered.filter((p) => p.status === status);
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
    const newProducer = {
      id: Date.now().toString(),
      ...body,
      status: body.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ data: newProducer }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear productor' },
      { status: 500 }
    );
  }
}

