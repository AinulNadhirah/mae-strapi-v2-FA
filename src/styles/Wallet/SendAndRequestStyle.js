import { StyleSheet } from "react-native";

import { BLACK } from "@constants/colors";

export default StyleSheet.create({
    containerFooter: {
        alignItems: "center",
        flexDirection: "row",
        height: 72,
        justifyContent: "space-between",
        marginHorizontal: 24,
    },
    emptyText2View: {
        marginTop: 8,
    },
    emptyTextView: {
        marginRight: 20,
        marginTop: "10%",
    },
    favouriteLabelBlack: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 17,
        fontStyle: "normal",
        fontWeight: "bold",
    },
    favouriteListView: {
        marginTop: 16,
    },
    favouriteView: {
        marginTop: 32,
    },
    favouriteView1: {
        marginHorizontal: 24,
        marginTop: 16,
    },
    favouriteView2: {
        // marginHorizontal: 24,
        marginTop: 32,
    },
    flex: {
        flex: 1,
    },
    idLikeView: {
        marginTop: 20,
    },
    innerFlex: {
        flex: 1,
        marginLeft: 24,
    },
    leftMargin: { marginLeft: 25 },
    newTransferViewFirst: {
        flexDirection: "row",
        marginTop: 16,
        paddingBottom: 10,
    },
    noTrxBgImage: {
        bottom: 0,
        height: 180,
        position: "absolute",
        width: "100%",
    },
    noTrxBgImageStyle: {
        alignSelf: "flex-end",
        resizeMode: "contain",
    },
    row: {
        flexDirection: "row",
        marginHorizontal: 22,
        marginTop: 16,
    },
    searchContainer: {
        marginLeft: 10,
        marginRight: 20,
        paddingTop: 16,
    },
    searchContainer2: {
        marginLeft: 10,
        marginRight: 20,
        paddingBottom: 10,
        paddingTop: 5,
    },
    viewAll: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        marginRight: 25,
    },
});
