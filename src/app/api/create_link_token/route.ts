import client, {
  PLAID_ANDROID_PACKAGE_NAME,
  PLAID_COUNTRY_CODES,
  PLAID_PRODUCTS,
  PLAID_REDIRECT_URI,
} from '@/utils/plaid';
import moment from 'moment';
import { NextRequest, NextResponse } from 'next/server';
import { CountryCode, LinkTokenCreateRequest, Products } from 'plaid';

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const products: Products[] = PLAID_PRODUCTS.map(product => product as Products);
    const countryCodes: CountryCode[] = PLAID_COUNTRY_CODES.map(
      countryCode => countryCode as CountryCode
    );
    const configs: LinkTokenCreateRequest = {
      user: { client_user_id: 'user-id' },
      client_name: 'Plaid Quickstart',
      products,
      country_codes: countryCodes,
      language: 'en',
    };

    if (PLAID_REDIRECT_URI !== '') {
      configs.redirect_uri = PLAID_REDIRECT_URI;
    }

    if (PLAID_ANDROID_PACKAGE_NAME !== '') {
      configs.android_package_name = PLAID_ANDROID_PACKAGE_NAME;
    }

    if (PLAID_PRODUCTS.includes('statements')) {
      const statementConfig = {
        end_date: moment().format('YYYY-MM-DD'),
        start_date: moment().subtract(30, 'days').format('YYYY-MM-DD'),
      };
      configs.statements = statementConfig;
    }

    const createTokenResponse = await client.linkTokenCreate(configs);
    if (createTokenResponse.status !== 200) {
      return NextResponse.json(
        {
          error: 'Failed to create link token',
        },
        { status: 400 }
      );
    }
    console.log('>>>> createTokenResponse : ', createTokenResponse.data);
    // return NextResponse.json(createTokenResponse.data, { status: 200 });
    return NextResponse.json(createTokenResponse.data, { status: 200 });
  } catch (error: any) {
    console.log('error : ', error);
    return NextResponse.json(
      {
        error: error?.response,
      },
      { status: error?.response?.status }
    );
  }
}
