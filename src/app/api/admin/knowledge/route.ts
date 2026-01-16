import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const knowledgePath = path.join(process.cwd(), 'data', 'knowledge.md');

// GET - Read knowledge base
export async function GET() {
  try {
    const content = fs.readFileSync(knowledgePath, 'utf-8');
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ content: '', error: 'Failed to read knowledge base' }, { status: 500 });
  }
}

// POST - Update knowledge base
export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();
    
    if (typeof content !== 'string') {
      return NextResponse.json({ error: 'Invalid content' }, { status: 400 });
    }
    
    fs.writeFileSync(knowledgePath, content, 'utf-8');
    return NextResponse.json({ success: true, message: 'Knowledge base updated' });
  } catch (error) {
    console.error('Failed to update knowledge base:', error);
    return NextResponse.json({ error: 'Failed to update knowledge base' }, { status: 500 });
  }
}
