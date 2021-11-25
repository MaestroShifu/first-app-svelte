import { writable, get } from 'svelte/store';
import { Product } from '../../domain/entities/product';
import { Photo } from '../../domain/entities/photo';

interface GlobalStore {
  products: Array<Product>;
  photos: Array<Photo>;
}

const startStore: GlobalStore = {
  products: [],
  photos: [],
};

type SubscribeStoreFn = (state: GlobalStore) => void;

const globalStore = writable<GlobalStore>(startStore);

export const getGlobalStore = () => {
  return get(globalStore);
};

export const setGlobalStore = (args: GlobalStore) => {
  globalStore.set({ ...args });
};

export const updateGlobalStore = (args: Partial<GlobalStore>) => {
  globalStore.update((store: GlobalStore) => {
    return { ...store, ...args };
  });
};

export const subscribeGlobalStore = (fn: SubscribeStoreFn) => {
  const unSubscribe = globalStore.subscribe(fn);
  return {
    unSubscribe,
  };
};
