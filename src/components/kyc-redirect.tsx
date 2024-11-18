import Image from 'next/image';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface KycRedirectProps {
  shareableLink: string;
  onClose: () => void; // Function to trigger closing after 6 seconds
}

const KycRedirect = ({ shareableLink, onClose }: KycRedirectProps) => {
  useEffect(() => {
    if (shareableLink) {
      const timer = setTimeout(() => {
        onClose();
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [onClose, shareableLink]);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = shareableLink;
    }, 3000);

    return () => clearTimeout(timer);
  }, [shareableLink]);

  return (
    <Card className="w-[350px]">
      <CardHeader className="flex flex-col items-center">
        <div className="mb-4 h-24 w-24 overflow-hidden rounded-full">
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
          You will be redirected to Identity verification in 3 seconds.
        </p>

        <p className="text-center text-sm text-muted-foreground">
          Please come back after the identity verification is completed.
        </p>
      </CardContent>
    </Card>
  );
};

export default KycRedirect;
