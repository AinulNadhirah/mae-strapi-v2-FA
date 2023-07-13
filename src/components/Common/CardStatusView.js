import React from "react";
import { TouchableOpacity, View, Text, Image, ImageBackground } from "react-native";
import { MyView } from "./MyView";

const getImg = (type) => {
    let casaImg = require("@assets/icons/ic_maybank_casa_small.png");
    let visaImg = require("@assets/icons/ic_maybank_visa_small.png");

    let returnVal;

    switch (type) {
        case "visa":
            returnVal = visaImg;
            break;
        default:
            returnVal = casaImg;
    }

    return returnVal;
};

const CardStatusView = ({ status = 0, source = "", type = "" }) => {
    return (
        <View style={Styles.cardsView}>
            <ImageBackground
                style={[Styles.cardImageSmall1]}
                resizeMode="center"
                source={source.length > 0 ? source : getImg(type)}
            />
            <MyView hide={status == 0} style={Styles.iconView}>
                <Image
                    style={Styles.button}
                    source={
                        status == 1
                            ? require("@assets/icons/ic_done_green.png")
                            : require("@assets/icons/ic_error_msg.png")
                    }
                ></Image>
            </MyView>
        </View>
    );
};

const Styles = {
    cardsView: {},
    iconView: {
        position: "absolute",
    },
    cardImageSmall1: {
        width: 85,
        height: 60,
    },
    button: {
        height: 18,
        width: 18,
        marginLeft: 70,
        marginTop: 30,
    },
};
export { CardStatusView };
