import { StyleSheet } from "react-native";

import { BLACK, ROYAL_BLUE } from "@constants/colors";

const Styles = {
    container: {
        flex: 1,
        alignItems: "flex-start",
        paddingEnd: 35,
        paddingStart: 35,
    },
    bottomView: {
        flexDirection: "column",
        marginTop: 24,
        marginHorizontal: 24,
    },
    accountsFlatlist: {
        overflow: "visible",
    },
    formBodyContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 26,
        width: "100%",
    },
    transferFromContainer: { paddingBottom: 24 },
    headerContainer: {
        width: "100%",
    },
    headerImageContainer: {
        marginBottom: 12,
    },
    lblSubTitle: { marginTop: 4, marginBottom: 16 },
    lblForeignCurrency: { marginBottom: 12 },
    lblDeclarationTitle: { marginTop: 16 },
    lblLink2: { marginLeft: 16, textDecorationLine: "underline" },
    linksContainer: {
        flexDirection: "row",
        marginTop: 8,
    },
    rowListContainer: {
        flex: 1,
        flexDirection: "row",
        marginTop: 20,
    },
    rowListItemLeftContainer: {
        flex: 0.5,
    },
    rowListItemRightContainer: {
        flex: 0.5,
        alignItems: "flex-end",
        alignContent: "flex-end",
    },
    commonInputConfirmIosText: {
        color: ROYAL_BLUE,
        fontFamily: "montserrat",
        fontSize: 23,
        fontStyle: "normal",
        marginTop: 0,
        minWidth: 70,
        fontWeight: "bold",
    },
    commonInputConfirmText: {
        color: ROYAL_BLUE,
        fontFamily: "montserrat",
        fontSize: 23,
        fontStyle: "normal",
        marginTop: -13,
        minWidth: 70,
        fontWeight: "bold",
    },
    commonInputConfirm: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 23,
        marginTop: -13,
        minWidth: 70,
        fontWeight: "bold",
    },
    commonInputConfirmIos: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 23,
        marginTop: 0,
        minWidth: 70,
        fontWeight: "bold",
    },
    line: {
        width: "100%",
        marginTop: 24,
        marginBottom: 24,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#cccccc",
        marginHorizontal: 36,
    },
};

export default StyleSheet.create(Styles);
