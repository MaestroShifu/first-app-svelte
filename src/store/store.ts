import { writable } from 'svelte/store';

export interface ILatLng {
  latitude: number;
  longitude: number;
}

export type IMakers = ILatLng & { maker: google.maps.Marker };

export const pointMakers = writable<IMakers[]>([]);
export const latLng = writable<ILatLng | undefined>(undefined);
