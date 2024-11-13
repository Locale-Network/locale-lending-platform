import client from "@/utils/plaid";
import { NextRequest, NextResponse } from "next/server";
import { CountryCode, Products } from "plaid";

export async function POST(req: NextRequest) {
  const body = await req.json();
  
  const userObject = {client_user_id: body.account};

  try {
    const tokenResponse = await client.linkTokenCreate({
      user: userObject,
      products: [Products.IdentityVerification],
      identity_verification: {
        template_id: process.env.TEMPLATE_ID || "",
      },
      client_name: "Locale Lending Platform",
      language: "en",
      country_codes: [CountryCode.Us],
    });

    return NextResponse.json(tokenResponse.data, {status: 200});
  } catch (err) {
    console.error("Error generating link token:", err);
    return NextResponse.json(
      JSON.stringify({error: "Token generation failed"}),
      {
        status: 500,
      }
    );
  }
}