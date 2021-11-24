import { Ingredient } from './ingredient';

export interface Product {
  id: string;
  title: string;
  price: number;
  topping: Ingredient;
}
