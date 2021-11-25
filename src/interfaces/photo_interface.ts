import { photoInteractors } from '../domain/interactors/photo_interactor';
import { PhotoApplication } from '../applications/photo_application';

const { getAll } = photoInteractors({
  photoContract: new PhotoApplication(),
});

export const getAllPhotos = () => {
  return getAll();
};
