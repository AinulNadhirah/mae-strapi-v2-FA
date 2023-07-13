import PropTypes from "prop-types";
import React from "react";
import { Image, StyleSheet, View } from "react-native";

import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { WHITE } from "@constants/colors";

const S2UInfoCard = ({ img, title, desc }) => {
    return (
        <View style={styles.container}>
            <Image source={img} style={styles.icon} />
            <SpaceFiller width={10} />
            <View style={styles.subContainer}>
                <Typo
                    fontSize={14}
                    fontWeight="semi-bold"
                    textAlign="left"
                    lineHeight={24}
                    text={title}
                />
                <Typo fontSize={14} fontWeight="300" textAlign="left" lineHeight={20} text={desc} />
            </View>
        </View>
    );
};

S2UInfoCard.propTypes = {
    img: PropTypes.string,
    title: PropTypes.string,
    desc: PropTypes.string,
};

S2UInfoCard.defaultProps = {
    img: "",
    title: "",
    desc: "",
};

export default S2UInfoCard;

const styles = StyleSheet.create({
    container: {
        backgroundColor: WHITE,
        borderRadius: 8,
        flexDirection: "row",
        padding: 12,
    },
    icon: {
        height: 35,
        width: 35,
    },
    subContainer: {
        flex: 1,
    },
});
