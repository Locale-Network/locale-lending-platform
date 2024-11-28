'use client';

import { CreditScore } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { normalizeCreditScore } from '@/utils/number';
import { creditScoreProgressColor } from '@/utils/colour';

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

  const scorePercentage = normalizeCreditScore(
    creditScore.scoreRangeMin,
    creditScore.scoreRangeMax,
    creditScore.score
  );

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Credit Score</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <span className="text-4xl font-bold">{creditScore.score}</span>
          <span className="ml-2 text-sm text-muted-foreground">({creditScore.scoreType})</span>
        </div>
        <Progress
          value={scorePercentage}
          className="h-3 w-full"
          indicatorClassName={creditScoreProgressColor(
            creditScore.scoreRangeMin,
            creditScore.scoreRangeMax,
            creditScore.score
          )}
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{creditScore.scoreRangeMin}</span>
          <span>{creditScore.scoreRangeMax}</span>
        </div>
        <div className="text-center text-sm">
          <p>
            Credit Bureau: <span className="font-semibold">{creditScore.creditBureau}</span>
          </p>
        </div>
        <div className="text-center text-xs text-muted-foreground">
          <p>
            Score range: {creditScore.scoreRangeMin} - {creditScore.scoreRangeMax}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
