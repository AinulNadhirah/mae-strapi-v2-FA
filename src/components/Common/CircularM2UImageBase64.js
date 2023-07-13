import React from "react";
import { View, Image } from "react-native";

const CircularM2UImageBase64 = ({ image }) => (
    <View style={Styles.circleImageView}>
        <Image
            style={Styles.newTransferCircle}
            source={image}
            resizeMode="stretch"
            resizeMethod="scale"
        />
    </View>
);

const Styles = {
    newTransferCircle: {
        width: 60,
        height: 60,
        borderRadius: 60 / 2,
        marginLeft: 0,
        marginTop: 0,

        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
    },

    circleImageView: {
        width: 65,
        height: 65,
        borderRadius: 65 / 2,
        marginLeft: 0,
        marginTop: 8,
        borderWidth: 2,
        borderColor: "#ffffff",
        backgroundColor: "#ffffff",
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
};
export default CircularM2UImageBase64;
