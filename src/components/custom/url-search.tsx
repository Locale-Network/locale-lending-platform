'use client';
import { useCallback } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { debounce } from 'lodash';

export default function Search() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Create the debounced version of handleSearch
  const debouncedSearch = useCallback(
    (t: string) => {
      const d = debounce((term: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', '1');
        if (term) {
          params.set('query', term);
        } else {
          params.delete('query');
        }
        replace(`${pathname}?${params.toString()}`);
      }, 300);

      d(t);
    },
    [searchParams, pathname, replace]
  );

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    debouncedSearch(event.target.value);
  }

  return (
    <Input
      placeholder="Search"
      onChange={handleChange}
      className="max-w-sm"
      defaultValue={searchParams.get('query')?.toString()}
    />
  );
}
