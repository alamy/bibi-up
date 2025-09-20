import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'db', 'datas_ocupadas.json');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      : [];
    data.push(body);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao salvar evento.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const data = fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      : [];
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao ler eventos.' }, { status: 500 });
  }
}
