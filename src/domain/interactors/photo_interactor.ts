import { PhotoContract } from '../contracts/photo_contract';

interface Contracts {
  photoContract: PhotoContract;
}

export const photoInteractors = (contracts: Contracts) => {
  const { photoContract } = contracts;

  const getAll = () => {
    return photoContract.getAll();
  };

  return {
    getAll,
  };
};
