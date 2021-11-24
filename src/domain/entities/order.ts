import { Cart } from './cart';

export type Order = {
  user: string;
  cart: Cart;
  created: Date;
  status: OrderStatus;
  total: number;
};

export enum OrderStatus {
  'new' = 'new',
  'delivery' = 'delivery',
  'completed' = 'completed',
}
