import PropTypes from "prop-types";
import { StyleSheet, View } from 'react-native';
import React from 'react';
import Typo from "@components/Text";

import { GREY_DARK, DARK_GREY } from "@constants/colors";

const FacilitiesRow = ({ text }) => {
    if (text.length === 0) return <></>;

    return (
        <View style={styles.metaViewCls}>
            <View style={styles.circularView} />
            <Typo lineHeight={22} textAlign="left" text={text} color={GREY_DARK} />
        </View>
    );
};

FacilitiesRow.propTypes = {
    text: PropTypes.string,
};

const styles = StyleSheet.create({
    metaViewCls: {
        flexDirection: "row",
        marginTop: 8,
    },

    circularView: {
        backgroundColor: DARK_GREY,
        borderRadius: 2,
        height: 4,
        marginHorizontal: 8,
        marginTop: 10,
        width: 4,
    },
});

export default FacilitiesRow;
