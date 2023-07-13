import React from "react";
import { Text, View, Image, TouchableWithoutFeedback } from "react-native";
import { StyleSheet } from "react-native";

const ImageTextButton = ({ text, showText, onPress }) => {
    return (
        <TouchableWithoutFeedback onPress={onPress}>
            <View style={styles.MainContainer}>
                <Image
                    style={styles.ImageStyle}
                    source={require("@assets/icons/ic_map_locator_104.png")}
                />
                <Text style={[styles.buttonTextStyle]}>{text}</Text>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    MainContainer: {
        marginTop: 50,
        marginLeft: 30,
        //  backgroundColor:'red',
        height: 60,
        width: 300,
    },
    roundButtonStyle: {
        backgroundColor: "#fdd835",
        borderRadius: 15,
        borderWidth: 1,
        borderColor: "#fdd835",
        marginLeft: 0,
    },
    buttonTextStyle: {
        fontSize: 25,
        marginLeft: 80,
        marginTop: 15,
        color: "#000",
    },
    ImageStyle: {
        marginLeft: 10,
        position: "absolute",
        width: 60,
        height: 60,
    },
});
export { ImageTextButton };
