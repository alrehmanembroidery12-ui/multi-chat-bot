import { NextResponse } from 'next/server';
import { deleteDocument } from '@/lib/db';

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing document ID' }, { status: 400 });
    }
    
    deleteDocument(id);
    return NextResponse.json({ success: true, message: 'Document and its chunks deleted successfully' });
  } catch (error) {
    console.error('Documents DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
