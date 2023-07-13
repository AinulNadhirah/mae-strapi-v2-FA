import React from "react";
import { View, Image } from "react-native";

import Typo from "@components/Text";

const AccountDetailsBase64View = ({ data, image, bankName }) => (
    <View>
        <View style={[Styles.newTransferView]}>
            <View style={Styles.newTransferViewInner1}>
                <View style={Styles.circleImageView}>
                    <Image
                        style={Styles.newTransferCircle}
                        source={{
                            uri: `data:image/gif;base64,${image}`,
                        }}
                        resizeMode="stretch"
                        resizeMethod="scale"
                    />
                </View>
            </View>
            <View style={Styles.newTransferViewInnerHalf}>
                <Typo
                    fontSize={14}
                    fontWeight="600"
                    fontStyle="normal"
                    letterSpacing={0}
                    lineHeight={18}
                    color="#000000"
                    textAlign="left"
                    text={data.bankName}
                />
            </View>
        </View>
    </View>
);
const Styles = {
    line: {
        width: "100%",
        height: 1,
        backgroundColor: "#cfcfcf",
        borderStyle: "solid",
    },
    newTransferView: {
        width: "100%",
        height: 80,
        minWidth: "90%",
        marginBottom: 12,
        marginTop: 16,
        flexDirection: "row",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    newTransferLastView: {
        width: "100%",
        height: 80,
        minWidth: "90%",
        marginBottom: 60,
        marginTop: 16,
        flexDirection: "row",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },

    newTransferViewInner1: {
        flex: 1.4,
        borderTopLeftRadius: 50,
        borderBottomLeftRadius: 50,
        flexDirection: "column",
    },
    newTransferViewInner2: {
        flex: 3.5,
        justifyContent: "center",
        flexDirection: "column",
    },
    newTransferViewInner22: {
        flex: 2.2,
        justifyContent: "center",
        flexDirection: "column",
    },
    newTransferViewInner44: {
        flex: 5,
        justifyContent: "center",
        flexDirection: "column",
    },
    newTransferViewInnerHalf: {
        flex: 4,
        marginLeft: 0,
        // backgroundColor: "green",
        justifyContent: "center",
        flexDirection: "column",
    },
};
export default AccountDetailsBase64View;
