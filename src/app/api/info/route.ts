import { NextRequest, NextResponse } from 'next/server';
import { Products } from 'plaid';

let ITEM_ID: string | null = null;

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request?.url);
    const access_token = url.searchParams.get('access_token');

    if (!access_token) {
      return NextResponse.json({ error: 'Access token is required' }, { status: 400 });
    }

    return NextResponse.json(
      {
        item_id: ITEM_ID,
        access_token: '',
        products: [Products.Transactions],
      },
      { status: 200 }
    );
  } catch (error) {
    console.log('access_token error : ', error);
    return NextResponse.json({
      status: 500,
    });
  }
}
