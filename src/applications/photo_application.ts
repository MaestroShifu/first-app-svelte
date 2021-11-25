import { getAllPhotos } from '../services/photos_service';
import { PhotoContract } from '../domain/contracts/photo_contract';
import { updateGlobalStore } from '../services/store/store';

export class PhotoApplication implements PhotoContract {
  async getAll() {
    try {
      const photos = await getAllPhotos();
      updateGlobalStore({
        photos: photos,
      });
      return photos;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
