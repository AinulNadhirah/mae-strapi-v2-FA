import { StyleSheet, Dimensions, Platform } from "react-native";
export const { width, height } = Dimensions.get("window");
import * as mainStyles from "@styles/main";

export default StyleSheet.create({
    tabContainer: {
        marginTop: (height * 5) / 667,
        elevation: 0,
    },
    indicator: {
        backgroundColor: mainStyles.blueBackgroundColor,
        width: "33%",
        height: 0,
    },
    //whole tab bar:
    tabbar: {
        // marginLeft: width*60/375, //add when all tabs added
        height: (height * 40) / 667,
        backgroundColor: mainStyles.blueBackgroundColor,
        elevation: 0,
    },
    //individual tab:
    tabFirst: {
        height: (height * 40) / 667,
        backgroundColor: mainStyles.blueBackgroundColor,
        marginLeft: (width * 20) / 375,
    },
    tab: {
        height: (height * 40) / 667,
        // backgroundColor:'red',
        backgroundColor: mainStyles.blueBackgroundColor,
        paddingLeft: (width * 1) / 375,
        // marginLeft:width*10/375,
        // paddingRight:width*0/375,
        width: (width * 140) / 375, // revert to this later when all tabs are added,
        alignItems: "flex-end", // revert to this later when all tabs are added,
        // width:width, // remove this when all tabs are added.
        alignItems: "center",
    },
    labelActive: {
        color: "#000000",
        // fontWeight: "800",
        fontFamily: "Montserrat-Bold",
        fontSize: 13,
        lineHeight: 23,
        letterSpacing: 0,
    },
    labelInactive: {
        color: "rgba(0,0,0,0.3)",
        // fontWeight: "800",
        fontFamily: "Montserrat-Bold",
        fontSize: 13,
        lineHeight: 23,
        letterSpacing: 0,
    },
    label: {
        color: "#000000",
        // fontWeight: "800",
        fontFamily: "Montserrat-Bold",
        fontSize: 13,
        lineHeight: 23,
        letterSpacing: 0,
        height: "100%",
    },
    partnersCardsEndView: {
        height: (40 * height) / 667,
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
