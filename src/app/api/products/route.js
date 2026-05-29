import { NextResponse } from 'next/server';
import { getProducts, saveProduct, deleteProduct } from '@/lib/db';

// GET /api/products?chatbotId=xxx
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const chatbotId = searchParams.get('chatbotId');
    
    if (!chatbotId) {
      return NextResponse.json({ error: 'Missing chatbotId' }, { status: 400 });
    }
    
    const products = getProducts(chatbotId);
    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/products — Create or update a product
export async function POST(request) {
  try {
    const body = await request.json();
    const { chatbotId, id, name, price, category, description, variants, inStock } = body;
    
    if (!chatbotId || !name || price === undefined) {
      return NextResponse.json({ error: 'Missing required fields: chatbotId, name, price' }, { status: 400 });
    }
    
    const product = saveProduct({
      id: id || 'prod_' + Math.random().toString(36).substring(2, 15),
      chatbotId,
      name,
      price: Number(price),
      category: category || '',
      description: description || '',
      variants: variants || '',
      inStock: inStock !== false,
    });
    
    return NextResponse.json({ success: true, product });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/products?id=xxx
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing product id' }, { status: 400 });
    }
    
    deleteProduct(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
