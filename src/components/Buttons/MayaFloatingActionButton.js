import React from "react";
import { TouchableOpacity, StyleSheet, Image } from "react-native";
import PropTypes from "prop-types";
import { BLACK } from "@constants/colors";

const MayaFloatingActionButton = ({ onPress, ...props }) => (
    <TouchableOpacity onPress={onPress} {...props} style={styles.container}>
        <Image style={styles.image} source={require("@assets/icons/maya_icon.jpg")} />
    </TouchableOpacity>
);

const WHITE = "#fff";

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        borderColor: WHITE,
        borderRadius: 32,
        borderWidth: 2,
        bottom: 16,
        elevation: 5,
        height: 64,
        justifyContent: "center",
        position: "absolute",
        right: 16,
        shadowColor: BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        width: 64,
    },
    image: {
        borderRadius: 31,
        height: 62,
        width: 62,
    },
});

MayaFloatingActionButton.propTypes = {
    onPress: PropTypes.func.isRequired,
};

const Memoiz = React.memo(MayaFloatingActionButton);

export default Memoiz;
