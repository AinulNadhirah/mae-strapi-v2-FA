import React from "react";
import PropTypes from "prop-types";
import { View, Image, TouchableOpacity, TouchableWithoutFeedback } from "react-native";

const BillCircular = ({ onPress, source, base64 = false }) => {
    //const { text } = data;

    return (
        <TouchableWithoutFeedback style={styles.avatarLayout} onPress={onPress}>
            {base64 ? (
                <Image
                    accessible={true}
                    testID={"billImage"}
                    accessibilityLabel={"billImage"}
                    style={styles.avatar}
                    source={{ uri: "data:image/jpeg;base64," + source }}
                />
            ) : (
                <Image
                    accessible={true}
                    testID={"billImage"}
                    accessibilityLabel={"billImage"}
                    style={styles.avatar}
                    source={source}
                    resizeMode="contain"
                    // source={require("@assets/icons/ic_avatar_200.png")}
                />
            )}
        </TouchableWithoutFeedback>
    );
};

const styles = {
    avatarLayout: {
        width: 70,
        height: 70,
        flexDirection: "column",
        borderRadius: 70 / 2,
        backgroundColor: "red",
        //  backgroundColor:'transparent',
        alignItems: "center",
        justifyContent: "center",
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 70 / 2,
    },
};
export { BillCircular };
