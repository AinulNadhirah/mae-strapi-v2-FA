import { StyleSheet } from "react-native";
import { Platform } from "react-native";

export default StyleSheet.create({
    containerFooter: {
        alignItems: "center",
        flexDirection: "row",
        height: 72,
        justifyContent: "space-between",
        marginHorizontal: 24,
    },
    contentTab: {
        flex: 1,
        flexDirection: "column",
        width: "100%",
        height: "100%",
    },
    emptyStateImage: {
        bottom: 0,
        height: 180,
        position: "absolute",
        width: "100%",
    },
    emptyStateImageStyle: {
        resizeMode: "contain",
        alignSelf: "flex-end",
    },
    emptyText2View: {
        marginTop: 2,
    },
    emptyTextView: {
        marginTop: 17,
    },
    emptyOwnTextView: {
        marginTop: 52,
    },
    emptyStateImageOwn: {
        marginBottom: -10,
        bottom: 0,
        height: 280,
        position: "absolute",
        width: "100%",
    },
    emptyText2ViewOwn: {
        marginTop: 8,
        marginLeft: 36,
        marginRight: 36,
    },
    favouriteLabelBlack: {
        color: "#000",
        fontFamily: "montserrat",
        fontSize: 17,
        fontStyle: "normal",
        fontWeight: "bold",
    },
    favouriteListView: {
        marginRight: 24,
        marginTop: 15,
    },
    ownListView: {
        marginRight: 0,
        marginTop: 15,
    },
    favouriteTextView: {
        marginTop: 38,
    },
    favouriteView: {
        marginTop: 16,
    },
    flex: {
        flex: 1,
    },
    flexEnd: {
        flex: 1,
        justifyContent: "flex-end",
    },
    innerFlex: {
        flex: 1,
        marginLeft: 24,
    },
    innerFlexBoth: {
        flex: 1,
        marginLeft: 24,
        marginRight: 24,
    },
    newTransferViewFirst: {
        flexDirection: "row",
        marginTop: 16,
    },
    wrapperBlue: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
});
