import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function KycRedirectDialog({ isOpen }: { isOpen: boolean }) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Retry Identity Verification</DialogTitle>
          <DialogDescription className='pt-4'>
            You will be redirected to identity verification in 3 seconds.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
