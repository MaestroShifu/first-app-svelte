import { Photo } from '../entities/photo';

export interface PhotoContract {
  getAll: () => Promise<Array<Photo>>;
}
