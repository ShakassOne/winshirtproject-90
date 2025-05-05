
import { ExtendedProduct } from '@/types/product';

export interface ProductColumn {
  accessorKey?: keyof ExtendedProduct;
  header: string;
  id?: string;
  cell?: ({ row }: { row: any }) => React.ReactNode;
}
