import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";

import Typo from "@components/Text";

import { BLUE, WHITE } from "@constants/colors";

const CustomizePlanCard = ({ onPress, title, image, description, value }) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <Typo text={title} fontSize={16} fontWeight="600" lineHeight={22} textAlign="left" />
            <View style={styles.subcontainer}>
                <Image source={image} style={styles.image} />
                {!!value ? (
                    <Typo
                        text={value}
                        fontSize={14}
                        fontWeight="600"
                        textAlign="left"
                        lineHeight={18}
                        color={BLUE}
                    />
                ) : (
                    <Typo
                        text={description}
                        fontSize={14}
                        fontWeight="400"
                        textAlign="left"
                        lineHeight={18}
                    />
                )}
            </View>
        </TouchableOpacity>
    );
};

CustomizePlanCard.propTypes = {
    onPress: PropTypes.func,
    title: PropTypes.string,
    image: PropTypes.number,
    description: PropTypes.string,
    value: PropTypes.string,
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: WHITE,
        borderRadius: 8,
        marginTop: 20,
        padding: 24,
        shadowOffset: {
            shadowColor: "rgba(0, 0, 0, 0.8)",
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.25,
    },
    image: {
        height: 50,
        marginRight: 20,
        resizeMode: "contain",
        width: 50,
    },
    subcontainer: {
        alignItems: "center",
        flexDirection: "row",
        marginRight: 60,
        paddingTop: 20,
    },
});

export default CustomizePlanCard;
