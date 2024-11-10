import WalletConnectButton from '@/components/wallet-connect-button';

export default function BorrowerHeader() {
  return (
    <header className="flex-1 border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center"></div>

        <div className="flex items-center space-x-4">
          <WalletConnectButton/>
        </div>
      </div>
    </header>
  );
}
