// Module augmentation: getReactNativePersistence exists in the Firebase RN bundle
// (firebase/auth resolves to the react-native build at runtime via Metro), but the
// default TypeScript exports for firebase/auth point to the browser typings which
// omit it. This declaration adds it back so tsc is satisfied.
export {};

declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: {
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
  }): Persistence;
}
