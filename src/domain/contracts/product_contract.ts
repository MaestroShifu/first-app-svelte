import { Product } from '../entities/product';

export interface ProductContract {
  create: (args: Product) => void;
  findById: (id: string) => Product | undefined;
}
