import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";

import Typo from "@components/Text";

const GridButtons = ({ data, callback }) => {
    function callbackEvent(index) {
        callback(index);
    }
    return (
        <TouchableOpacity onPress={callbackEvent} style={Styles.actionItemFirst}>
            <View style={Styles.item}>
                <Image source={data.source} style={[Styles.actionItemImage]} resizeMode="contain" />
                <Typo
                    fontSize={12}
                    fontWeight="400"
                    fontStyle="normal"
                    letterSpacing={0}
                    lineHeight={18}
                    color="#000000"
                    textAlign="center"
                    text={data.title}
                />
            </View>
        </TouchableOpacity>
    );
};
const Styles = {
    item: {
        flex: 1,
        height: "100%",
        width: "100%",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        alignContent: "center",
    },
    actionItemFirst: {
        backgroundColor: "#ffffff",
        borderRadius: 8,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        alignContent: "center",
        height: 98,
        marginLeft: 0,
        marginRight: 9,
        width: 85,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    actionItemImage: {
        height: 32,
        marginLeft: 0,
        marginTop: 0,
        width: 32,
        marginBottom: 10,
    },

    actionItemTitle: {
        color: "#000000",
        fontSize: 12,
        fontWeight: "500",
        marginLeft: 0,
        marginTop: 8,
    },

    descView3: {
        flexDirection: "row",
        justifyContent: "flex-start",
    },
    flexGrid: {
        flex: 1,
    },
};
export default GridButtons;
