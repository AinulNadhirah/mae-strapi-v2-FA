import { StyleSheet, Dimensions, Platform } from "react-native";
export const { width, height } = Dimensions.get("window");
import * as mainStyles from "@styles/main";

export default StyleSheet.create({
    callCards: {
        marginLeft: (width * 50) / 375,
    },
    spaceBetweenCards: {
        height: (height * 10) / 667,
    },
    cardEndSpace: {
        height: (height * 19) / 667,
    },
    cardFinalSpace: {
        height: (height * 90) / 667,
    },
    greyLine: {
        height: (height * 1) / 667,
        marginLeft: (width * 50) / 375,
        width: (width * 275) / 375,
        backgroundColor: "#cccccc",
    },
    availChallenges: {
        height: (height * 67) / 667,
        marginLeft: (width * 15) / 375,
        width: (width * 276) / 375,
    },
    loading: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        // opacity: 0.5,
        backgroundColor: "transparent",
        justifyContent: "center",
        alignItems: "center",
    },
});
