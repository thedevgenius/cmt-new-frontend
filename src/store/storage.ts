import createWebStorage from "redux-persist/lib/storage/createWebStorage";

const createNoopStorage = () => {
    return {
        getItem(_key: string) {
            return Promise.resolve(null);
        },
        setItem(_key: string, value: any) {
            return Promise.resolve(value);
        },
        removeItem(_key: string) {
            return Promise.resolve();
        },
    };
};

// If window is undefined (SSR), use noop storage. Otherwise, use local storage.
const storage = typeof window !== "undefined" ? createWebStorage("local") : createNoopStorage();

export default storage;