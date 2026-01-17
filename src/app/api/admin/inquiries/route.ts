
import { NextRequest, NextResponse } from 'next/server';
import { getInquiries } from '@/lib/storage';

export async function GET(req: NextRequest) {
  try {
    const inquiries = getInquiries();
    return NextResponse.json(inquiries);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
  }
}
