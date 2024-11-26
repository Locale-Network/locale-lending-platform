'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function AddressInput() {
  const router = useRouter();
  const [address, setAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitted address:', address);
    router.push(`/data/loan/credit-score?accountAddress=${address}`);
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Enter Account Address</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Enter your account address"
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
            <Button type="submit" className="w-full">
              Use Account
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
