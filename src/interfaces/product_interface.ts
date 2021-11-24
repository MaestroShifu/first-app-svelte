import {
  productInteractors,
  ProductCreate,
} from '../domain/interactors/product_interactors';
import { ProductApplication } from '../applications/product_application';

const { create, findById } = productInteractors({
  productContract: new ProductApplication(),
});

export const createProduct = (args: ProductCreate) => {
  create(args);
};

export const getByIdProduct = (id: string) => {
  return findById(id);
};
