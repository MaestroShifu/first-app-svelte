import { HTTPClient } from '../lib/axios';
import { Photo } from '../domain/entities/photo';

const HOST_PHOTOS = 'https://jsonplaceholder.typicode.com/';

const httClient = new HTTPClient(HOST_PHOTOS);

export const getAllPhotos = () => {
  return httClient.get<Array<Photo>>('/photos');
};
