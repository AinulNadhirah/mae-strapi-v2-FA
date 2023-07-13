import {
    MMKV,
    useMMKVString,
    useMMKVNumber,
    useMMKVBoolean,
    useMMKVBuffer,
    useMMKVListener,
} from "react-native-mmkv";

const storage = new MMKV();
//  const storage = new MMKV({
//     id: `user-${userId}-storage`,
//     path: `${USER_DIRECTORY}/storage`,
//     encryptionKey: 'hunter2',
//     fastWrites: true
//   })

const getItem = (key) => {
    return storage.getString(key);
};

const setItem = (key, value) => {
    storage.set(key, value);
};

const clearAll = () => {
    storage.clearAll();
};

const removeItem = (key) => {
    storage.contains(key) && storage.delete(key);
};

const resetStorage = (key, value) => {
    const storageValue = storage.contains(key) && storage.getString(key);

    if (storageValue && storageValue === value) return false;
    storage.clearAll();
    storage.set(key, value);
    return true;
};

export default {
    storage,
    useMMKVString,
    useMMKVNumber,
    useMMKVBoolean,
    useMMKVBuffer,
    useMMKVListener,
    getItem,
    setItem,
    removeItem,
    resetStorage,
    clearAll,
};
