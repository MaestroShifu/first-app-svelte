import { Product } from '../domain/entities/product';
import { ProductContract } from '../domain/contracts/product_contract';
import { getGlobalStore, updateGlobalStore } from '../services/store/store';

export class ProductApplication implements ProductContract {
  create(args: Product) {
    const { products } = getGlobalStore();
    products.push(args);
    updateGlobalStore({
      products,
    });
  }

  findById(id: string) {
    const { products } = getGlobalStore();
    return products.find((product) => product.id === id);
  }
}
