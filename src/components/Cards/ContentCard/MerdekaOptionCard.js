import PropTypes from "prop-types";
import React, { useCallback } from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";

import Typo from "@components/Text";

import { BLACK, WHITE, MILD_RED } from "@constants/colors";

const MerdekaOptionCard = ({
    title,
    description,
    image,
    fullWidth,
    iconStyle,
    onCardPressed,
    value,
}) => {
    const onSubmit = useCallback(() => onCardPressed(value));
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={onSubmit} activeOpacity={0.9}>
                <View style={fullWidth ? styles.itemViewFull : styles.itemView}>
                    <Image source={image} style={[styles.applyIcon, iconStyle]} />
                    <View>
                        <Typo
                            color={BLACK}
                            fontSize={11}
                            fontWeight="700"
                            lineHeight={14}
                            style={iconStyle ? styles.titleWithExtraMargin : styles.title}
                            text={title}
                        />
                        <Typo
                            color={BLACK}
                            fontSize={10}
                            fontWeight="500"
                            lineHeight={14}
                            text={description}
                            style={
                                iconStyle ? styles.descriptionWithExtraMargin : styles.description
                            }
                        />
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};
MerdekaOptionCard.propTypes = {
    onCardPressed: PropTypes.func.isRequired,
    fullWidth: PropTypes.bool,
    value: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    image: PropTypes.number,
    iconStyle: PropTypes.any,
};
MerdekaOptionCard.defaultProps = {
    onCardPressed: () => {},
    image: null,
    fullWidth: false,
    value: " ",
    title: " ",
    description: " ",
    iconStyle: " ",
};
const styles = StyleSheet.create({
    applyIcon: {
        height: 35,
        marginLeft: 12,
        marginTop: 17,
        width: 35,
    },
    container: {
        flex: 1,
    },
    description: {
        marginLeft: 3,
        marginTop: 0,
        textAlign: "left",
    },
    descriptionWithExtraMargin: {
        marginLeft: 6,
        marginTop: 0,
        textAlign: "left",
    },
    itemView: {
        backgroundColor: WHITE,
        borderBottomWidth: 6,
        borderColor: MILD_RED,
        borderLeftWidth: 2,
        borderRadius: 15,
        borderRightWidth: 2,
        borderStyle: "solid",
        borderTopWidth: 2,
        flexDirection: "row",
        height: 88,
        marginRight: 10,
    },
    itemViewFull: {
        backgroundColor: WHITE,
        borderBottomWidth: 6,
        borderColor: MILD_RED,
        borderLeftWidth: 2,
        borderRadius: 15,
        borderRightWidth: 2,
        borderStyle: "solid",
        borderTopWidth: 2,
        flexDirection: "row",
        height: 70,
        marginRight: 10,
    },
    title: {
        marginLeft: 3,
        marginTop: 17,
        textAlign: "left",
    },
    titleWithExtraMargin: {
        marginLeft: 6,
        marginTop: 17,
        textAlign: "left",
    },
});
export default MerdekaOptionCard;
