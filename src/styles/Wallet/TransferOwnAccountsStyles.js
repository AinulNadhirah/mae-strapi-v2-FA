import { StyleSheet } from "react-native";
import { Platform } from "react-native";

import { getShadow } from "@utils/dataModel/utility";

export default StyleSheet.create({
    circleImageNewView: {
        alignContent: "center",
        alignItems: "center",
        borderRadius: 605 / 2,
        flexDirection: "row",
        height: 60,

        justifyContent: "center",
        marginLeft: 7,
        marginTop: 8,
        width: 60,
    },
    circleImageView: {
        alignContent: "center",
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderColor: "#ffffff",
        borderRadius: 65 / 2,
        borderWidth: 2,
        elevation: 4,
        flexDirection: "row",
        height: 65,
        justifyContent: "center",
        marginLeft: 7,
        marginTop: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        width: 65,
    },
    emptyTextRow: {
        borderRadius: 10,
        height: 10,
        marginBottom: 7,
        width: "100%",
    },
    itemInner2View: {
        flexDirection: "column",
        height: "100%",
        justifyContent: "flex-start",
        width: "100%",
    },
    itemInnerView: {
        flexDirection: "row",
        height: "100%",
        justifyContent: "flex-start",
        width: "100%",
    },

    line: {
        backgroundColor: "#cfcfcf",
        borderStyle: "solid",
        height: 1,
        marginTop: 10,
        width: "100%",
    },

    newTransferCircle: {
        alignContent: "center",
        alignItems: "center",
        borderRadius: 60 / 2,
        flexDirection: "row",
        height: 60,

        justifyContent: "center",
        marginLeft: 0,
        marginTop: 0,
        width: 60,
    },
    newTransferLastView: {
        alignContent: "center",
        alignItems: "center",
        flexDirection: "row",
        height: 80,
        justifyContent: "center",
        marginBottom: 60,
        marginTop: 16,
        minWidth: "90%",
        width: "100%",
        ...getShadow({
            // color: "#000000",
            // height: 4, // IOS
            // width: 1, // IOS
            // shadowOpacity: 0.08, // IOS
            // shadowRadius: 2, // IOS
            elevation: 4, // android
        }),
        // shadowColor: "#000",
        // shadowOffset: {
        //     width: 0,
        //     height: 1,
        // },
        // shadowOpacity: 0.22,
        // shadowRadius: 2.22,
        // elevation: 3,
    },
    newTransferView: {
        alignContent: "center",
        alignItems: "center",
        flexDirection: "row",
        height: 80,
        justifyContent: "center",
        marginBottom: 12,
        marginTop: 16,
        minWidth: "90%",
        width: "100%",
        ...getShadow({
            // color: "#000000",
            // height: 4, // IOS
            // width: 1, // IOS
            // shadowOpacity: 0.08, // IOS
            // shadowRadius: 2, // IOS
            elevation: 4, // android
        }),
        // shadowColor: "#000",
        // shadowOffset: {
        //     width: 0,
        //     height: 1,
        // },
        // shadowOpacity: 0.22,
        // shadowRadius: 2.22,
        // elevation: 3,
    },
    newTransferViewInner1: {
        flexDirection: "column",
    },
    newTransferViewInnerHalf: {
        flexDirection: "column",
        flexGrow: 1,
        flex: 1,
        justifyContent: "center",
        marginLeft: 15,
    },
});
