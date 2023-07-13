import { Platform } from "react-native";
import Config from "react-native-config";

export const isHuawei = async () => {
    try {
        if (Platform.OS === "android") {
            const HMSAvailability = require("@hmscore/react-native-hms-availability").default;
            const result = await HMSAvailability.isHuaweiMobileServicesAvailable();
            return result === 0;
        } else {
            return false;
        }
    } catch (error) {
        console.log("HMS Mobile service might not be available" + error);
        return false;
    }
};

export const isPureHuawei = Config?.PURE_HUAWEI === "true";
