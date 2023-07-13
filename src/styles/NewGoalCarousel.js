import { StyleSheet } from "react-native";
import { itemWidth, entryBorderRadius } from "@styles/main";

export default StyleSheet.create({
    goalSlide: {
        height: 160,
        width: itemWidth,
        left: 1,
        right: 1,
        flexDirection: "row",
        backgroundColor: "#fff",
        borderTopLeftRadius: entryBorderRadius,
        borderTopRightRadius: entryBorderRadius,
        borderBottomLeftRadius: entryBorderRadius,
        borderBottomRightRadius: entryBorderRadius,
    },
    goalSlideImg: {
        flex: 0.8,
        alignItems: "center",
        justifyContent: "center",
    },

    imgWalking: {
        height: "70%",
        width: "70%",
    },
    goalSlideText: {
        flex: 1.2,
        alignItems: "center",
        justifyContent: "center",
    },
    goalSlideDecText: {
        color: "#58595b",
        fontSize: 18,
        fontWeight: "normal",
        textAlign: "justify",
        lineHeight: 30,
    },
});
