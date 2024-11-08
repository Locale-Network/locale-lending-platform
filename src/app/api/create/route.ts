import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const result = await sql`CREATE TABLE proofs (
        id SERIAL PRIMARY KEY,
        account_id VARCHAR(255) NULL,
        name VARCHAR(255) NULL,
        official_name VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    );`;

    //   const result = await sql`CREATE TABLE transactions (
    //     id SERIAL PRIMARY KEY,
    //     account_id VARCHAR(255) NULL,
    //     amount FLOAT,
    //     currency VARCHAR(255),
    //     date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    //     merchant VARCHAR(255),
    //     merchant_id VARCHAR(255),
    //     transaction_id VARCHAR(255),
    //     is_deleted BOOLEAN DEFAULT FALSE
    // );`;

    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
