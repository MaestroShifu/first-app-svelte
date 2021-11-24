import { Ingredient } from './ingredient';

export interface User {
  id: string;
  name: string;
  email: string;
  preferences: Ingredient[];
  allergies: Ingredient[];
}
