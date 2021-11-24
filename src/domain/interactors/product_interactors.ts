import { Product } from '../entities/product';
import { ProductContract } from '../contracts/product_contract';

interface Contracts {
  productContract: ProductContract;
}

export type ProductCreate = Omit<Product, 'id'>;

export const productInteractors = (contracts: Contracts) => {
  const { productContract } = contracts;

  const create = (args: ProductCreate) => {
    const product: Product = {
      ...args,
      id: new Date().getTime().toString(),
    };
    return productContract.create(product);
  };

  const findById = (id: string) => {
    return productContract.findById(id);
  };

  return {
    create,
    findById,
  };
};
