import client, { formatError } from '@/utils/plaid';
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request?.url);
    const access_token = url.searchParams.get('access_token');

    if (!access_token) {
      return NextResponse.json({ error: 'Access token is required' }, { status: 400 });
    }
    const accountsResponse = await client.accountsGet({
      access_token,
    });

    const selectedAccount = accountsResponse.data.accounts[0];

    await prisma.account.create({
      data: {
        accountId: selectedAccount.account_id,
        name: selectedAccount.name,
        officialName: selectedAccount.official_name,
      },
    });

    return NextResponse.json(selectedAccount, { status: 200 });
  } catch (error: any) {
    const formattedError = formatError(error?.response);
    const status = formattedError?.error?.status_code || 500;
    return NextResponse.json(formattedError, { status });
  }
}
