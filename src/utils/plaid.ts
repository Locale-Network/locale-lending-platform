// utils/plaid.js

import { Configuration, PlaidApi, PlaidEnvironments, Products } from 'plaid';

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';

const configuration = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
      'Plaid-Version': '2020-09-14',
    },
  },
});

const client = new PlaidApi(configuration);

export default client;

export const PLAID_PRODUCTS = (process.env.PLAID_PRODUCTS || Products.Transactions).split(',');
export const PLAID_COUNTRY_CODES = (process.env.PLAID_COUNTRY_CODES || 'US').split(',');
export const PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI || '';
export const PLAID_ANDROID_PACKAGE_NAME = process.env.PLAID_ANDROID_PACKAGE_NAME || '';

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const formatError = (error: any) => {
  return {
    error: {
      status_code: error?.status,
      request_id: error?.request_id,
      error_code: error?.error_code,
      error_message: error?.error_message,
      display_message: error?.display_message,
    },
  };
};
