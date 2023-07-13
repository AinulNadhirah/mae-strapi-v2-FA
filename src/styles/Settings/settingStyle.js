/* eslint-disable react-native/no-color-literals */
import { StyleSheet } from "react-native";
import { Dimensions } from "react-native";
export const { width, height } = Dimensions.get("window");
import { getStatusBarMargin } from "@utils/ui";
const statusBarMargin = getStatusBarMargin();

export default StyleSheet.create({
    buttonView: {
        flexDirection: "row",
        height: 83,
        width: "100%",
        //  backgroundColor:'red'
    },

    detailHeaderView: {
        backgroundColor: "white",
        borderBottomColor: "gray",
        borderBottomWidth: 0.5,
        flexDirection: "row",
        height: 83,
        width: width,
    },
    detailHeadertextView: {
        flexDirection: "column",
        height: 83,
        width: "70%",
        // backgroundColor:'blue'
    },
    detailHeadertitleText: {
        color: "#000000",
        fontFamily: "montserrat",
        fontSize: 15,
        fontStyle: "normal",
        fontWeight: "600",
        height: 83,
        letterSpacing: 0,
        lineHeight: 23,
        marginLeft: "14%",
        marginTop: 30,
    },

    detailText: {
        color: "#000000",
        fontFamily: "montserrat",
        fontSize: 11,
        fontStyle: "normal",
        fontWeight: "normal",
        letterSpacing: 0,
        lineHeight: 17,
        marginLeft: "14%",
        marginTop: "3%",
        //  flexDirection: "row",
    },
    headerBar: {
        alignItems: "center",
        backgroundColor: "#ffde00",
        height: 90 + statusBarMargin,
        justifyContent: "center",
        paddingTop: 10 + statusBarMargin,
        width: "100%",
    },
    headerView: {
        backgroundColor: "#f8f5f3",
        borderBottomColor: "gray",
        borderBottomWidth: 1,
        flexDirection: "row",
        height: 83,
        width: width,
    },

    imageStyle: {
        height: 13,
        marginLeft: "5%",
        marginTop: 30,
        width: 13,
    },
    imageView: {
        marginTop: "5%",
        flexDirection: "column",
        //backgroundColor:'yellow',
        width: "30%",
        height: 90,
    },
    mainContainer: {
        alignItems: "flex-start",
        backgroundColor: "white",
        flex: 1,
        justifyContent: "flex-start",
        // paddingTop: Platform.OS === "ios" ? 20 : 0
    },

    rowimageView: {
        flexDirection: "column",
        height: 90,
        marginLeft: "2%",
        marginTop: 0,
        width: "30%",
    },

    switchContainer: {
        backgroundColor: "#cccccc",
        borderRadius: 20,
        height: 25,
        marginTop: 1,
        padding: 1,
        width: 45,
    },
    switchStyle: {
        //	height: 13,
        //	marginLeft: "5%",
        marginTop: "25%",
        //width: 13
    },
    switchcircleStyle: {
        backgroundColor: "#ffffff",
        borderRadius: 13,
        height: 23,
        width: 23,
    },
    textView: {
        flexDirection: "column",
        height: 83,
        width: "70%",
        //backgroundColor:'red'
    },
    titleText: {
        color: "#000000",
        fontFamily: "montserrat",
        fontSize: 17,
        fontStyle: "normal",
        fontWeight: "600",
        letterSpacing: 0,
        lineHeight: 23,
        marginLeft: "14%",
        marginTop: 19,
    },
});
