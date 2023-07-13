import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";

import Typo from "@components/Text";

import { BLACK, TRANSPARENT, WHITE } from "@constants/colors";

const CardTemplate = ({ title, desc, image, from, onPress }) => {
    const onBtnPress = (key) => {
        console.log("[CardTemplate] >> [onBtnPress]");
        onPress(key);
    };

    return (
        <TouchableOpacity
            style={styles.itemOuterCls}
            onPress={() => {
                onBtnPress(from);
            }}
        >
            <View style={styles.leftItemCls}>
                <View style={styles.carmImageView}>
                    <Image source={image} />
                </View>
            </View>
            <View style={styles.rightItemCls}>
                <Typo
                    fontSize={13}
                    lineHeight={18}
                    fontWeight="600"
                    textAlign="left"
                    text={title}
                />
                <Typo
                    fontSize={15}
                    lineHeight={23}
                    fontWeight="400"
                    textAlign="left"
                    text={desc}
                    style={styles.descLabelCls}
                />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    itemOuterCls: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        overflow: "visible",
        backgroundColor: WHITE,
        borderWidth: 1,
        borderRadius: 11,
        shadowColor: BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
        marginTop: 23,
        paddingVertical: 15,
        paddingRight: 15,
        borderColor: TRANSPARENT,
    },
    leftItemCls: {
        width: "25%",
        justifyContent: "center",
        alignItems: "center",
    },
    carmImageView: {
        height: 46,
        width: 46,
    },
    rightItemCls: {
        width: "75%",
        justifyContent: "flex-start",
        alignItems: "flex-start",
    },
    descLabelCls: {
        marginTop: 3,
    },
});

CardTemplate.propTypes = {
    title: PropTypes.string.isRequired,
    desc: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    from: PropTypes.string,
    onPress: PropTypes.func.isRequired,
};

CardTemplate.defaultProps = {
    title: "",
    desc: "",
    image: "",
    from: "",
    onPress: () => {},
};

export { CardTemplate };
