import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'db', 'datas_ocupadas.json');

export async function GET() {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await fs.readFile(dbPath, 'utf-8');
    const eventos = JSON.parse(data);
    eventos.push(body);
    await fs.writeFile(dbPath, JSON.stringify(eventos, null, 2));
    return NextResponse.json({ success: true });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
