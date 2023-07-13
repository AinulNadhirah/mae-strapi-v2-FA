import React from "react";
import { TouchableOpacity, View, Image } from "react-native";

const DownLeftButton = ({ onPress }) => {
    return (
        <View style={Style.buttonContainer}>
            <TouchableOpacity onPress={onPress} accessibilityLabel={"moveToNext"}>
                <View style={Style.buttonBottom}>
                    <Image
                        style={Style.buttonBottomImage}
                        source={require("@assets/icons/ic_arrow_down.png")}
                    />
                </View>
            </TouchableOpacity>
        </View>
    );
};

const Style = {
    buttonContainer: {},
    buttonBottom: {
        justifyContent: "center",
        flexDirection: "column",
    },
    buttonBottomImage: {
        width: 90,
        height: 90,
        borderRadius: 90 / 2,
    },
};
export { DownLeftButton };
