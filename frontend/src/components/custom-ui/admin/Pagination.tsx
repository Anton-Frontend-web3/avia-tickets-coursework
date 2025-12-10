'use client'

import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ totalPages }: { totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  
  const currentPage = Number(searchParams.get('page')) || 1;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-end gap-4 mt-4">
       <span className="text-sm text-muted-foreground">
          Страница {currentPage} из {totalPages}
       </span>
       <div className="flex gap-2">
           <Button
             variant="outline"
             size="icon"
             disabled={currentPage <= 1}
             onClick={() => replace(createPageURL(currentPage - 1))}
           >
             <ChevronLeft className="h-4 w-4" />
           </Button>
           <Button
             variant="outline"
             size="icon"
             disabled={currentPage >= totalPages}
             onClick={() => replace(createPageURL(currentPage + 1))}
           >
             <ChevronRight className="h-4 w-4" />
           </Button>
       </div>
    </div>
  );
}