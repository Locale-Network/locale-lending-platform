import client from '@/utils/plaid';
import { NextRequest, NextResponse } from 'next/server';

let ITEM_ID = '';

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const { public_token } = await new Response(req.body).json();

    const tokenResponse = await client.itemPublicTokenExchange({
      public_token,
    });

    ITEM_ID = tokenResponse.data.item_id;

    return NextResponse.json(
      {
        access_token: tokenResponse.data.access_token,
        item_id: ITEM_ID,
        error: null,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.response?.data.error,
      },
      { status: error?.response?.status }
    );
  }
}
