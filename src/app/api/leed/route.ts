import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const leedPath = path.join(process.cwd(), 'db', 'leed.json');

export async function GET() {
  const data = fs.readFileSync(leedPath, 'utf-8');
  return NextResponse.json(JSON.parse(data));
}

export async function POST(req: Request) {
  const body = await req.json();
  const data = JSON.parse(fs.readFileSync(leedPath, 'utf-8'));
  data.push(body);
  fs.writeFileSync(leedPath, JSON.stringify(data, null, 2));
  return NextResponse.json({ success: true });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { idx, ...update } = body;
  const data = JSON.parse(fs.readFileSync(leedPath, 'utf-8'));
  if (typeof idx !== 'number' || idx < 0 || idx >= data.length) {
    return NextResponse.json({ error: 'Índice inválido' }, { status: 400 });
  }
  data[idx] = { ...data[idx], ...update };
  fs.writeFileSync(leedPath, JSON.stringify(data, null, 2));
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const { idx } = body;
  const data = JSON.parse(fs.readFileSync(leedPath, 'utf-8'));
  if (typeof idx !== 'number' || idx < 0 || idx >= data.length) {
    return NextResponse.json({ error: 'Índice inválido' }, { status: 400 });
  }
  data.splice(idx, 1);
  fs.writeFileSync(leedPath, JSON.stringify(data, null, 2));
  return NextResponse.json({ success: true });
}
