import AsyncStorage from "@react-native-community/async-storage";

const KEY = "introductionScreen";
export const setIsIntroductionHasShow = (value, callback) => {
    AsyncStorage.setItem(KEY, JSON.stringify(value)).then(() => {
        callback && callback();
    });
};

export const getIsIntroductionHasShow = async () => {
    return JSON.parse(await AsyncStorage.getItem(KEY));
};
