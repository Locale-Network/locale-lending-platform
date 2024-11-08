"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConnectButton } from "@rainbow-me/rainbowkit";


export default function CardWithForm() {
  return (
    <Card className="w-[350px]">
      <CardHeader className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
          <Image
            src="https://images.squarespace-cdn.com/content/v1/66c4ab9d1cc12e32b4138e7e/f4e716cf-7a6e-44c5-a8cd-24b47dec43a1/favicon.ico?format=100w"
            alt="Project icon"
            width={96}
            height={96}
            className="object-cover"
          />
        </div>
        <CardTitle className="text-center">Locale Network</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center text-sm text-muted-foreground">
          Locale is a Layer-3 Rollup Network designed for Empowering Communities
          through DeFi & Smart City Services
        </p>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-4">
        <ConnectButton label="Sign in with Ethereum" />

        <div className="text-xs text-muted-foreground">
          <Link href="/terms" className="hover:underline">
            Terms and Conditions
          </Link>
          {" • "}
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
