'use client';

import { CreditScore } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface Props {
  creditScore: CreditScore | null;
}

export default function CreditScoreInformation({ creditScore }: Props) {
  if (!creditScore) {
    return (
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Credit Score</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-muted-foreground">
            No credit score information available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Credit Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col items-center">
            <p className="font-semibold">Equifax</p>
            <span className="text-4xl font-bold">{creditScore.creditScoreEquifax}</span>
          </div>

          <Separator orientation="vertical" />
         
          <div className="flex flex-col items-center">
            <p className="font-semibold">TransUnion</p>
            <span className="text-4xl font-bold">{creditScore.creditScoreTransUnion}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
