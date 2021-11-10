import { writable } from 'svelte/store';

export interface ILatLng {
    latitude: number; 
    longitude: number;
}

export const latLng = writable<ILatLng | undefined>(undefined);