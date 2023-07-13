import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, Image, TouchableOpacity } from "react-native";

import Typo from "@components/Text";

import { ROYAL_BLUE } from "@constants/colors";

import Assets from "@assets";

export default function MerchantListingLocationHeader({ onPress, label }) {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <Image style={styles.img} source={Assets.iconGreyLocation} />
            <Typo
                fontSize={12}
                lineHeight={19}
                fontWeight="600"
                color={ROYAL_BLUE}
                text={label}
                numberOfLines={1}
            />
        </TouchableOpacity>
    );
}
MerchantListingLocationHeader.propTypes = {
    onPress: PropTypes.func,
    label: PropTypes.string,
};

const styles = StyleSheet.create({
    container: {
        alignItems: "flex-end",
        alignSelf: "center",
        flexDirection: "row",
        paddingBottom: 7,
        paddingHorizontal: 5,
    },
    img: {
        height: 16,
        marginRight: 7,
        width: 16,
    },
});
