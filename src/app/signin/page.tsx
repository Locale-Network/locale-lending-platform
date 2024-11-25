import WelcomeCard from './welcome-card';

interface Props {
  searchParams: {
    callbackUrl: string;
  };
}

export default function Page({ searchParams: { callbackUrl } }: Props) {
  console.log(callbackUrl);
  return (
    <main className="flex h-screen items-center justify-center">
      <WelcomeCard callbackUrl={decodeURIComponent(callbackUrl)} />
    </main>
  );
}
