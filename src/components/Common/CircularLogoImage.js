import React from "react";
import { View, Image } from "react-native";
import { WHITE } from "@constants/colors";
import DynamicImageTransfer from "@components/Others/DynamicImageTransfer";
const ICON_SHADOW = "rgba(0, 0, 0, 0.2)";

const CircularLogoImage = ({ source = "", isLocal }) => (
    <View>
        {isLocal ? (
            <View
                style={Styles.imageView}
                testID={"btnEditAmount"}
                accessibilityLabel={"btnEditAmount"}
            >
                <Image
                    style={Styles.image}
                    resizeMethod="resize"
                    resizeMode="stretch"
                    source={source}
                />
            </View>
        ) : (
            <DynamicImageTransfer item={source} />
        )}
    </View>
);

const Styles = {
    imageView: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 40,
        height: 80,
        justifyContent: "center",
        padding: 2,
        shadowColor: ICON_SHADOW,
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 1,
        shadowRadius: 15,
        width: 80,
    },
    image: {
        borderRadius: 40,
        height: 80,
        width: 80,
    },
};

export default CircularLogoImage;
